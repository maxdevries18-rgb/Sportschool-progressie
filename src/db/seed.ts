import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users, exercises } from "./schema";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, { max: 1, prepare: false });
const db = drizzle(client);

async function seed() {
  console.log("🌱 Seeding database...");

  // Gebruikers aanmaken
  const insertedUsers = await db
    .insert(users)
    .values([{ name: "Gebruiker 1" }, { name: "Gebruiker 2" }])
    .returning();

  console.log(`✅ ${insertedUsers.length} gebruikers aangemaakt`);

  // Oefeningen aanmaken met beschrijvingen
  const exerciseData = [
    // Borst
    {
      name: "Bench Press",
      muscleGroup: "borst",
      description:
        "Lig op een vlakke bank. Pak de stang iets breder dan schouderbreedte. Laat de stang gecontroleerd zakken naar je borst en duw hem weer omhoog. Houd je voeten plat op de grond en je schouderbladen samen.",
    },
    {
      name: "Incline Dumbbell Press",
      muscleGroup: "borst",
      description:
        "Stel de bank in op 30-45 graden. Pak twee dumbbells en duw ze omhoog boven je borst. Laat ze gecontroleerd zakken tot je ellebogen op 90 graden staan en duw weer omhoog.",
    },
    {
      name: "Cable Fly",
      muscleGroup: "borst",
      description:
        "Sta tussen twee kabelmachines met de kabels op schouderhoogte. Breng je handen in een boog naar elkaar toe voor je borst. Houd een lichte buiging in je ellebogen gedurende de hele beweging.",
    },
    // Rug
    {
      name: "Deadlift",
      muscleGroup: "rug",
      description:
        "Sta met je voeten op heupbreedte, de stang boven het midden van je voeten. Buig door je heupen en knieën, pak de stang. Duw door je benen en heupen om rechtop te komen. Houd je rug recht gedurende de hele beweging.",
    },
    {
      name: "Barbell Row",
      muscleGroup: "rug",
      description:
        "Buig voorover met je bovenlichaam op circa 45 graden. Pak de stang op schouderbreedte en trek hem naar je navel. Knijp je schouderbladen samen bovenaan en laat gecontroleerd zakken.",
    },
    {
      name: "Lat Pulldown",
      muscleGroup: "rug",
      description:
        "Pak de brede stang iets breder dan schouderbreedte. Trek de stang naar je bovenborst terwijl je je schouderbladen naar beneden en samen trekt. Laat gecontroleerd terug omhoog.",
    },
    {
      name: "Pull-up",
      muscleGroup: "rug",
      description:
        "Hang aan een stang met je handen iets breder dan schouderbreedte. Trek jezelf omhoog tot je kin boven de stang komt. Laat je gecontroleerd zakken tot je armen gestrekt zijn.",
    },
    // Benen
    {
      name: "Squat",
      muscleGroup: "benen",
      description:
        "Plaats de stang op je bovenrug. Sta op schouderbreedte. Zak door je knieën en heupen alsof je op een stoel gaat zitten. Ga tot minstens 90 graden en duw jezelf weer omhoog. Houd je rug recht en knieën in lijn met je tenen.",
    },
    {
      name: "Leg Press",
      muscleGroup: "benen",
      description:
        "Zit in de leg press machine met je voeten op schouderbreedte op het platform. Laat het platform gecontroleerd zakken tot je knieën op 90 graden staan en duw weer omhoog. Strek je knieën niet volledig.",
    },
    {
      name: "Romanian Deadlift",
      muscleGroup: "benen",
      description:
        "Houd de stang op heupniveau met gestrekte armen. Buig vanuit je heupen naar voren terwijl je een lichte kniebuiging houdt. Laat de stang langs je benen zakken tot je een stretch voelt in je hamstrings. Kom weer omhoog door je heupen naar voren te duwen.",
    },
    {
      name: "Leg Curl",
      muscleGroup: "benen",
      description:
        "Lig op je buik in de leg curl machine. Plaats je enkels onder het kussen. Buig je knieën om het gewicht omhoog te brengen. Houd je heupen op de bank en laat gecontroleerd terug.",
    },
    // Schouders
    {
      name: "Overhead Press",
      muscleGroup: "schouders",
      description:
        "Sta rechtop met de stang op schouderhoogte. Duw de stang recht omhoog boven je hoofd tot je armen gestrekt zijn. Laat gecontroleerd terug zakken naar schouderhoogte. Houd je core aangespannen.",
    },
    {
      name: "Lateral Raise",
      muscleGroup: "schouders",
      description:
        "Sta rechtop met een dumbbell in elke hand. Til je armen zijwaarts op tot schouderhoogte met een lichte buiging in je ellebogen. Laat gecontroleerd zakken. Gebruik geen momentum.",
    },
    // Armen
    {
      name: "Bicep Curl",
      muscleGroup: "armen",
      description:
        "Sta rechtop met een dumbbell in elke hand, armen langs je lichaam. Buig je ellebogen om de dumbbells omhoog te brengen. Houd je bovenarmen stil en laat gecontroleerd zakken.",
    },
    {
      name: "Tricep Pushdown",
      muscleGroup: "armen",
      description:
        "Sta voor een kabelmachine met een rechte of V-bar. Houd je bovenarmen langs je lichaam en duw de bar naar beneden tot je armen gestrekt zijn. Laat gecontroleerd terug omhoog tot 90 graden.",
    },
    // Core
    {
      name: "Plank",
      muscleGroup: "core",
      description:
        "Steun op je onderarmen en tenen. Houd je lichaam in een rechte lijn van hoofd tot hielen. Span je buikspieren en bilspieren aan. Houd deze positie vast zonder door te hangen of je heupen omhoog te duwen.",
    },
    {
      name: "Cable Crunch",
      muscleGroup: "core",
      description:
        "Kniel voor een kabelmachine met een touw aan de hoge katrol. Houd het touw naast je hoofd. Buig vanuit je buikspieren naar voren en beneden. Houd je heupen stil en laat gecontroleerd terug.",
    },
  ];

  const insertedExercises = await db
    .insert(exercises)
    .values(exerciseData)
    .returning();

  console.log(`✅ ${insertedExercises.length} oefeningen aangemaakt`);
  console.log("🎉 Database seeding voltooid!");

  await client.end();
}

seed().catch((err) => {
  console.error("❌ Seeding mislukt:", err);
  process.exit(1);
});
