"use server"

import { randomUUID } from "node:crypto"
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { db } from "@repo/db"
import { eq } from "@repo/db/orm"
import { file, payment, paymentSlip, paymentSlipStatusEnum, paymentStatusEnum } from "@repo/db/schema"
import { Jimp } from "jimp"
import jsQR from "jsqr"
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

const verifySlip = async (payload: string, amount: number): Promise<SlipVerifyResult> => {
	const endpoint = "https://suba.rdcw.co.th/v2/inquiry"

	console.log("RDCW config:", {
		hasClientId: !!process.env.RDCW_CLIENT_ID,
		hasClientSecret: !!process.env.RDCW_CLIENT_SECRET,
		hasEndpoint: !!endpoint,
	})

	// biome-ignore lint/suspicious/noImplicitAnyLet: <>
	let res
	try {
		res = await fetch(endpoint, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Basic ${btoa(`${process.env.RDCW_CLIENT_ID}:${process.env.RDCW_CLIENT_SECRET}`)}`,
			},
			body: JSON.stringify({ payload }),
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

	const data = body.data
	console.log("RDCW data amount:", data?.amount)
	const returnedAmount = parseFloat(data?.amount)

	if (returnedAmount !== amount) {
		return { success: false, err: SlipVerifyError.InvalidSlipOrQr }
	}

	return {
		success: true,
		data: {
			transRef: data.transRef,
			amount: data.amount,
			sendingBank: data.sendingBank,
			senderName: data.sender?.name ?? "",
			transDate: data.date ?? "",
			transTime: data.time ?? "",
			raw: body,
		},
	}
}

export async function slipUploadAction(slipFile: File, paymentId: string): Promise<SlipUploadActionRes> {
	const [row] = await db.select().from(payment).where(eq(payment.id, paymentId)).limit(1)

	if (!row) return { status: 400, err: SlipUploadActionError.ForbiddenError }

	const fileBuffer = Buffer.from(await slipFile.arrayBuffer())
	const image = await Jimp.read(fileBuffer)
	const { data: imageData, width: imageWidth, height: imageHeight } = image.bitmap
	const qrRes = jsQR(new Uint8ClampedArray(imageData), imageWidth, imageHeight)

	if (!qrRes) {
		return { status: 400, err: SlipUploadActionError.InvalidSlip }
	}

	const refNbr = qrRes.data
	const slipVerifyResult = await verifySlip(refNbr, parseFloat(row.price))

	console.log("Slip verify:", { refNbr, price: row.price, result: slipVerifyResult })

	if (!slipVerifyResult.success) {
		if (slipVerifyResult.err === SlipVerifyError.InvalidSlipOrQr)
			return { status: 400, err: SlipUploadActionError.InvalidSlip }
		else if (slipVerifyResult.err === SlipVerifyError.RateLimitError)
			return { status: 429, err: SlipUploadActionError.ProviderRateLimited }
		else return { status: 500, err: SlipUploadActionError.UnknownError }
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
	} catch (e) {
		console.error("DB transaction error:", e)
		return { status: 500, err: SlipUploadActionError.UnknownError }
	}

	return { status: 200 }
}
