"use server";

import { db } from "@/db";
import { eq, sql, ilike, and, count } from "drizzle-orm";
import * as schema from "@/db/schema";

const PAGE_SIZE = 24;

export async function createExercise(data: {
  name: string;
  muscleGroup: string;
  description?: string;
  equipment?: string;
  level?: string;
}) {
  const [exercise] = await db
    .insert(schema.exercises)
    .values({
      name: data.name,
      muscleGroup: data.muscleGroup,
      description: data.description,
      equipment: data.equipment,
      level: data.level,
      isCustom: 1,
    })
    .returning();
  return exercise;
}

export async function updateExercise(
  id: number,
  data: {
    name: string;
    muscleGroup: string;
    description?: string;
    equipment?: string;
    level?: string;
  }
) {
  const [exercise] = await db
    .update(schema.exercises)
    .set({
      name: data.name,
      muscleGroup: data.muscleGroup,
      description: data.description,
      equipment: data.equipment,
      level: data.level,
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

export async function getAllExercises(
  muscleGroup?: string,
  search?: string,
  page: number = 1
) {
  const conditions = [];

  if (muscleGroup) {
    conditions.push(eq(schema.exercises.muscleGroup, muscleGroup));
  }

  if (search && search.trim()) {
    conditions.push(ilike(schema.exercises.name, `%${search.trim()}%`));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [exercises, totalResult] = await Promise.all([
    db.query.exercises.findMany({
      where,
      orderBy: [schema.exercises.muscleGroup, schema.exercises.name],
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    }),
    db
      .select({ total: count() })
      .from(schema.exercises)
      .where(where),
  ]);

  const total = totalResult[0]?.total ?? 0;

  return {
    exercises,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil(total / PAGE_SIZE),
  };
}

export async function getExerciseById(id: number) {
  return db.query.exercises.findFirst({
    where: eq(schema.exercises.id, id),
  });
}
