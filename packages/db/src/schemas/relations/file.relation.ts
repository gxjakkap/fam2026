import { relations } from "drizzle-orm"
import { file } from "../tables/file"
import { user } from "../tables/user"

export const fileRelations = relations(file, ({ one }) => ({
	uploadedByUser: one(user, {
		fields: [file.uploadedBy],
		references: [user.id],
	}),
}))
