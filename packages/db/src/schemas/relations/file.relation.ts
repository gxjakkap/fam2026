import { relations } from "drizzle-orm";
import { file } from "../tables/file";
import { user } from "../tables/user";
import { reservation } from "../tables/reservation";

export const fileRelation = relations(file, ({ one }) => ({
        user: one(user, {
            fields: [file.uploadedBy],
            references: [user.id]
        })
    }
))