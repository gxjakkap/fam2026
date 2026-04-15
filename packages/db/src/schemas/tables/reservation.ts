import { pgTable, uuid, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { reservationTypeEnum } from "../enums/reservation-type.enum";
import { commonFoodTypeEnum } from "../enums/common-food-type.enum";
import { secretDiscountStatusEnum } from "../enums/secret-discount-status.enum";

export const reservation = pgTable("reservation", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull().unique(),
    firstName: text("first_name"),
    lastName: text("last_name"),
    nickname: text("nickname"),
    phoneNumber: text("phone_number"),
    gen: integer("gen"),
    studentId: text("student_id"),
    goWithBus: boolean("go_with_bus"),
    oneDayTrip: boolean("one_day_trip"),
    type: reservationTypeEnum("type"),
    foodType: commonFoodTypeEnum("food_type"),
    otherFoodRestriction: text("other_food_restriction"),
    secretDiscountClaimed: boolean("secret_discount_claimed"),
    secretDiscountProof: uuid("secret_discount_proof"),
    secretDiscountApproved: secretDiscountStatusEnum("secret_discount_approved"),
    secretDiscountReviewedBy: text("secret_discount_reviewed_by"),
    pBossLottery: integer("p_boss_lottery"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    submittedAt: timestamp("submitted_at")
})