import { pgEnum } from "drizzle-orm/pg-core";

export const secretDiscountStatusEnum = pgEnum("secret_discount_status", ["review_pending", "approved", "rejected"])