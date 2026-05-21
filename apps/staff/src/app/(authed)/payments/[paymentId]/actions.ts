"use server"

import { randomUUID } from "node:crypto"
import { revalidatePath } from "next/cache"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { db } from "@repo/db"
import { eq } from "@repo/db/orm"
import { file, payment, paymentSlip, paymentSlipStatusEnum, paymentStatusEnum } from "@repo/db/schema"

import { S3 } from "@/lib/files"
import { logEventToWebhook } from "@/lib/discord-webhook"
import { auth } from "@repo/auth"
import { headers } from "next/headers"
import { AuthenticationError } from "@/lib/errors"

export type OverrideSlipActionResult =
	| { success: true }
	| { success: false; error: string }

export async function overridePaymentSlipAction(
	paymentId: string,
	formData: FormData,
): Promise<OverrideSlipActionResult> {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session) {
		throw new AuthenticationError()
	}
	const slipFile = formData.get("slip") as File | null

	if (!slipFile || slipFile.size === 0) {
		return { success: false, error: "No slip file provided." }
	}

	const [paymentRow] = await db
		.select({ id: payment.id, status: payment.status })
		.from(payment)
		.where(eq(payment.id, paymentId))
		.limit(1)

	if (!paymentRow) {
		return { success: false, error: "Payment not found." }
	}

	const [existingSlip] = await db
		.select({ id: paymentSlip.id })
		.from(paymentSlip)
		.where(eq(paymentSlip.paymentId, paymentId))
		.limit(1)

	if (existingSlip) {
		return { success: false, error: "A payment slip is already attached to this payment." }
	}

	const fileBuffer = Buffer.from(await slipFile.arrayBuffer())
	const fileId = randomUUID()
	const safeFileName = slipFile.name.replace(/[^a-zA-Z0-9._-]/g, "_")
	const fileKey = `slips/${paymentId}/${fileId}-${safeFileName}`

	try {
		await S3.send(
			new PutObjectCommand({
				Bucket: process.env.S3_BUCKET_NAME,
				Key: fileKey,
				Body: fileBuffer,
				ContentType: slipFile.type || "application/octet-stream",
			}),
		)
	} catch (err) {
		console.error("R2 upload error:", err)
		return { success: false, error: "Failed to upload slip file to storage." }
	}

	try {
		const { payment: [updatedPayment], paymentSlip: [insertedSlip] } = await db.transaction(async (tx) => {
			await tx.insert(file).values({
				id: fileId,
				mimeType: slipFile.type || "application/octet-stream",
				size: slipFile.size,
				fileKey,
				fileName: slipFile.name,
			})

			const [insertedSlip] = await tx.insert(paymentSlip).values({
				id: randomUUID(),
				paymentId,
				transRef: `OVERRIDE-${randomUUID()}`,
				amount: "0",
				senderName: null,
				transDate: null,
				transTime: null,
				sendingBank: null,
				slipImage: fileId,
				rawResponse: { overriddenByAdmin: true },
				status: paymentSlipStatusEnum.enumValues[1],
				verifiedAt: new Date(),
			}).returning()

			const updatedPayment = await tx
				.update(payment)
				.set({ status: paymentStatusEnum.enumValues[1] })
				.where(eq(payment.id, paymentId))
				.returning()

			return { payment: updatedPayment, paymentSlip: [insertedSlip] }
		})

		void logEventToWebhook(
			`Payment Success (Override by ${session.user.name})`,
			`Details\nPaymentID: ${paymentId}\nName: ${updatedPayment.payerName}\nEmail:${updatedPayment.payerEmail}\nPrice: ${updatedPayment.price}\nSlipTransactionTimestamp: ${insertedSlip.verifiedAt ? (insertedSlip.verifiedAt).toISOString() : 'unknown'}\nSendingBank: N/A\nSenderName: N/A\nGroup: ${updatedPayment.productName}`,
			`https://famstaff.cpesu.com/payments/${paymentId}`,
		)
	} catch (err) {
		console.error("DB transaction error:", err)
		return { success: false, error: "Failed to save slip and update payment status." }
	}

	revalidatePath(`/payments/${paymentId}`)
	return { success: true }
}
