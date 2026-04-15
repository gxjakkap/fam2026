import { relations } from "drizzle-orm";
import { paymentSlip } from "../tables/payment-slip";
import { payment } from "../tables/payment";
import { file } from "../tables/file";

export const paymentSlipRelations = relations(paymentSlip, ({ one }) => ({
    payment: one(payment, {
        fields: [paymentSlip.paymentId],
        references: [payment.id]
    }),
    slipFile: one(file, {
        fields: [paymentSlip.slipImage],
        references: [file.id]
    })
}))