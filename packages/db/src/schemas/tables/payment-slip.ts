import { date, jsonb, numeric, pgTable, text, time, timestamp, uuid } from "drizzle-orm/pg-core"
import { paymentSlipStatusEnum } from "../enums/payment-slip-status.enum"
import { file } from "./file"
import { payment } from "./payment"

export const paymentSlip = pgTable("payment_slip", {
    id: text("id").primaryKey(),
    paymentId: uuid("payment_id").notNull().references(() => payment.id),
    transRef: text("trans_ref").notNull().unique(),
    amount: numeric("amount").notNull(),
    senderName: text("sender_name"),
    transDate: date("trans_date"),
    transTime: time("trans_time"),
	sendingBank: text("sending_bank"),
	slipImage: text("slip_image").notNull().unique().references(() => file.id),
	verifiedAt: timestamp("verified_at"),
    status: paymentSlipStatusEnum("status").notNull().default(paymentSlipStatusEnum.enumValues[0]),
    rawResponse: jsonb("raw_response"),
})
