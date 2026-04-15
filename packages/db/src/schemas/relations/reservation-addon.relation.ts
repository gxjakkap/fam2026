import { relations } from "drizzle-orm";
import { reservation } from "../tables/reservation";
import { reservationAddon } from "../tables/reservation-addon";
import { addonDrink } from "../tables/addon-drink";

export const reservationAddonRelations = relations(reservationAddon, ({ one }) => ({
    reservation: one(reservation, {
        fields: [reservationAddon.reservationId],
        references: [reservation.id]
    }),
    addonDrink: one(addonDrink, {
        fields: [reservationAddon.addonDrinkId],
        references: [addonDrink.id]
    })
}))