import { db } from "@repo/db"
import { eq } from "@repo/db/orm"
import { payment, paymentStatusEnum } from "@repo/db/schema"

import { auth } from "@/lib/auth"

export async function GET(req: Request) {
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

	const data = await db
		.select({ id: payment.id })
		.from(payment)
		.where(eq(payment.status, paymentStatusEnum.enumValues[1]))

	const payed: string[] = []
	data.forEach((ea) => {
		payed.push(ea.id)
	})

	return Response.json({
		list: payed,
		updated: new Date(),
	})
}
