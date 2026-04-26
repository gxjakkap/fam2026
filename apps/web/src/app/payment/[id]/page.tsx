"use server"

import { db } from "@repo/db"
import { and, eq } from "@repo/db/orm"
import { payment, paymentStatusEnum } from "@repo/db/schema"
import { notFound } from "next/navigation"

import { PaymentPay } from "@/components/payment/pay"

type Props = {
	params: Promise<{ id: string }>
}

export default async function PaymentPage({ params }: Props) {
	const id = (await params).id
	const [data] = await db
		.select()
		.from(payment)
		.where(and(eq(payment.id, id), eq(payment.status, paymentStatusEnum.enumValues[0])))
		.limit(1)

	if (!data) notFound()

	const qrLink = `https://promptpay.io/${process.env.PROMPTPAY_ID}/${data.price}.png`

	return (
		<PaymentPay
			paymentId={id}
			qrLink={qrLink}
			payerName={data.payerName ?? "นักศึกษาวิศวกรรมคอมพิวเตอร์"}
			productName={data.productName}
			displayPrice={`฿${data.price}`}
			promptpayInfo={`Promptpay: ${process.env.PROMPTPAY_ID}`}
		/>
	)
}
