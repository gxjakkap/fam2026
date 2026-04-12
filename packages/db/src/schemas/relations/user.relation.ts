import { relations } from "drizzle-orm";
import { user } from "../tables/user";
import { session } from "../tables/session";
import { account } from "../tables/account";

export const userRelations = relations(user, ({ many }) => ({
	sessions: many(session),
	accounts: many(account),
}))
