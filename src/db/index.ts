import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

// Voor serverless (Vercel): connection pool met max 1 connectie
const client = postgres(connectionString, {
  max: 1,
  prepare: false, // Nodig voor transaction pooler van Supabase
  idle_timeout: 20, // Sluit inactieve connecties na 20s (voorkomt stale connecties op serverless)
  connect_timeout: 10, // Timeout na 10s als connectie niet lukt
});

export const db = drizzle(client, { schema });
