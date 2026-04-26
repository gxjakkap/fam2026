CREATE TYPE "public"."common_food_type" AS ENUM('normal', 'halal', 'vegetarian', 'seafood_allergy', 'other');--> statement-breakpoint
CREATE TYPE "public"."file_type" AS ENUM('payment_slip', 'secret_discount_proof');--> statement-breakpoint
CREATE TYPE "public"."payment_slip_status" AS ENUM('verify_pending', 'valid', 'invalid');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending_secret_discount_approval', 'pending', 'verified', 'failed');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "file" (
	"id" text PRIMARY KEY NOT NULL,
	"uploaded_by" text,
	"uploaded_at" timestamp DEFAULT now() NOT NULL,
	"mime_type" text NOT NULL,
	"type" "file_type" NOT NULL,
	"size" integer NOT NULL,
	"file_key" text NOT NULL,
	"file_name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payment" (
	"id" text PRIMARY KEY NOT NULL,
	"status" "payment_status" NOT NULL,
	"price" numeric NOT NULL,
	"payer_name" text NOT NULL,
	"product_name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payment_slip" (
	"id" text PRIMARY KEY NOT NULL,
	"payment_id" text NOT NULL,
	"trans_ref" text NOT NULL,
	"amount" numeric NOT NULL,
	"sender_name" text,
	"trans_date" date,
	"trans_time" time,
	"sending_bank" text,
	"slip_image" text NOT NULL,
	"verified_at" timestamp,
	"status" "payment_slip_status" DEFAULT 'verify_pending' NOT NULL,
	"raw_response" jsonb,
	CONSTRAINT "payment_slip_trans_ref_unique" UNIQUE("trans_ref"),
	CONSTRAINT "payment_slip_slip_image_unique" UNIQUE("slip_image")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "room" (
	"id" text PRIMARY KEY NOT NULL,
	"displayname" text NOT NULL,
	"details" text,
	"max_occupants" integer NOT NULL,
	"min_occupants" integer NOT NULL,
	"reserved_at" timestamp,
	"reserved_by" text,
	CONSTRAINT "room_reserved_by_unique" UNIQUE("reserved_by")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "room_occupant" (
	"id" text PRIMARY KEY NOT NULL,
	"room_id" text NOT NULL,
	"reservation_id" text NOT NULL,
	CONSTRAINT "room_occupant_reservation_id_unique" UNIQUE("reservation_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"impersonated_by" text,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"username" text,
	"display_username" text,
	"role" text,
	"bypass_countdown" boolean DEFAULT false NOT NULL,
	"banned" boolean DEFAULT false,
	"ban_reason" text,
	"ban_expires" timestamp,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "file" ADD CONSTRAINT "file_uploaded_by_user_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payment_slip" ADD CONSTRAINT "payment_slip_payment_id_payment_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payment"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payment_slip" ADD CONSTRAINT "payment_slip_slip_image_file_id_fk" FOREIGN KEY ("slip_image") REFERENCES "public"."file"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "room" ADD CONSTRAINT "room_reserved_by_user_id_fk" FOREIGN KEY ("reserved_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "room_occupant" ADD CONSTRAINT "room_occupant_room_id_room_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."room"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "verification_identifier_idx" ON "verification" USING btree ("identifier");