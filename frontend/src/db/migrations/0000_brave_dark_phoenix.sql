-- -- Current sql file was generated after introspecting the database
-- -- If you want to run this migration please uncomment this code before executing migrations

-- CREATE TABLE "models" (
-- 	"id" serial PRIMARY KEY NOT NULL,
-- 	"model_id" varchar,
-- 	"name" varchar,
-- 	"wins" integer,
-- 	"losses" integer,
-- 	"draws" integer,
-- 	"invalid" integer,
-- 	"elo" double precision,
-- 	CONSTRAINT "models_model_id_key" UNIQUE("model_id")
-- );
-- --> statement-breakpoint
-- CREATE TABLE "battles" (
-- 	"id" serial PRIMARY KEY NOT NULL,
-- 	"model1_id" integer,
-- 	"model2_id" integer,
-- 	"winner_id" integer,
-- 	"question" varchar,
-- 	"response1" varchar,
-- 	"response2" varchar,
-- 	"result" varchar,
-- 	"created_at" timestamp,
-- 	"voted_at" timestamp
-- );
-- --> statement-breakpoint
-- ALTER TABLE "battles" ADD CONSTRAINT "battles_model1_id_fkey" FOREIGN KEY ("model1_id") REFERENCES "public"."models"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
-- ALTER TABLE "battles" ADD CONSTRAINT "battles_model2_id_fkey" FOREIGN KEY ("model2_id") REFERENCES "public"."models"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
-- ALTER TABLE "battles" ADD CONSTRAINT "battles_winner_id_fkey" FOREIGN KEY ("winner_id") REFERENCES "public"."models"("id") ON DELETE cascade ON UPDATE no action;
