"use server";

import { db } from "@/db";
import { eq, desc, sql } from "drizzle-orm";
import * as schema from "@/db/schema";
import { createSession } from "./sessions";

export async function getAllSchemas() {
  const rows = await db
    .select({
      id: schema.trainingSchemas.id,
      name: schema.trainingSchemas.name,
      description: schema.trainingSchemas.description,
      isPreset: schema.trainingSchemas.isPreset,
      createdAt: schema.trainingSchemas.createdAt,
      exerciseCount:
        sql<number>`count(distinct ${schema.trainingSchemaExercises.id})`.as(
          "exercise_count"
        ),
    })
    .from(schema.trainingSchemas)
    .leftJoin(
      schema.trainingSchemaExercises,
      eq(
        schema.trainingSchemaExercises.schemaId,
        schema.trainingSchemas.id
      )
    )
    .groupBy(
      schema.trainingSchemas.id,
      schema.trainingSchemas.name,
      schema.trainingSchemas.description,
      schema.trainingSchemas.isPreset,
      schema.trainingSchemas.createdAt
    )
    .orderBy(desc(schema.trainingSchemas.isPreset), schema.trainingSchemas.name);

  return rows;
}

export async function getSchemaById(id: number) {
  const result = await db.query.trainingSchemas.findFirst({
    where: eq(schema.trainingSchemas.id, id),
    with: {
      trainingSchemaExercises: {
        orderBy: [schema.trainingSchemaExercises.sortOrder],
        with: {
          exercise: true,
        },
      },
    },
  });

  return result ?? null;
}

export async function createSchema(data: {
  name: string;
  description?: string;
  exerciseIds: number[];
}) {
  return db.transaction(async (tx) => {
    const [trainingSchema] = await tx
      .insert(schema.trainingSchemas)
      .values({
        name: data.name,
        description: data.description,
      })
      .returning();

    if (data.exerciseIds.length > 0) {
      await tx.insert(schema.trainingSchemaExercises).values(
        data.exerciseIds.map((exerciseId, index) => ({
          schemaId: trainingSchema.id,
          exerciseId,
          sortOrder: index,
        }))
      );
    }

    return trainingSchema;
  });
}

export async function updateSchema(
  id: number,
  data: {
    name: string;
    description?: string;
    exerciseIds: number[];
  }
) {
  return db.transaction(async (tx) => {
    const [trainingSchema] = await tx
      .update(schema.trainingSchemas)
      .set({ name: data.name, description: data.description })
      .where(eq(schema.trainingSchemas.id, id))
      .returning();

    if (!trainingSchema) throw new Error("Schema niet gevonden");

    await tx
      .delete(schema.trainingSchemaExercises)
      .where(eq(schema.trainingSchemaExercises.schemaId, id));

    if (data.exerciseIds.length > 0) {
      await tx.insert(schema.trainingSchemaExercises).values(
        data.exerciseIds.map((exerciseId, index) => ({
          schemaId: id,
          exerciseId,
          sortOrder: index,
        }))
      );
    }

    return trainingSchema;
  });
}

export async function deleteSchema(id: number) {
  return db
    .delete(schema.trainingSchemas)
    .where(eq(schema.trainingSchemas.id, id))
    .returning();
}

export async function startSessionFromSchema(
  schemaId: number,
  participantIds: number[],
  date?: string
) {
  const trainingSchema = await getSchemaById(schemaId);
  if (!trainingSchema) throw new Error("Schema niet gevonden");

  const sessionDate = date ?? new Date().toISOString().split("T")[0];

  return createSession({
    date: sessionDate,
    notes: trainingSchema.name,
    schemaId,
    participantIds,
    exercises: trainingSchema.trainingSchemaExercises.map((tse) => ({
      exerciseId: tse.exercise.id,
      sortOrder: tse.sortOrder,
      sets: [],
    })),
  });
}
