import { pgEnum } from "drizzle-orm/pg-core";

export const paymentStatusEnum = pgEnum("payment_status", ["pending_secret_discount_approval", "pending", "verified", "failed"])