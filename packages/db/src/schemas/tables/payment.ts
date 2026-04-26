import { numeric, pgTable, text, uuid } from "drizzle-orm/pg-core"
import { paymentStatusEnum } from "../enums/payment-status.enum"

export const payment = pgTable("payment", {
	id: uuid("id").primaryKey().defaultRandom(),
	status: paymentStatusEnum("status").notNull(),
	price: numeric("price").notNull(),
	payerName: text("payer_name").notNull(),
	payerEmail: text("payer_email").notNull(),
	productName: text("product_name").notNull(),
})
