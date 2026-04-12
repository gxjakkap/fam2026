import { relations } from "drizzle-orm";
import { account } from "../tables/account";
import { user } from "../tables/user";

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id],
	}),
}))
