import { pgEnum } from "drizzle-orm/pg-core";

export const paymentForEnum = pgEnum("payment_for", ["reservation", "one_day_trip", "other"])