import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import { trainingSchemas, trainingSchemaExercises, exercises } from "./schema";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, { max: 1, prepare: false });
const db = drizzle(client);

const presetSchemas = [
  {
    name: "Push Day",
    description: "Borst, schouders en triceps",
    exercises: [
      "Bench Press",
      "Incline Dumbbell Press",
      "Cable Fly",
      "Barbell Shoulder Press",
      "Tricep Pushdown",
    ],
  },
  {
    name: "Pull Day",
    description: "Rug en biceps",
    exercises: [
      "Deadlift",
      "Barbell Row",
      "Lat Pulldown",
      "Face Pull",
      "Bicep Curl",
    ],
  },
  {
    name: "Leg Day",
    description: "Benen en kuiten",
    exercises: [
      "Squat",
      "Leg Press",
      "Leg Extensions",
      "Leg Curl",
      "Calf Press",
    ],
  },
  {
    name: "Upper Body",
    description: "Bovenlichaam: borst, rug, schouders en armen",
    exercises: [
      "Bench Press",
      "Barbell Row",
      "Dumbbell Shoulder Press",
      "Bicep Curl",
      "Tricep Pushdown",
    ],
  },
  {
    name: "Lower Body",
    description: "Onderlichaam: benen en kuiten",
    exercises: [
      "Squat",
      "Deadlift",
      "Leg Press",
      "Leg Curl",
      "Calf Press",
    ],
  },
  {
    name: "Full Body",
    description: "Alle spiergroepen in één sessie",
    exercises: [
      "Bench Press",
      "Squat",
      "Barbell Row",
      "Dumbbell Shoulder Press",
      "Bicep Curl",
    ],
  },
];

async function seedSchemas() {
  console.log("🏋️ Seeding trainingsschema's...");

  // Check of er al preset schema's zijn
  const existing = await db
    .select()
    .from(trainingSchemas)
    .where(eq(trainingSchemas.isPreset, 1));

  if (existing.length > 0) {
    console.log(
      `⚠️  Er bestaan al ${existing.length} preset schema's. Overslaan.`
    );
    await client.end();
    return;
  }

  for (const preset of presetSchemas) {
    // Schema aanmaken
    const [schema] = await db
      .insert(trainingSchemas)
      .values({
        name: preset.name,
        description: preset.description,
        isPreset: 1,
      })
      .returning();

    console.log(`  ✅ Schema "${preset.name}" aangemaakt (id: ${schema.id})`);

    // Oefeningen opzoeken en koppelen
    for (let i = 0; i < preset.exercises.length; i++) {
      const exerciseName = preset.exercises[i];
      const [exercise] = await db
        .select({ id: exercises.id })
        .from(exercises)
        .where(eq(exercises.name, exerciseName))
        .limit(1);

      if (exercise) {
        await db.insert(trainingSchemaExercises).values({
          schemaId: schema.id,
          exerciseId: exercise.id,
          sortOrder: i,
        });
      } else {
        console.log(`  ⚠️  Oefening "${exerciseName}" niet gevonden, overgeslagen`);
      }
    }
  }

  console.log(`\n✅ ${presetSchemas.length} trainingsschema's aangemaakt!`);
  await client.end();
}

seedSchemas().catch((e) => {
  console.error("Fout bij seeden:", e);
  process.exit(1);
});
