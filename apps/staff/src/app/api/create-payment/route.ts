import { db } from "@repo/db"
import { payment, paymentStatusEnum } from "@repo/db/schema"
import { z } from "zod"

import { auth } from "@/lib/auth"

const createPaymentBodySchema = z.object({
	payer_name: z.string(),
	payer_email: z.string().email(),
	product_name: z.string(),
	price: z.number().positive(),
})

export async function POST(req: Request) {
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
		return Response.json({ 
			message: apiKeyVerification?.error?.message ?? "Invalid API key" 
		}, { status: 401 })
	}

	const body = await req.json()
	const parsedBody = createPaymentBodySchema.safeParse(body)

	if (!parsedBody.success) {
		return Response.json({ message: "Invalid body", errors: parsedBody.error.issues }, { status: 400 })
	}

	const { payer_name, payer_email, price, product_name } = parsedBody.data

	const [row] = await db
		.insert(payment)
		.values({
			status: paymentStatusEnum.enumValues[0],
			price: price.toString(),
			payerName: payer_name,
			payerEmail: payer_email,
			productName: product_name,
		})
		.returning({ id: payment.id })

	return Response.json({
		link: `https://family.cpesu.com/payment/${row.id}`,
	})
}