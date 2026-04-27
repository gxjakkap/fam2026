import Link from "next/link"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

import { db } from "@repo/db"
import { eq } from "@repo/db/orm"
import { file, payment, paymentSlip } from "@repo/db/schema"

import BackwardButton from "@/components/backward-button"
import { PaymentStatusBadge } from "@/components/payment-status-badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { BankDict } from "@/lib/const"
import { getPresignedURL } from "@/lib/files"

interface PaymentDetailPageProps {
	params: Promise<{
		paymentId: string
	}>
}

type PaymentDetailItemProps = {
	label: string
	value: string
}

function PaymentDetailItem({ label, value }: PaymentDetailItemProps) {
	return (
		<div className="grid grid-cols-1 gap-1 text-sm sm:grid-cols-[180px_1fr] sm:gap-4">
			<p className="text-muted-foreground font-medium">{label}</p>
			<p className="text-foreground break-words">{value}</p>
		</div>
	)
}

export default async function PaymentDetailPage({ params }: PaymentDetailPageProps) {
	const { paymentId } = await params

	const [paymentRecord] = await db
		.select({
			id: payment.id,
			status: payment.status,
			price: payment.price,
			payerName: payment.payerName,
			productName: payment.productName,
		})
		.from(payment)
		.where(eq(payment.id, paymentId))
		.limit(1)

	if (!paymentRecord) {
		notFound()
	}

	const [slipRecord] = await db
		.select({
			id: paymentSlip.id,
			transRef: paymentSlip.transRef,
			amount: paymentSlip.amount,
			senderName: paymentSlip.senderName,
			transDate: paymentSlip.transDate,
			transTime: paymentSlip.transTime,
			sendingBank: paymentSlip.sendingBank,
			status: paymentSlip.status,
			verifiedAt: paymentSlip.verifiedAt,
			slipImage: paymentSlip.slipImage,
			rawResponse: paymentSlip.rawResponse,
		})
		.from(paymentSlip)
		.where(eq(paymentSlip.paymentId, paymentId))
		.limit(1)

	const [slipFileRecord] = slipRecord
		? await db
				.select({
					id: file.id,
					fileName: file.fileName,
					fileKey: file.fileKey,
					mimeType: file.mimeType,
					size: file.size,
				})
				.from(file)
				.where(eq(file.id, slipRecord.slipImage))
				.limit(1)
		: []

	const slipPreviewUrl = slipFileRecord ? await getPresignedURL(slipFileRecord.fileKey) : null

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

	const formatDateTime = (value?: Date | null) => {
		if (!value) {
			return "-"
		}
		return new Intl.DateTimeFormat("th-TH", {
			dateStyle: "medium",
			timeStyle: "short",
		}).format(value)
	}

	const formatDate = (value?: string | null) => {
		if (!value) {
			return "-"
		}
		return new Intl.DateTimeFormat("th-TH", {
			dateStyle: "medium",
		}).format(new Date(value))
	}

	const slipRawResponse = slipRecord?.rawResponse ? JSON.stringify(slipRecord.rawResponse, null, 2) : null

	return (
		<div className="container mx-auto space-y-6 px-6 py-8">
			<div className="flex items-center gap-3">
				<BackwardButton />
				<div>
					<h1 className="text-2xl font-bold">Payment {paymentRecord.id}</h1>
					<p className="text-muted-foreground text-sm">View payment and slip details.</p>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Payment information</CardTitle>
					<CardDescription>Core record from payment table.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<PaymentDetailItem label="Payment ID" value={paymentRecord.id} />
					<div className="grid grid-cols-1 gap-1 text-sm sm:grid-cols-[180px_1fr] sm:gap-4">
						<p className="text-muted-foreground font-medium">Status</p>
						<div>
							<PaymentStatusBadge status={paymentRecord.status} />
						</div>
					</div>
					<PaymentDetailItem label="Price" value={formatCurrency(paymentRecord.price)} />
					<PaymentDetailItem label="Payer name" value={paymentRecord.payerName} />
					<PaymentDetailItem label="Product name" value={paymentRecord.productName} />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Payment slip</CardTitle>
					<CardDescription>
						{slipRecord ? "Slip record and uploaded file details." : "No payment slip is attached to this payment."}
					</CardDescription>
				</CardHeader>
				<CardContent>
					{!slipRecord ? (
						<p className="text-muted-foreground text-sm">No slip available.</p>
					) : (
						<div className="space-y-4">
							<PaymentDetailItem label="Slip ID" value={slipRecord.id} />
							<PaymentDetailItem label="Transaction reference" value={slipRecord.transRef} />
							<PaymentDetailItem label="Slip amount" value={formatCurrency(slipRecord.amount)} />
							<PaymentDetailItem label="Sender name" value={slipRecord.senderName ?? "-"} />
							<PaymentDetailItem label="Transaction date" value={formatDate(slipRecord.transDate)} />
							<PaymentDetailItem label="Transaction time" value={slipRecord.transTime ?? "-"} />
							<PaymentDetailItem
								label="Sending bank"
								value={slipRecord.sendingBank ? BankDict[slipRecord.sendingBank] : "-"}
							/>
							<PaymentDetailItem label="Slip status" value={slipRecord.status} />
							<PaymentDetailItem label="Verified at" value={formatDateTime(slipRecord.verifiedAt)} />

							{slipFileRecord ? (
								<>
									<Separator />
									<PaymentDetailItem label="File name" value={slipFileRecord.fileName} />
									<PaymentDetailItem label="MIME type" value={slipFileRecord.mimeType} />
									<PaymentDetailItem label="File size" value={`${slipFileRecord.size.toLocaleString("th-TH")} bytes`} />
									{slipPreviewUrl ? (
										<div className="grid grid-cols-1 gap-1 text-sm sm:grid-cols-[180px_1fr] sm:gap-4">
											<p className="text-muted-foreground font-medium">Slip preview</p>
											<div>
												<Link
													href={slipPreviewUrl}
													target="_blank"
													rel="noreferrer"
													className="text-primary font-medium underline-offset-4 hover:underline"
												>
													Open slip file
												</Link>
											</div>
										</div>
									) : null}
								</>
							) : null}

							{slipRawResponse ? (
								<>
									<Separator />
									<div className="space-y-2">
										<p className="text-muted-foreground text-sm font-medium">Raw response</p>
										<pre className="bg-muted max-h-80 overflow-auto rounded-md border p-3 text-xs">
											{slipRawResponse}
										</pre>
									</div>
								</>
							) : null}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	)
}
