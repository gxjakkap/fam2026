import { pgEnum } from "drizzle-orm/pg-core";

export const reservationTypeEnum = pgEnum("reservation_type", ["current_student", "alumni"])