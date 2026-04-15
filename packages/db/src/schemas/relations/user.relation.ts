import { relations } from "drizzle-orm";
import { user } from "../tables/user";
import { session } from "../tables/session";
import { account } from "../tables/account";
import { file } from "../tables/file";
import { reservation } from "../tables/reservation";

export const userRelations = relations(user, ({ one, many }) => ({
	sessions: many(session),
	accounts: many(account),
	files: many(file),
	reservation: one(reservation, {
		fields: [user.id],
		references: [reservation.userId],
		relationName: "reservation_user"
	}),
	secretDiscountReviewedBy: many(reservation, {
		relationName: "reservation_secret_discount_reviewer"
	})
}))
