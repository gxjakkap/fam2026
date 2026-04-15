import { relations } from "drizzle-orm";
import { quotaDrink } from "../tables/quota-drink";
import { drink } from "../tables/drink";
import { reservationQuotaSelection } from "../tables/reservation-quota-selection";

export const quotaDrinkRelations = relations(quotaDrink, ({ one, many }) => ({
    drink: one(drink, {
        fields: [quotaDrink.drinkId],
        references: [drink.id]
    }),
    reservationQuotaSelection: many(reservationQuotaSelection)
}))