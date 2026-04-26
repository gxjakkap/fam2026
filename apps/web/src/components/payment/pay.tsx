/** biome-ignore-all lint/performance/noImgElement: <> */
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { CheckIcon, SpinnerIcon } from "@phosphor-icons/react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { slipUploadAction } from "@/app/payment/[id]/actions"
import { SlipUploadActionError } from "@/app/payment/[id]/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { SlipUpload } from "./upload-form"

interface PaymentPayProps {
	paymentId: string
	qrLink: string
	payerName: string
	productName: string
	displayPrice: string
	promptpayInfo: string
	onSuccess?: () => void
}

const slipUploadFormSchema = z.object({
	file: z
		.instanceof(File)
		.refine((file) => file.size <= 10 * 1024 * 1024, "Max image size is 10MB.")
		.refine(
			(file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
			"Only .jpg, .png, and .webp formats are supported.",
		),
})

type FormValues = z.infer<typeof slipUploadFormSchema>

export function PaymentPay({
	paymentId,
	qrLink,
	payerName,
	productName,
	displayPrice,
	promptpayInfo,
	onSuccess,
}: PaymentPayProps) {
	const [status, setStatus] = useState<"ready" | "loading" | "success" | "failed">("ready")
	const [errorMessage, setErrorMessage] = useState("")
	const [file, setFile] = useState<{ file: File; preview: string } | null>(null)

	const slipUploadForm = useForm<FormValues>({
		resolver: zodResolver(slipUploadFormSchema),
	})

	const onSubmit = async (values: FormValues) => {
		setStatus("loading")
		try {
			const res = await slipUploadAction(values.file, paymentId)
			if (res.status === 200) {
				setStatus("success")
				onSuccess?.()
			} else {
				setStatus("failed")
				switch (res.err) {
					case SlipUploadActionError.InvalidSlip:
						setErrorMessage(
							"สลิปผิดพลาดหรือไม่พบ QR Code สำหรับตรวจสอบ โปรดลองอีกครั้ง หากแน่ใจว่านี่คือข้อผิดพลาดของระบบโปรดติดต่อทีมงานที่ IG: cpe_studentunion",
						)
						break
					case SlipUploadActionError.ProviderRateLimited:
						setErrorMessage("Verification service is busy. Please try again in a moment.")
						break
					case SlipUploadActionError.SlipUploadError:
						setErrorMessage("อัปโหลดสลิปไม่สำเร็จ โปรดลองอีกครั้ง")
						break
					case SlipUploadActionError.ForbiddenError:
						setErrorMessage("ไม่พบการจ่ายเงินที่ยังไม่สำเร็จ หากนี่คือข้อผิดพลาดโปรดติดต่อทีมงานที่ IG: cpe_studentunion")
						break
					default:
						setErrorMessage(
							"เกิดข้อผิดพลาดบางอย่าง โปรดลองอีกครั้ง หากแน่ใจว่านี่คือข้อผิดพลาดของระบบโปรดติดต่อทีมงานที่ IG: cpe_studentunion",
						)
				}
			}
		} catch {
			setStatus("failed")
			setErrorMessage("An error occurred. Please try again.")
		}
	}

	return (
		<div className="container mx-auto max-w-md px-4 py-8">
			<Card>
				<CardHeader>
					<CardTitle className="text-center">{`คุณ${payerName} - ${productName}`}</CardTitle>
					<CardDescription className="text-center">{`#${paymentId.slice(0, 8)}`}</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<div className="text-center">
							<p className="text-lg font-medium">ยอดรวม</p>
							<p className="text-3xl font-bold">{displayPrice}</p>
						</div>
						<Separator />
						{/* Payment QR Image */}
						<div className="flex flex-col gap-y-2 justify-center items-center py-4">
							<img src="/Thai_QR_Logo.svg" alt="Thai QR Logo" className="h-14" />
							<img src={qrLink} alt="Payment QR" className="w-48 h-48 object-contain" />
						</div>
						<p className="text-center text-sm text-muted-foreground">สแกนจ่าย หรือ {promptpayInfo}</p>
						<Separator />
						{/* Slip Upload Form */}
						<form onSubmit={slipUploadForm.handleSubmit(onSubmit)} className="space-y-4">
							<div className="space-y-2">
								<SlipUpload
									file={file}
									setFile={(newFile) => {
										setFile(newFile)
										if (newFile) {
											slipUploadForm.setValue("file", newFile.file)
										} else {
											slipUploadForm.reset()
										}
									}}
								/>
								{slipUploadForm.formState.errors.file && (
									<p className="text-sm text-destructive">{slipUploadForm.formState.errors.file.message as string}</p>
								)}
							</div>
							<Button type="submit" className="w-full" disabled={status === "success" || status === "loading"}>
								{status === "loading" ? (
									<SpinnerIcon className="animate-spin mr-2" />
								) : status === "success" ? (
									<CheckIcon className="mr-2" />
								) : null}
								{status === "loading" ? "กำลังตรวจสอบ..." : status === "success" ? "สำเร็จ" : "ยืนยันการชำระเงิน"}
							</Button>
						</form>
					</div>
				</CardContent>
			</Card>
			<Dialog open={status === "success"}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle className="text-center">ชำระเงินสำเร็จ!</DialogTitle>
						<DialogDescription className="text-center">
							<div className="flex flex-col gap-4 pt-2">
								<div className="p-3 text-primary">
									<p className="text-sm font-semibold">อีเมลยืนยันการชำระเงินจะถูกส่งถึงคุณภายใน 10 นาที</p>
								</div>

								<div className="space-y-1">
									<div className="font-medium text-foreground">
										อย่าลืมเข้าร่วม <span className="text-green-600 font-bold">LINE Openchat</span>
									</div>
									<p className="text-sm">เพื่อติดตามข่าวสารการเดินทางและการนัดหมาย</p>
								</div>

								<div className="mx-auto w-full max-w-[300px] space-y-3 p-4 border">
									<a
										href="https://dekcpe.link/fam26opc"
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center justify-center gap-2 text-primary underline hover:text-blue-600 font-semibold"
									>
										🔗 dekcpe.link/fam26opc
									</a>
									<div className="flex items-center justify-center gap-2 text-xs">
										<span className="text-muted-foreground tracking-wider">Password:</span>
										<code className="bg-background border border-border px-2 py-0.5 font-mono font-bold text-foreground">
											cpefam67
										</code>
									</div>
								</div>

								<p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium pt-2">
									คุณสามารถปิดหน้านี้ได้
								</p>
							</div>
						</DialogDescription>
					</DialogHeader>
				</DialogContent>
			</Dialog>
			<Dialog open={status === "failed"}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle className="text-center text-destructive">เกิดข้อผิดพลาด</DialogTitle>
						<DialogDescription className="text-center">{errorMessage}</DialogDescription>
					</DialogHeader>
					<Button variant="outline" className="w-full" onClick={() => setStatus("ready")}>
						ลองอีกครั้ง
					</Button>
				</DialogContent>
			</Dialog>
		</div>
	)
}
