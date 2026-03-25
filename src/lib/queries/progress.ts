"use server";

import { db } from "@/db";
import { eq, and, sql, desc } from "drizzle-orm";
import * as schema from "@/db/schema";

export async function getProgressData(userId: number, exerciseId: number) {
  const rows = await db
    .select({
      date: schema.sessions.date,
      maxWeight: sql<number>`max(${schema.sets.weightKg})`.as("max_weight"),
      maxReps: sql<number>`max(${schema.sets.reps})`.as("max_reps"),
      totalVolume:
        sql<number>`sum(${schema.sets.reps} * ${schema.sets.weightKg})`.as(
          "total_volume"
        ),
    })
    .from(schema.sets)
    .innerJoin(
      schema.sessionExercises,
      eq(schema.sets.sessionExerciseId, schema.sessionExercises.id)
    )
    .innerJoin(
      schema.sessions,
      eq(schema.sessionExercises.sessionId, schema.sessions.id)
    )
    .where(
      and(
        eq(schema.sets.userId, userId),
        eq(schema.sessionExercises.exerciseId, exerciseId)
      )
    )
    .groupBy(schema.sessions.date)
    .orderBy(schema.sessions.date);

  return rows;
}

export async function getPersonalRecords(userId: number) {
  const rows = await db
    .select({
      exerciseId: schema.sessionExercises.exerciseId,
      exerciseName: schema.exercises.name,
      muscleGroup: schema.exercises.muscleGroup,
      maxWeight: sql<number>`max(${schema.sets.weightKg})`.as("max_weight"),
      maxReps: sql<number>`max(${schema.sets.reps})`.as("max_reps"),
      maxSetVolume:
        sql<number>`max(${schema.sets.reps} * ${schema.sets.weightKg})`.as(
          "max_set_volume"
        ),
    })
    .from(schema.sets)
    .innerJoin(
      schema.sessionExercises,
      eq(schema.sets.sessionExerciseId, schema.sessionExercises.id)
    )
    .innerJoin(
      schema.exercises,
      eq(schema.sessionExercises.exerciseId, schema.exercises.id)
    )
    .where(eq(schema.sets.userId, userId))
    .groupBy(
      schema.sessionExercises.exerciseId,
      schema.exercises.name,
      schema.exercises.muscleGroup
    )
    .orderBy(schema.exercises.name);

  return rows;
}
