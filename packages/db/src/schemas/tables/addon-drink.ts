import { integer, pgTable, boolean, numeric } from "drizzle-orm/pg-core"

export const addonDrink = pgTable("addon_drink", {
    id: integer("id").notNull().primaryKey().generatedAlwaysAsIdentity(),
    drinkId: integer("drink_id").notNull().unique(),
    priceTHB: numeric("price_thb").notNull(),
    isAvailable: boolean("is_available").notNull().default(true)
})