"use server";

import { db } from "@/db";
import { sql } from "drizzle-orm";
import * as schema from "@/db/schema";

export interface WeekOverview {
  weekStart: string;
  sessionCount: number;
  muscleGroups: string[];
}

export async function getWeeklyOverview(
  weeksBack: number = 6
): Promise<WeekOverview[]> {
  const rows = await db.execute(sql`
    SELECT
      date_trunc('week', ${schema.sessions.date}::timestamp)::date::text as week_start,
      COUNT(DISTINCT ${schema.sessions.id})::int as session_count,
      ARRAY_AGG(DISTINCT ${schema.exercises.muscleGroup}) as muscle_groups
    FROM ${schema.sessions}
    JOIN ${schema.sessionExercises} ON ${schema.sessionExercises.sessionId} = ${schema.sessions.id}
    JOIN ${schema.exercises} ON ${schema.exercises.id} = ${schema.sessionExercises.exerciseId}
    WHERE ${schema.sessions.date} >= (CURRENT_DATE - ${sql.raw(`interval '${weeksBack} weeks'`)})
    GROUP BY week_start
    ORDER BY week_start DESC
  `);

  return (rows as unknown as Record<string, unknown>[]).map((row) => ({
    weekStart: row.week_start as string,
    sessionCount: row.session_count as number,
    muscleGroups: (row.muscle_groups as string[]) || [],
  }));
}
