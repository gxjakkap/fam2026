import { integer, numeric, pgTable, uuid } from "drizzle-orm/pg-core";

export const reservationAddon = pgTable("reservation_addon", {
    id: uuid("id").primaryKey().defaultRandom(),
    reservationId: uuid("reservation_id").notNull(),
    addonDrinkId: integer("addon_drink_id").notNull(),
    quantity: integer("quantity").notNull().default(1),
    priceTHBSnapshot: numeric("price_thb_snapshot").notNull()
})