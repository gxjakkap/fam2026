import { pgTable, text, uuid } from "drizzle-orm/pg-core";

export const roomOccupant = pgTable("room_occupant", {
    id: uuid("id").primaryKey().defaultRandom(),
    roomId: text("room_id").notNull(),
    reservationId: uuid("reservation_id").notNull().unique()
})