import type { paymentStatusEnum } from "@repo/db/schema"

import { Badge } from "@/components/ui/badge"
import { cn, toSentenceCase } from "@/lib/utils"

type PaymentStatus = (typeof paymentStatusEnum.enumValues)[number]

const PAYMENT_STATUS_STYLE: Record<PaymentStatus, string> = {
	pending: "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-500/20 dark:text-sky-300 dark:border-sky-400/40",
	verified:
		"bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-400/40",
	failed: "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-400/40",
	timeout: "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-400/40",
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
	return (
		<Badge variant="outline" className={cn("font-medium", PAYMENT_STATUS_STYLE[status])}>
			{toSentenceCase(status)}
		</Badge>
	)
}
