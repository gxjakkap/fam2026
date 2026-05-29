"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Copy, Check, Plus } from "lucide-react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { createPaymentAction } from "./actions"

const emptyForm = {
	payer_name: "",
	payer_email: "",
	product_name: "",
	price: "",
}

export function CreatePaymentDialog() {
	const router = useRouter()
	const [open, setOpen] = useState(false)
	const [form, setForm] = useState(emptyForm)
	const [errors, setErrors] = useState<Partial<typeof emptyForm>>({})
	const [createdLink, setCreatedLink] = useState<string | null>(null)
	const [copied, setCopied] = useState(false)
	const [isPending, startTransition] = useTransition()

	const handleOpenChange = (val: boolean) => {
		if (isPending) return
		setOpen(val)
		if (!val) {
			setForm(emptyForm)
			setErrors({})
			setCreatedLink(null)
			setCopied(false)
		}
	}

	const validate = () => {
		const next: Partial<typeof emptyForm> = {}
		if (!form.payer_name.trim()) next.payer_name = "Payer name is required"
		if (!form.payer_email.trim()) {
			next.payer_email = "Email is required"
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.payer_email)) {
			next.payer_email = "Invalid email address"
		}
		if (!form.product_name.trim()) next.product_name = "Product name is required"
		const priceNum = Number(form.price)
		if (!form.price.trim()) {
			next.price = "Price is required"
		} else if (Number.isNaN(priceNum) || priceNum <= 0) {
			next.price = "Price must be a positive number"
		}
		setErrors(next)
		return Object.keys(next).length === 0
	}

	const handleSubmit = () => {
		if (!validate()) return

		startTransition(async () => {
			const [data, err] = await createPaymentAction({
				payer_name: form.payer_name,
				payer_email: form.payer_email,
				product_name: form.product_name,
				price: Number(form.price),
			})

			if (err) {
				toast.error(err.message ?? "Failed to create payment")
				return
			}

			setCreatedLink(data.link)
			toast.success("Payment created successfully")
			router.refresh()
		})
	}

	const copyLink = () => {
		if (!createdLink) return
		navigator.clipboard.writeText(createdLink)
		setCopied(true)
		toast.success("Link copied to clipboard")
		setTimeout(() => setCopied(false), 2000)
	}

	const field = (
		id: keyof typeof emptyForm,
		label: string,
		placeholder: string,
		type = "text",
	) => (
		<div className="space-y-1.5">
			<Label htmlFor={id}>{label}</Label>
			<Input
				id={id}
				type={type}
				placeholder={placeholder}
				value={form[id]}
				onChange={(e) => {
					setForm((prev) => ({ ...prev, [id]: e.target.value }))
					if (errors[id]) setErrors((prev) => ({ ...prev, [id]: undefined }))
				}}
				disabled={isPending || !!createdLink}
				aria-invalid={!!errors[id]}
			/>
			{errors[id] && (
				<p className="text-destructive text-xs">{errors[id]}</p>
			)}
		</div>
	)

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button size="sm">
					<Plus className="h-4 w-4" />
					Create Payment
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Create Payment</DialogTitle>
					<DialogDescription>
						Generate a new payment record and share the payment link with the payer.
					</DialogDescription>
				</DialogHeader>

				{createdLink ? (
					<div className="space-y-4 py-2">
						<div className="rounded-md border border-green-500/40 bg-green-500/10 p-4">
							<p className="mb-1 text-sm font-medium text-green-700 dark:text-green-400">
								Payment created!
							</p>
							<p className="text-muted-foreground text-xs">
								Share this link with the payer to complete payment.
							</p>
							<div className="mt-3 flex items-center gap-2">
								<code className="bg-background flex-1 break-all rounded px-2 py-1.5 text-xs font-mono">
									{createdLink}
								</code>
								<Button variant="outline" size="icon" onClick={copyLink} className="shrink-0">
									{copied ? (
										<Check className="h-4 w-4 text-green-600" />
									) : (
										<Copy className="h-4 w-4" />
									)}
								</Button>
							</div>
						</div>
					</div>
				) : (
					<div className="space-y-4 py-2">
						{field("payer_name", "Payer Name", "e.g. John Doe")}
						{field("payer_email", "Payer Email", "e.g. john@example.com", "email")}
						{field("product_name", "Product Name", "e.g. FAM2026 Ticket")}
						{field("price", "Price (THB)", "e.g. 500", "number")}
					</div>
				)}

				<DialogFooter>
					{createdLink ? (
						<Button onClick={() => handleOpenChange(false)}>Done</Button>
					) : (
						<>
							<Button
								variant="outline"
								onClick={() => handleOpenChange(false)}
								disabled={isPending}
							>
								Cancel
							</Button>
							<Button onClick={handleSubmit} disabled={isPending}>
								{isPending ? "Creating..." : "Create Payment"}
							</Button>
						</>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
