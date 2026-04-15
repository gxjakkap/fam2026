import { relations } from "drizzle-orm";
import { drink } from "../tables/drink";
import { addonDrink } from "../tables/addon-drink";

export const addonDrinkRelations = relations(addonDrink, ({ one }) => ({
    drink: one(drink, {
        fields: [addonDrink.drinkId],
        references: [drink.id]
    })
}))