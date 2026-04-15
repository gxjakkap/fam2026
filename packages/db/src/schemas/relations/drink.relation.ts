import { relations } from "drizzle-orm";
import { quotaDrink } from "../tables/quota-drink";
import { drink } from "../tables/drink";
import { addonDrink } from "../tables/addon-drink";

export const drinkRelations = relations(drink, ({ one }) => ({
  quotaDrink: one(quotaDrink, {
    fields: [drink.id],
    references: [quotaDrink.drinkId]
  }),
  addonDrink: one(addonDrink, {
    fields: [drink.id],
    references: [addonDrink.drinkId]
  })
}))