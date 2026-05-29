"use server"

import { z } from "zod"

import { db } from "@repo/db"
import { payment, paymentStatusEnum } from "@repo/db/schema"

import { authenticatedAction } from "@/lib/safe-action"

export const createPaymentAction = authenticatedAction
	.createServerAction()
	.input(
		z.object({
			payer_name: z.string().min(1, "Payer name is required"),
			payer_email: z.string().email("Invalid email address"),
			product_name: z.string().min(1, "Product name is required"),
			price: z.number().positive("Price must be a positive number"),
		}),
	)
	.handler(async ({ input }) => {
		const { payer_name, payer_email, price, product_name } = input

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

		return {
			id: row.id,
			link: `https://family.cpesu.com/payment/${row.id}`,
		}
	})
