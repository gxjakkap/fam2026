import { numeric, pgTable, uuid } from "drizzle-orm/pg-core";
import { paymentStatusEnum } from "../enums/payment-status.enum";
import { paymentForEnum } from "../enums/payment-for.enum";

export const payment = pgTable("payment", {
    id: uuid("id").notNull().defaultRandom(),
    status: paymentStatusEnum("status").notNull(),
    for: paymentForEnum("for").notNull(),
    basePrice: numeric("base_price").notNull(),
    addonsPrice: numeric("addons_price").notNull(),
    totalAmount: numeric("total_amount").notNull(),
    reservationId: uuid("reservation_id").notNull()
})