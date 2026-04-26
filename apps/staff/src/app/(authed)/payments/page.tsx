import Link from "next/link"

import { db } from "@repo/db"
import { desc } from "@repo/db/orm"
import { payment } from "@repo/db/schema"

export const dynamic = "force-dynamic"

import { PaymentStatusBadge } from "@/components/payment-status-badge"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"

export default async function PaymentsPage() {
	const payments = await db
		.select({
			id: payment.id,
			payerName: payment.payerName,
			productName: payment.productName,
			price: payment.price,
			status: payment.status,
		})
		.from(payment)
		.orderBy(desc(payment.id))

	const formatCurrency = (value: string) => {
		const parsed = Number(value)
		if (Number.isNaN(parsed)) {
			return value
		}
		return new Intl.NumberFormat("th-TH", {
			style: "currency",
			currency: "THB",
			minimumFractionDigits: 2,
		}).format(parsed)
	}

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
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Payment ID</TableHead>
								<TableHead>Payer</TableHead>
								<TableHead>Product</TableHead>
								<TableHead>Status</TableHead>
								<TableHead className="text-right">Price</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{payments.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={5}
										className="text-muted-foreground py-10 text-center"
									>
										No payments found.
									</TableCell>
								</TableRow>
							) : (
								payments.map((item) => (
									<TableRow key={item.id}>
										<TableCell>
											<Link
												href={`/payments/${item.id}`}
												className="text-primary font-medium underline-offset-4 hover:underline"
											>
												{item.id}
											</Link>
										</TableCell>
										<TableCell>{item.payerName}</TableCell>
										<TableCell>{item.productName}</TableCell>
										<TableCell>
											<PaymentStatusBadge status={item.status} />
										</TableCell>
										<TableCell className="text-right">
											{formatCurrency(item.price)}
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	)
}
