import { relations } from "drizzle-orm"
import { roomOccupant } from "../tables/room-occupant"
import { room } from "../tables/room"
import { user } from "../tables/user"

export const roomRelations = relations(room, ({ one, many }) => ({
    reservedByUser: one(user, {
        fields: [room.reservedBy],
        references: [user.id],
    }),
    occupants: many(roomOccupant),
}))
