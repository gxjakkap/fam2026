import { relations } from "drizzle-orm";
import { payment } from "../tables/payment";
import { reservation } from "../tables/reservation";
import { paymentSlip } from "../tables/payment-slip";

export const paymentRelations = relations(payment, ({ one, many }) => ({
    reservation: one(reservation, {
        fields: [payment.reservationId],
        references: [reservation.id]
    }),
    slip: many(paymentSlip)
}))