import { relations } from "drizzle-orm"
import { roomOccupant } from "../tables/room-occupant"
import { room } from "../tables/room"

export const roomOccupantRelations = relations(roomOccupant, ({ one }) => ({
    room: one(room, {
        fields: [roomOccupant.roomId],
        references: [room.id],
    }),
}))
