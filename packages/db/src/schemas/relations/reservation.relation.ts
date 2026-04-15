import { relations } from "drizzle-orm";
import { reservation } from "../tables/reservation";
import { user } from "../tables/user";
import { file } from "../tables/file";
import { reservationQuotaSelection } from "../tables/reservation-quota-selection";
import { reservationAddon } from "../tables/reservation-addon";
import { roomOccupant } from "../tables/room-occupant";
import { payment } from "../tables/payment";

export const reservationRelations = relations(reservation, ({ one, many }) => ({
    user: one(user, {
        fields: [reservation.userId],
        references: [user.id],
        relationName: "reservation_user"
    }),
    secretDiscountProofFile: one(file, {
        fields: [reservation.secretDiscountProof],
        references: [file.id]
    }),
    secretDiscountReviewedBy: one(user, {
        fields: [reservation.secretDiscountReviewedBy],
        references: [user.id],
        relationName: "reservation_secret_discount_reviewer"
    }),
    inRoom: one(roomOccupant, {
        fields: [reservation.id],
        references: [roomOccupant.reservationId]
    }),
    payments: many(payment),
    reservationQuotaSelections: many(reservationQuotaSelection),
    reservationAddons: many(reservationAddon)
}))