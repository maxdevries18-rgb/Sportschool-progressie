"use server";

import { db } from "@/db";
import { eq, desc, sql } from "drizzle-orm";
import * as schema from "@/db/schema";

export async function getAllSessions() {
  const rows = await db
    .select({
      id: schema.sessions.id,
      date: schema.sessions.date,
      notes: schema.sessions.notes,
      createdAt: schema.sessions.createdAt,
      exerciseCount:
        sql<number>`(select count(distinct ${schema.sessionExercises.id}) from ${schema.sessionExercises} where ${schema.sessionExercises.sessionId} = ${schema.sessions.id})`.as(
          "exercise_count"
        ),
    })
    .from(schema.sessions)
    .orderBy(desc(schema.sessions.date));

  // Fetch participants for each session in one query
  const sessionIds = rows.map((r) => r.id);
  if (sessionIds.length === 0) return [];

  const participants = await db
    .select({
      sessionId: schema.sessionParticipants.sessionId,
      userId: schema.users.id,
      userName: schema.users.name,
    })
    .from(schema.sessionParticipants)
    .innerJoin(
      schema.users,
      eq(schema.sessionParticipants.userId, schema.users.id)
    )
    .where(
      sql`${schema.sessionParticipants.sessionId} in ${sessionIds}`
    );

  const participantMap = new Map<
    number,
    { userId: number; userName: string }[]
  >();
  for (const p of participants) {
    if (!participantMap.has(p.sessionId)) {
      participantMap.set(p.sessionId, []);
    }
    participantMap.get(p.sessionId)!.push({
      userId: p.userId,
      userName: p.userName,
    });
  }

  return rows.map((row) => ({
    ...row,
    participants: participantMap.get(row.id) ?? [],
  }));
}

export async function getSessionById(id: number) {
  const session = await db.query.sessions.findFirst({
    where: eq(schema.sessions.id, id),
    with: {
      participants: {
        with: {
          user: true,
        },
      },
      sessionExercises: {
        orderBy: [schema.sessionExercises.sortOrder],
        with: {
          exercise: true,
          sets: {
            orderBy: [schema.sets.userId, schema.sets.setNumber],
            with: {
              user: true,
            },
          },
        },
      },
    },
  });

  return session ?? null;
}

export async function createSession(data: {
  date: string;
  notes?: string;
  participantIds: number[];
  exercises: {
    exerciseId: number;
    sortOrder: number;
    sets: {
      userId: number;
      setNumber: number;
      reps: number;
      weightKg: number;
    }[];
  }[];
}) {
  return db.transaction(async (tx) => {
    // 1. Create the session
    const [session] = await tx
      .insert(schema.sessions)
      .values({
        date: data.date,
        notes: data.notes,
      })
      .returning();

    // 2. Add participants
    if (data.participantIds.length > 0) {
      await tx.insert(schema.sessionParticipants).values(
        data.participantIds.map((userId) => ({
          sessionId: session.id,
          userId,
        }))
      );
    }

    // 3. Add exercises and their sets
    for (const exercise of data.exercises) {
      const [sessionExercise] = await tx
        .insert(schema.sessionExercises)
        .values({
          sessionId: session.id,
          exerciseId: exercise.exerciseId,
          sortOrder: exercise.sortOrder,
        })
        .returning();

      if (exercise.sets.length > 0) {
        await tx.insert(schema.sets).values(
          exercise.sets.map((set) => ({
            sessionExerciseId: sessionExercise.id,
            userId: set.userId,
            setNumber: set.setNumber,
            reps: set.reps,
            weightKg: set.weightKg,
          }))
        );
      }
    }

    return session;
  });
}

export async function deleteSession(id: number) {
  return db
    .delete(schema.sessions)
    .where(eq(schema.sessions.id, id))
    .returning();
}
