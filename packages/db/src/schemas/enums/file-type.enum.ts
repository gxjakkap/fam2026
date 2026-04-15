import { pgEnum } from "drizzle-orm/pg-core";

export const fileTypeEnum = pgEnum("file_type", ["payment_slip", "secret_discount_proof"])