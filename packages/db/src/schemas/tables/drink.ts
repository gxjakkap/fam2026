import { integer, pgTable, text, boolean } from "drizzle-orm/pg-core"

export const drink = pgTable("drink", {
    id: integer("id").notNull().primaryKey().generatedAlwaysAsIdentity(),
    name: text("name").notNull(),
    imageUrl: text("image_url"),
    isActive: boolean("is_active").notNull().default(true)
})