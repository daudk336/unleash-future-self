CREATE TABLE "items" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"quantity" integer NOT NULL,
	"expires_on" date NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"user_id" text PRIMARY KEY NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	CONSTRAINT "user_roles_role_check" CHECK ("user_roles"."role" in ('admin', 'member'))
);
