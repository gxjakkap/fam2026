CREATE TYPE "public"."common_food_type" AS ENUM('normal', 'halal', 'vegetarian', 'seafood_allergy', 'other');--> statement-breakpoint
CREATE TYPE "public"."file_type" AS ENUM('payment_slip', 'secret_discount_proof');--> statement-breakpoint
CREATE TYPE "public"."payment_for" AS ENUM('reservation', 'one_day_trip', 'other');--> statement-breakpoint
CREATE TYPE "public"."payment_slip_status" AS ENUM('verify_pending', 'valid', 'invalid');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending_secret_discount_approval', 'pending', 'verified', 'failed');--> statement-breakpoint
CREATE TYPE "public"."reservation_type" AS ENUM('current_student', 'alumni');--> statement-breakpoint
CREATE TYPE "public"."secret_discount_status" AS ENUM('review_pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "addon_drink" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "addon_drink_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"drink_id" integer NOT NULL,
	"price_thb" numeric NOT NULL,
	"is_available" boolean DEFAULT true NOT NULL,
	CONSTRAINT "addon_drink_drink_id_unique" UNIQUE("drink_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "drink" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "drink_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"image_url" text,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "file" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"uploaded_by" text NOT NULL,
	"uploaded_at" timestamp DEFAULT now() NOT NULL,
	"mime_type" text NOT NULL,
	"type" "file_type",
	"size" integer NOT NULL,
	"file_key" text NOT NULL,
	"file_name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payment" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"status" "payment_status" NOT NULL,
	"for" "payment_for" NOT NULL,
	"base_price" numeric NOT NULL,
	"addons_price" numeric NOT NULL,
	"total_amount" numeric NOT NULL,
	"reservation_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payment_slip" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"payment_id" uuid NOT NULL,
	"trans_ref" text NOT NULL,
	"amount" numeric NOT NULL,
	"sender_name" text,
	"trans_date" date,
	"trans_time" time,
	"sending_bank" text,
	"slip_image" text NOT NULL,
	"verified_at" timestamp,
	"status" "payment_slip_status" DEFAULT 'verify_pending' NOT NULL,
	"raw_response" jsonb
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "quota_drink" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "quota_drink_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"drink_id" integer NOT NULL,
	"credit_cost" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "quota_drink_drink_id_unique" UNIQUE("drink_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reservation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"nickname" text,
	"phone_number" text,
	"gen" integer,
	"student_id" text,
	"go_with_bus" boolean,
	"one_day_trip" boolean,
	"type" "reservation_type",
	"food_type" "common_food_type",
	"other_food_restriction" text,
	"secret_discount_claimed" boolean,
	"secret_discount_proof" uuid,
	"secret_discount_approved" "secret_discount_status",
	"secret_discount_reviewed_by" text,
	"p_boss_lottery" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"submitted_at" timestamp,
	CONSTRAINT "reservation_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reservation_addon" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reservation_id" uuid NOT NULL,
	"addon_drink_id" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"price_thb_snapshot" numeric NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reservation_quota_selection" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "reservation_quota_selection_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"reservation_id" uuid NOT NULL,
	"quota_drink_id" integer NOT NULL,
	"slot" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "room" (
	"id" text PRIMARY KEY NOT NULL,
	"displayname" text NOT NULL,
	"details" text,
	"max_occupants" integer NOT NULL,
	"min_occupants" integer NOT NULL,
	"reserved_by" uuid,
	"reserved_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "room_occupant" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"room_id" text NOT NULL,
	"reservation_id" uuid NOT NULL,
	CONSTRAINT "room_occupant_reservation_id_unique" UNIQUE("reservation_id")
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "bypass_countdown" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "rqs_reservation_id_slot_idx" ON "reservation_quota_selection" USING btree ("reservation_id","slot");