import { pgTable, text } from "drizzle-orm/pg-core"
import { room } from "./room"

export const roomOccupant = pgTable("room_occupant", {
    id: text("id").primaryKey(),
    roomId: text("room_id").notNull().references(() => room.id),
    reservationId: text("reservation_id").notNull().unique(),
})
