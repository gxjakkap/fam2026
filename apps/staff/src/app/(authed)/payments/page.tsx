import { db } from "@repo/db"
import { desc } from "@repo/db/orm"
import { payment } from "@repo/db/schema"

export const dynamic = "force-dynamic"

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"

import { PaymentsTable } from "./payments-table"

export default async function PaymentsPage() {
	const payments = await db
		.select({
			id: payment.id,
			payerName: payment.payerName,
			payerEmail: payment.payerEmail,
			productName: payment.productName,
			price: payment.price,
			status: payment.status,
			createdAt: payment.createdAt,
		})
		.from(payment)
		.orderBy(desc(payment.createdAt))

	const paymentRows = payments.map((item) => ({
		...item,
		createdAt: item.createdAt.toISOString(),
	}))

	return (
		<div className="container mx-auto px-6 py-8">
			<Card>
				<CardHeader>
					<CardTitle className="text-2xl">Payments</CardTitle>
					<CardDescription>
						All payment records and current status.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<PaymentsTable payments={paymentRows} />
				</CardContent>
			</Card>
		</div>
	)
}
