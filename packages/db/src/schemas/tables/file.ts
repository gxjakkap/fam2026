import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { fileTypeEnum } from "../enums/file-type.enum";

export const file = pgTable("file", {
    id: uuid("id").primaryKey().defaultRandom(),
    uploadedBy: text("uploaded_by").notNull(),
    uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
    mimeType: text("mime_type").notNull(),
    type: fileTypeEnum("type"),
    size: integer("size").notNull(),
    fileKey: text("file_key").notNull(),
    fileName: text("file_name").notNull()
})