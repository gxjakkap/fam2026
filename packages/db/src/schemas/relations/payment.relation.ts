import { relations } from "drizzle-orm"
import { payment } from "../tables/payment"
import { paymentSlip } from "../tables/payment-slip"

export const paymentRelations = relations(payment, ({ many }) => ({
	slips: many(paymentSlip),
}))
