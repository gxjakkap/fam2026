import { pgEnum } from "drizzle-orm/pg-core";

export const commonFoodTypeEnum = pgEnum("common_food_type", ["normal", "halal", "vegetarian", "seafood_allergy", "other"])