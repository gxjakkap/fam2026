import { integer, pgTable } from "drizzle-orm/pg-core"

export const quotaDrink = pgTable("quota_drink", {
    id: integer("id").notNull().primaryKey().generatedAlwaysAsIdentity(),
    drinkId: integer("drink_id").notNull().unique(),
    creditCost: integer("credit_cost").notNull().default(1)
})