ALTER TABLE "payment_slip" DROP CONSTRAINT "payment_slip_payment_id_payment_id_fk";--> statement-breakpoint
ALTER TABLE "payment" ALTER COLUMN "id" SET DATA TYPE uuid USING "id"::uuid;--> statement-breakpoint
ALTER TABLE "payment" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "payment_slip" ALTER COLUMN "payment_id" SET DATA TYPE uuid USING "payment_id"::uuid;--> statement-breakpoint
ALTER TABLE "payment" ADD COLUMN "payer_email" text NOT NULL;--> statement-breakpoint
ALTER TABLE "payment_slip" ADD CONSTRAINT "payment_slip_payment_id_payment_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payment"("id") ON DELETE no action ON UPDATE no action;