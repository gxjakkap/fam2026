ALTER TABLE "payment_slip" ALTER COLUMN "payment_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "payment" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;