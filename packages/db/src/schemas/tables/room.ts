import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { user } from "./user"

export const room = pgTable("room", {
    id: text("id").primaryKey(),
    displayName: text("displayname").notNull(),
    details: text("details"),
	maxOccupants: integer("max_occupants").notNull(),
	minOccupants: integer("min_occupants").notNull(),
	reservedAt: timestamp("reserved_at"),
	reservedBy: text("reserved_by").unique().references(() => user.id),
})
