CREATE TYPE "public"."donation_status" AS ENUM('pending', 'reviewed', 'rejected');--> statement-breakpoint
CREATE TABLE "admin_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "donations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" text NOT NULL,
	"address" text NOT NULL,
	"amount_paid" integer NOT NULL,
	"screenshot_url" text NOT NULL,
	"status" "donation_status" DEFAULT 'pending' NOT NULL,
	"idempotency_key" uuid NOT NULL,
	"ip_address" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rate_limits" (
	"key" text NOT NULL,
	"window_start" timestamp with time zone NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "rate_limits_key_window_start_pk" PRIMARY KEY("key","window_start")
);
--> statement-breakpoint
ALTER TABLE "admin_sessions" ADD CONSTRAINT "admin_sessions_user_id_admin_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."admin_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "admin_sessions_token_hash_key" ON "admin_sessions" USING btree ("token_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "donations_idempotency_key_key" ON "donations" USING btree ("idempotency_key");--> statement-breakpoint
CREATE INDEX "donations_created_at_idx" ON "donations" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "donations_status_created_at_idx" ON "donations" USING btree ("status","created_at");