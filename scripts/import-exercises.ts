import postgres from "postgres";

const IMAGE_BASE_URL =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises";

const MUSCLE_GROUP_MAP: Record<string, string> = {
  chest: "borst",
  "middle back": "rug",
  "lower back": "rug",
  lats: "rug",
  traps: "rug",
  neck: "rug",
  quadriceps: "benen",
  hamstrings: "benen",
  glutes: "benen",
  calves: "benen",
  abductors: "benen",
  adductors: "benen",
  shoulders: "schouders",
  biceps: "armen",
  triceps: "armen",
  forearms: "armen",
  abdominals: "core",
};

function mapMuscleGroup(name: string): string {
  return MUSCLE_GROUP_MAP[name.toLowerCase()] ?? "core";
}

function mapMuscleGroups(muscles: string[]): string[] {
  const mapped = new Set(muscles.map(mapMuscleGroup));
  return [...mapped];
}

interface ExerciseJson {
  id: string;
  name: string;
  force: string | null;
  level: string | null;
  mechanic: string | null;
  equipment: string | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  category: string;
  images: string[];
}

async function importExercises() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  console.log("Fetching exercises from Free Exercise DB...");
  const response = await fetch(
    "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json"
  );
  const exercises: ExerciseJson[] = await response.json();
  console.log(`Fetched ${exercises.length} exercises`);

  const sql = postgres(connectionString, { max: 1, prepare: false });

  // Get existing exercises to avoid overwriting user-customized ones
  const existing = await sql`SELECT name, external_id, is_custom FROM exercises`;
  const existingByExternalId = new Set(
    existing.filter((e) => e.external_id).map((e) => e.external_id)
  );
  const existingNames = new Set(existing.map((e) => e.name.toLowerCase()));

  let imported = 0;
  let skipped = 0;

  for (const ex of exercises) {
    // Skip if already imported by external_id
    if (existingByExternalId.has(ex.id)) {
      skipped++;
      continue;
    }

    // Skip if name already exists (might be a user-created exercise)
    if (existingNames.has(ex.name.toLowerCase())) {
      skipped++;
      continue;
    }

    const primaryGroup = mapMuscleGroup(ex.primaryMuscles[0] ?? "abdominals");
    const allMuscles = [...ex.primaryMuscles, ...ex.secondaryMuscles];
    const secondaryGroups = mapMuscleGroups(allMuscles).filter(
      (g) => g !== primaryGroup
    );

    const imageUrl =
      ex.images.length > 0 ? `${IMAGE_BASE_URL}/${ex.images[0]}` : null;
    const imageUrl2 =
      ex.images.length > 1 ? `${IMAGE_BASE_URL}/${ex.images[1]}` : null;

    const description = ex.instructions.join("\n");

    try {
      await sql`
        INSERT INTO exercises (
          name, name_en, description, muscle_group, secondary_muscle_groups,
          equipment, level, force, image_url, image_url_2, is_custom, external_id
        ) VALUES (
          ${ex.name}, ${ex.name}, ${description}, ${primaryGroup},
          ${secondaryGroups.length > 0 ? JSON.stringify(secondaryGroups) : null},
          ${ex.equipment}, ${ex.level}, ${ex.force},
          ${imageUrl}, ${imageUrl2}, 0, ${ex.id}
        )
      `;
      imported++;
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("unique")) {
        skipped++;
      } else {
        console.error(`Error importing ${ex.name}:`, err);
      }
    }
  }

  // Also update existing seed exercises with image URLs and external IDs
  // Match by name similarity
  const seedExerciseMapping: Record<string, string> = {
    "Bench Press": "Barbell_Bench_Press_-_Medium_Grip",
    "Incline Dumbbell Press": "Incline_Dumbbell_Press",
    "Cable Fly": "Cable_Crossover",
    "Deadlift": "Barbell_Deadlift",
    "Barbell Row": "Bent_Over_Barbell_Row",
    "Lat Pulldown": "Wide-Grip_Lat_Pulldown",
    "Pull-up": "Pullups",
    "Squat": "Barbell_Full_Squat",
    "Leg Press": "Leg_Press",
    "Romanian Deadlift": "Romanian_Deadlift_With_Dumbbells",
    "Leg Curl": "Seated_Leg_Curl",
    "Overhead Press": "Standing_Military_Press",
    "Lateral Raise": "Side_Lateral_Raise",
    "Bicep Curl": "Dumbbell_Bicep_Curl",
    "Tricep Pushdown": "Triceps_Pushdown",
    "Plank": "Plank",
    "Cable Crunch": "Cable_Crunch",
  };

  let updated = 0;
  for (const [seedName, externalId] of Object.entries(seedExerciseMapping)) {
    const imageUrl = `${IMAGE_BASE_URL}/${externalId}/0.jpg`;
    const imageUrl2 = `${IMAGE_BASE_URL}/${externalId}/1.jpg`;

    const result = await sql`
      UPDATE exercises
      SET image_url = ${imageUrl}, image_url_2 = ${imageUrl2},
          external_id = ${externalId}, name_en = ${seedName}
      WHERE name = ${seedName} AND image_url IS NULL
    `;
    if (result.count > 0) updated++;
  }

  console.log(
    `Done! Imported: ${imported}, Skipped: ${skipped}, Updated existing: ${updated}`
  );
  console.log(`Total exercises in DB: ${imported + existing.length}`);

  await sql.end();
}

importExercises().catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});
