"use server";

import { db } from "@/db";
import { eq, sql } from "drizzle-orm";
import * as schema from "@/db/schema";

export async function createExercise(data: {
  name: string;
  muscleGroup: string;
  description?: string;
}) {
  const [exercise] = await db
    .insert(schema.exercises)
    .values({
      name: data.name,
      muscleGroup: data.muscleGroup,
      description: data.description,
    })
    .returning();
  return exercise;
}

export async function updateExercise(
  id: number,
  data: { name: string; muscleGroup: string; description?: string }
) {
  const [exercise] = await db
    .update(schema.exercises)
    .set({
      name: data.name,
      muscleGroup: data.muscleGroup,
      description: data.description,
    })
    .where(eq(schema.exercises.id, id))
    .returning();
  return exercise;
}

export async function deleteExercise(id: number) {
  return db
    .delete(schema.exercises)
    .where(eq(schema.exercises.id, id))
    .returning();
}

export async function isExerciseInUse(id: number): Promise<boolean> {
  const result = await db
    .select({
      count: sql<number>`count(*)`.as("count"),
    })
    .from(schema.sessionExercises)
    .where(eq(schema.sessionExercises.exerciseId, id));
  return (result[0]?.count ?? 0) > 0;
}

export async function getAllExercises(muscleGroup?: string) {
  if (muscleGroup) {
    return db.query.exercises.findMany({
      where: eq(schema.exercises.muscleGroup, muscleGroup),
      orderBy: [schema.exercises.muscleGroup, schema.exercises.name],
    });
  }

  return db.query.exercises.findMany({
    orderBy: [schema.exercises.muscleGroup, schema.exercises.name],
  });
}

export async function getExerciseById(id: number) {
  return db.query.exercises.findFirst({
    where: eq(schema.exercises.id, id),
  });
}
