import { relations } from "drizzle-orm"
import { account } from "../tables/account"
import { file } from "../tables/file"
import { room } from "../tables/room"
import { session } from "../tables/session"
import { user } from "../tables/user"

export const userRelations = relations(user, ({ many }) => ({
	sessions: many(session),
	accounts: many(account),
	files: many(file),
    reservedRooms: many(room),
}))
