"use server";

import { db } from "@/db";
import { eq } from "drizzle-orm";
import * as schema from "@/db/schema";

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
