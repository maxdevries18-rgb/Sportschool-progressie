import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

// Voor serverless (Vercel): connection pool met max 1 connectie
const client = postgres(connectionString, {
  max: 1,
  prepare: false, // Nodig voor transaction pooler van Supabase
});

export const db = drizzle(client, { schema });
