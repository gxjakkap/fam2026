"use server"

import { randomUUID } from "node:crypto"
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { db } from "@repo/db"
import { eq } from "@repo/db/orm"
import { file, payment, paymentSlip, paymentSlipStatusEnum, paymentStatusEnum } from "@repo/db/schema"
import { isBefore } from "date-fns"
import { logEventToWebhook } from "@/lib/discord-webhook"
import { SlipUploadActionError, type SlipUploadActionRes } from "./types"

enum SlipVerifyError {
	InvalidSlipOrQr = 0,
	RateLimitError = 1,
	UnknownError = 2,
}

interface SlipVerifySuccess {
	success: true
	data: {
		transRef: string
		amount: string
		sendingBank: string
		senderName: string
		receivingProxy: string
		transDate: string
		transTime: string
		raw: unknown
	}
}

interface SlipVerifyFailure {
	success: false
	err: SlipVerifyError
}

type SlipVerifyResult = SlipVerifySuccess | SlipVerifyFailure

const verifySlip = async (
	data: { payload?: string; file?: File | Buffer },
	amount: number,
): Promise<SlipVerifyResult> => {
	const endpoint = "https://suba.rdcw.co.th/v2/inquiry"

	console.log("RDCW config:", {
		hasClientId: !!process.env.RDCW_CLIENT_ID,
		hasClientSecret: !!process.env.RDCW_CLIENT_SECRET,
		hasEndpoint: !!endpoint,
		useFile: !!data.file,
	})

	// biome-ignore lint/suspicious/noImplicitAnyLet: <>
	let res
	try {
		const headers: Record<string, string> = {
			Authorization: `Basic ${btoa(`${process.env.RDCW_CLIENT_ID}:${process.env.RDCW_CLIENT_SECRET}`)}`,
		}

		// biome-ignore lint/suspicious/noExplicitAny: <>
		let body: any
		if (data.file) {
			const formData = new FormData()
			if (data.file instanceof File) {
				formData.append("file", data.file)
			} else {
				// Buffer
				formData.append("file", new Blob([new Uint8Array(data.file)]), "slip.jpg")
			}
			body = formData
			// Fetch will set the correct Content-Type with boundary for FormData
		} else {
			headers["Content-Type"] = "application/json"
			body = JSON.stringify({ payload: data.payload })
		}

		res = await fetch(endpoint, {
			method: "POST",
			headers,
			body,
		})
	} catch (fetchErr) {
		console.error("RDCW fetch error:", fetchErr)
		return { success: false, err: SlipVerifyError.UnknownError }
	}

	console.log("RDCW response status:", res.status)

	if (!res.ok) {
		const errorBody = await res.json().catch(() => null)
		console.log("RDCW error response:", { status: res.status, errorBody })

		const code = errorBody?.code ?? errorBody?.error?.code

		if (code >= 1004 && code <= 1006) {
			console.log("RDCW code 1004-1006: Invalid slip or QR")
			return { success: false, err: SlipVerifyError.InvalidSlipOrQr }
		}
		if (code === 1007) {
			console.log("RDCW code 1007: Rate limited")
			return { success: false, err: SlipVerifyError.RateLimitError }
		}
		console.log("RDCW unhandled code:", code)
		return { success: false, err: SlipVerifyError.UnknownError }
	}

	const body = await res.json()

	console.log("RDCW valid:", body.valid, "data:", body.data)

	if (!body.valid) {
		console.log("RDCW not valid, raw body:", body)
		return { success: false, err: SlipVerifyError.InvalidSlipOrQr }
	}

	const dataRes = body.data
	console.log("RDCW data amount:", dataRes?.amount)
	const returnedAmount = parseFloat(dataRes?.amount)

	if (returnedAmount !== amount) {
		return { success: false, err: SlipVerifyError.InvalidSlipOrQr }
	}

	return {
		success: true,
		data: {
			transRef: dataRes.transRef,
			amount: String(dataRes.amount),
			sendingBank: dataRes.sendingBank,
			senderName: dataRes.sender?.displayName ?? dataRes.sender?.name ?? "",
			receivingProxy: dataRes.receiver?.proxy?.value ?? "",
			transDate: dataRes.transDate ?? "",
			transTime: dataRes.transTime ?? "",
			raw: body,
		},
	}
}

export async function slipUploadAction(slipFile: File, paymentId: string): Promise<SlipUploadActionRes> {
	console.log(">>> ACTION START: slipUploadAction", { paymentId, fileName: slipFile?.name, fileSize: slipFile?.size })

	const [row] = await db.select().from(payment).where(eq(payment.id, paymentId)).limit(1)

	if (!row) {
		console.log("Payment not found:", paymentId)
		void logEventToWebhook(`Payment Error`, `Error: PaymentIDNotFound\n\nDetails\nPaymentID: ${paymentId}`)
		return { status: 400, err: SlipUploadActionError.ForbiddenError }
	}

	const fileBuffer = Buffer.from(await slipFile.arrayBuffer())

	// Use RDCW direct image inquiry
	const slipVerifyResult = await verifySlip({ file: slipFile }, parseFloat(row.price))

	console.log("Slip verify result:", { paymentId, success: slipVerifyResult.success })

	if (!slipVerifyResult.success) {
		if (slipVerifyResult.err === SlipVerifyError.InvalidSlipOrQr) {
			void logEventToWebhook(
				`Payment Error`,
				`Error: ProviderInvalidSlipError\n\nDetails\nPaymentID: ${paymentId}\nName: ${row.payerName}\nEmail:${row.payerEmail}\nPrice: ${row.price}`,
			)
			return { status: 400, err: SlipUploadActionError.InvalidSlip }
		} else if (slipVerifyResult.err === SlipVerifyError.RateLimitError) {
			void logEventToWebhook(`Payment Error`, `Error: ProviderRateLimitError\n\nTime to top up ig.`)
			return { status: 429, err: SlipUploadActionError.ProviderRateLimited }
		} else {
			void logEventToWebhook(
				`Payment Error`,
				`Error: ProviderUnknownError\n\nDetails\nPaymentID: ${paymentId}\nName: ${row.payerName}\nEmail:${row.payerEmail}\nPrice: ${row.price}\nError: ${slipVerifyResult.err.toString()}`,
			)
			return { status: 500, err: SlipUploadActionError.UnknownError }
		}
	}

	// check transaction time
	const [y, m, d] = [
		slipVerifyResult.data.transDate.slice(0, 4),
		slipVerifyResult.data.transDate.slice(4, 6),
		slipVerifyResult.data.transDate.slice(6, 8),
	]
	const transDateObj = new Date(`${y}-${m}-${d}T${slipVerifyResult.data.transTime}+07:00`)

	if (isBefore(transDateObj, row.createdAt)) {
		console.log("Slip was created before the payment:", { transDateObj, createdAt: row.createdAt })
		void logEventToWebhook(
			`Payment Error`,
			`Error: SlipDateInconsistentError\n\nDetails\nPaymentID: ${paymentId}\nName: ${row.payerName}\nEmail:${row.payerEmail}\nPrice: ${row.price}\nPaymentCreated: ${row.createdAt.toISOString()}\nSlipTransactionTimestamp: ${transDateObj.toISOString()}`,
		)
		return { status: 400, err: SlipUploadActionError.InvalidSlip }
	}

	// check for receiver
	const promptPayId = process.env.PROMPTPAY_ID || ""
	if (slipVerifyResult.data.receivingProxy.slice(-4) !== promptPayId.slice(-4)) {
		console.log("Receiver mismatch:", {
			received: slipVerifyResult.data.receivingProxy,
			expectedTail: promptPayId.slice(-4),
		})
		void logEventToWebhook(
			`Payment Error`,
			`Error: SlipReceiverMismatchError\n\nDetails\nPaymentID: ${paymentId}\nName: ${row.payerName}\nEmail:${row.payerEmail}\nPrice: ${row.price}\nSlipTransactionTimestamp: ${transDateObj.toISOString()}\nExpectedReceiver: ${process.env.PROMPTPAY_ID}\nReceiver(Last4): ${slipVerifyResult.data.receivingProxy}`,
		)
		return { status: 400, err: SlipUploadActionError.InvalidSlip }
	}

	// Upload slip image to S3
	const S3 = new S3Client({
		region: "auto",
		endpoint: process.env.S3_URL,
		credentials: {
			accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
			secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
		},
	})

	console.log("S3 config:", {
		endpoint: process.env.S3_URL,
		bucket: process.env.S3_BUCKET_NAME,
		hasAccessKey: !!process.env.S3_ACCESS_KEY_ID,
	})

	const fileId = randomUUID()
	const fileKey = `slips/${paymentId}/${fileId}-${slipFile.name}`

	try {
		await S3.send(
			new PutObjectCommand({
				Bucket: process.env.S3_BUCKET_NAME,
				Key: fileKey,
				Body: fileBuffer,
				ContentType: slipFile.type,
			}),
		)
	} catch {
		return { status: 500, err: SlipUploadActionError.SlipUploadError }
	}

	// Insert file record and payment slip record, then update payment status
	try {
		await db.transaction(async (tx) => {
			await tx.insert(file).values({
				id: fileId,
				mimeType: slipFile.type,
				size: slipFile.size,
				fileKey: fileKey,
				fileName: slipFile.name,
			})

			await tx.insert(paymentSlip).values({
				id: randomUUID(),
				paymentId: paymentId,
				transRef: slipVerifyResult.data.transRef,
				amount: slipVerifyResult.data.amount,
				senderName: slipVerifyResult.data.senderName || null,
				transDate: slipVerifyResult.data.transDate || null,
				transTime: slipVerifyResult.data.transTime || null,
				sendingBank: slipVerifyResult.data.sendingBank || null,
				slipImage: fileId,
				rawResponse: slipVerifyResult.data.raw,
				status: paymentSlipStatusEnum.enumValues[1],
			})

			await tx.update(payment).set({ status: paymentStatusEnum.enumValues[1] }).where(eq(payment.id, paymentId))
		})
		void logEventToWebhook(
			`Payment Success`,
			`Details\nPaymentID: ${paymentId}\nName: ${row.payerName}\nEmail:${row.payerEmail}\nPrice: ${row.price}\nSlipTransactionTimestamp: ${transDateObj.toISOString()}\nSendingBank: ${slipVerifyResult.data.sendingBank}\nSenderName: ${slipVerifyResult.data.senderName}\nPrice: ${row.price}\nGroup: ${row.productName}`,
			`https://famstaff.cpesu.com/payment/${paymentId}`,
		)
	} catch (e) {
		console.error("DB transaction error:", e)
		return { status: 500, err: SlipUploadActionError.UnknownError }
	}

	return { status: 200 }
}
