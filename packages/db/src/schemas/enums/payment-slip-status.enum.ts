import { pgEnum } from "drizzle-orm/pg-core";

export const paymentSlipStatusEnum = pgEnum("payment_slip_status", ["verify_pending", "valid", "invalid"])