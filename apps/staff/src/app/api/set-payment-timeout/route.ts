import { db } from "@repo/db"
import { inArray } from "@repo/db/orm"
import { payment, paymentStatusEnum } from "@repo/db/schema"
import z from "zod"
import { auth } from "@/lib/auth"

const setPaymentTimeoutBodySchema = z.object({
	list: z.array(z.string()),
})

export async function DELETE(req: Request) {
	const apiKey = req.headers.get("x-api-key")

	if (!apiKey) {
		return Response.json({ message: "API key required" }, { status: 401 })
	}

	const apiKeyVerification = await auth.api.verifyApiKey({
		body: {
			key: apiKey,
		},
	})

	if (!apiKeyVerification?.valid) {
		return Response.json(
			{
				message: apiKeyVerification?.error?.message ?? "Invalid API key",
			},
			{ status: 401 },
		)
	}

	const body = await req.json()
	const parsedBody = setPaymentTimeoutBodySchema.safeParse(body)

	if (!parsedBody.success) {
		return Response.json({ message: "Invalid body", errors: parsedBody.error.issues }, { status: 400 })
	}

	const { list } = parsedBody.data

	await db.update(payment).set({ status: paymentStatusEnum.enumValues[3] }).where(inArray(payment.id, list))

	return Response.json({
		status: 200,
	})
}
