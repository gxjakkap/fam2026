import { relations } from "drizzle-orm";
import { reservationQuotaSelection } from "../tables/reservation-quota-selection";
import { reservation } from "../tables/reservation";
import { quotaDrink } from "../tables/quota-drink";

export const reservationQuotaSelectionRelations = relations(reservationQuotaSelection, ({ one }) => ({
    reservation: one(reservation, {
        fields: [reservationQuotaSelection.reservationId],
        references: [reservation.id]
    }),
    quotaDrink: one(quotaDrink, {
        fields: [reservationQuotaSelection.quotaDrinkId],
        references: [quotaDrink.id]
    })
}))