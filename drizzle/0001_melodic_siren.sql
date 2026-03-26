CREATE TABLE "training_schema_exercises" (
	"id" serial PRIMARY KEY NOT NULL,
	"schema_id" integer NOT NULL,
	"exercise_id" integer NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "training_schemas" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_preset" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "training_schema_exercises" ADD CONSTRAINT "training_schema_exercises_schema_id_training_schemas_id_fk" FOREIGN KEY ("schema_id") REFERENCES "public"."training_schemas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_schema_exercises" ADD CONSTRAINT "training_schema_exercises_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE no action ON UPDATE no action;