import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { user } from "./user"

export const file = pgTable("file", {
	id: text("id").primaryKey(),
	uploadedBy: text("uploaded_by").references(() => user.id),
	uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
	mimeType: text("mime_type").notNull(),
	size: integer("size").notNull(),
	fileKey: text("file_key").notNull(),
	fileName: text("file_name").notNull(),
})
