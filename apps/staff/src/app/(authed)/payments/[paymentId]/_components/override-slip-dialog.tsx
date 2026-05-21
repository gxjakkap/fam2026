"use client"

import { useRef, useState, useTransition } from "react"
import { ShieldAlert, Upload, X } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"

import { overridePaymentSlipAction } from "../actions"

interface OverrideSlipDialogProps {
	paymentId: string
	disabled?: boolean
}

export function OverrideSlipDialog({ paymentId, disabled }: OverrideSlipDialogProps) {
	const [open, setOpen] = useState(false)
	const [selectedFile, setSelectedFile] = useState<File | null>(null)
	const [dragOver, setDragOver] = useState(false)
	const [isPending, startTransition] = useTransition()
	const fileInputRef = useRef<HTMLInputElement>(null)

	const handleFileChange = (file: File | null) => {
		if (!file) return
		const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"]
		if (!allowed.includes(file.type)) {
			toast.error("Invalid file type. Please upload an image (JPEG, PNG, WebP) or PDF.")
			return
		}
		if (file.size > 10 * 1024 * 1024) {
			toast.error("File too large. Maximum size is 10 MB.")
			return
		}
		setSelectedFile(file)
	}

	const handleSubmit = () => {
		if (!selectedFile) return

		startTransition(async () => {
			const formData = new FormData()
			formData.append("slip", selectedFile)

			const result = await overridePaymentSlipAction(paymentId, formData)

			if (result.success) {
				toast.success("Payment slip uploaded and payment marked as verified.")
				setOpen(false)
				setSelectedFile(null)
			} else {
				toast.error(result.error)
			}
		})
	}

	const handleOpenChange = (val: boolean) => {
		if (isPending) return
		setOpen(val)
		if (!val) setSelectedFile(null)
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button
					variant="outline"
					size="sm"
					disabled={disabled}
					className="gap-2 border-amber-500/50 text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:border-amber-500/40 dark:text-amber-400 dark:hover:bg-amber-950/40 dark:hover:text-amber-300"
				>
					<ShieldAlert className="h-4 w-4" />
					Override Verification
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<ShieldAlert className="h-5 w-5 text-amber-500" />
						Admin Verification Override
					</DialogTitle>
					<DialogDescription>
						Upload the user&apos;s payment slip directly. This will bypass the automated
						verification process and immediately set the payment status to{" "}
						<strong>verified</strong>.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-2">
					{/* Warning banner */}
					<div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-300">
						<p className="font-medium">Admin action — use with caution</p>
						<p className="mt-1 text-xs opacity-80">
							This action skips all automated checks. Ensure the slip is valid before
							proceeding.
						</p>
					</div>

					{/* Drop zone */}
					{/* biome-ignore lint/a11y/useKeyWithClickEvents: click handled via ref */}
					{/* biome-ignore lint/a11y/noStaticElementInteractions: drop zone */}
					<div
						className={`relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
							dragOver
								? "border-primary bg-primary/5"
								: "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30"
						}`}
						onClick={() => fileInputRef.current?.click()}
						onDragOver={(e) => {
							e.preventDefault()
							setDragOver(true)
						}}
						onDragLeave={() => setDragOver(false)}
						onDrop={(e) => {
							e.preventDefault()
							setDragOver(false)
							const droppedFile = e.dataTransfer.files[0]
							if (droppedFile) handleFileChange(droppedFile)
						}}
					>
						<input
							ref={fileInputRef}
							type="file"
							accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
							className="hidden"
							onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
						/>

						{selectedFile ? (
							<div className="flex w-full items-center gap-3">
								<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
									<Upload className="h-5 w-5 text-primary" />
								</div>
								<div className="min-w-0 flex-1">
									<p className="truncate text-sm font-medium">{selectedFile.name}</p>
									<p className="text-muted-foreground text-xs">
										{(selectedFile.size / 1024).toFixed(1)} KB &middot; {selectedFile.type}
									</p>
								</div>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									className="h-8 w-8 shrink-0"
									onClick={(e) => {
										e.stopPropagation()
										setSelectedFile(null)
										if (fileInputRef.current) fileInputRef.current.value = ""
									}}
								>
									<X className="h-4 w-4" />
								</Button>
							</div>
						) : (
							<div className="text-center">
								<Upload className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
								<p className="text-sm font-medium">Drop slip file here</p>
								<p className="text-muted-foreground mt-1 text-xs">
									or click to browse &middot; JPEG, PNG, WebP, PDF &middot; max 10 MB
								</p>
							</div>
						)}
					</div>
				</div>

				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => handleOpenChange(false)}
						disabled={isPending}
					>
						Cancel
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={!selectedFile || isPending}
						className="gap-2 bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700"
					>
						<ShieldAlert className="h-4 w-4" />
						{isPending ? "Uploading..." : "Override & Verify"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
