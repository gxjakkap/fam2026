import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const room = pgTable("room", {
    id: text("id").primaryKey(),
    displayName: text("displayname").notNull(),
    details: text("details"),
    maxOccupants: integer("max_occupants").notNull(),
    minOccupants: integer("min_occupants").notNull(),
    reservedBy: uuid("reserved_by"),
    reservedAt: timestamp("reserved_at")
})