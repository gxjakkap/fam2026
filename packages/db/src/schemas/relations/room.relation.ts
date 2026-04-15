import { relations } from "drizzle-orm";
import { room } from "../tables/room";
import { reservation } from "../tables/reservation";
import { roomOccupant } from "../tables/room-occupant";

export const roomRelations = relations(room, ({ one, many }) => ({
    reservedBy: one(reservation, {
        fields: [room.reservedBy],
        references: [reservation.id]
    }),
    occupants: many(roomOccupant)
}))