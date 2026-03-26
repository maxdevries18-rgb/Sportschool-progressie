"use server";

import { db } from "@/db";
import { eq, desc, sql, and } from "drizzle-orm";
import * as schema from "@/db/schema";

export async function getAllSessions() {
  const rows = await db
    .select({
      id: schema.sessions.id,
      date: schema.sessions.date,
      notes: schema.sessions.notes,
      createdAt: schema.sessions.createdAt,
      exerciseCount:
        sql<number>`count(distinct ${schema.sessionExercises.id})`.as(
          "exercise_count"
        ),
    })
    .from(schema.sessions)
    .leftJoin(
      schema.sessionExercises,
      eq(schema.sessionExercises.sessionId, schema.sessions.id)
    )
    .groupBy(
      schema.sessions.id,
      schema.sessions.date,
      schema.sessions.notes,
      schema.sessions.createdAt
    )
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

export async function getSessionsByUser(userId: number) {
  const rows = await db
    .select({
      id: schema.sessions.id,
      date: schema.sessions.date,
      notes: schema.sessions.notes,
      createdAt: schema.sessions.createdAt,
      exerciseCount:
        sql<number>`count(distinct ${schema.sessionExercises.id})`.as(
          "exercise_count"
        ),
    })
    .from(schema.sessions)
    .innerJoin(
      schema.sessionParticipants,
      and(
        eq(schema.sessionParticipants.sessionId, schema.sessions.id),
        eq(schema.sessionParticipants.userId, userId)
      )
    )
    .leftJoin(
      schema.sessionExercises,
      eq(schema.sessionExercises.sessionId, schema.sessions.id)
    )
    .groupBy(
      schema.sessions.id,
      schema.sessions.date,
      schema.sessions.notes,
      schema.sessions.createdAt
    )
    .orderBy(desc(schema.sessions.date));

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
  exercises?: {
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

    // 3. Add exercises and their sets (optional)
    if (data.exercises && data.exercises.length > 0) {
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
    }

    return session;
  });
}

export async function updateSession(
  id: number,
  data: {
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
  }
) {
  return db.transaction(async (tx) => {
    // 1. Update session date/notes
    const [session] = await tx
      .update(schema.sessions)
      .set({ date: data.date, notes: data.notes })
      .where(eq(schema.sessions.id, id))
      .returning();

    if (!session) throw new Error("Sessie niet gevonden");

    // 2. Delete existing exercises (cascades to sets) and participants
    await tx
      .delete(schema.sessionExercises)
      .where(eq(schema.sessionExercises.sessionId, id));
    await tx
      .delete(schema.sessionParticipants)
      .where(eq(schema.sessionParticipants.sessionId, id));

    // 3. Re-insert participants
    if (data.participantIds.length > 0) {
      await tx.insert(schema.sessionParticipants).values(
        data.participantIds.map((userId) => ({
          sessionId: id,
          userId,
        }))
      );
    }

    // 4. Re-insert exercises and sets
    for (const exercise of data.exercises) {
      const [sessionExercise] = await tx
        .insert(schema.sessionExercises)
        .values({
          sessionId: id,
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

export async function addExerciseToSession(data: {
  sessionId: number;
  exerciseId: number;
  sets: { userId: number; setNumber: number; reps: number; weightKg: number }[];
}) {
  return db.transaction(async (tx) => {
    const existing = await tx
      .select({
        maxOrder:
          sql<number>`coalesce(max(${schema.sessionExercises.sortOrder}), -1)`,
      })
      .from(schema.sessionExercises)
      .where(eq(schema.sessionExercises.sessionId, data.sessionId));

    const nextOrder = (existing[0]?.maxOrder ?? -1) + 1;

    const [sessionExercise] = await tx
      .insert(schema.sessionExercises)
      .values({
        sessionId: data.sessionId,
        exerciseId: data.exerciseId,
        sortOrder: nextOrder,
      })
      .returning();

    if (data.sets.length > 0) {
      await tx.insert(schema.sets).values(
        data.sets.map((s) => ({
          sessionExerciseId: sessionExercise.id,
          userId: s.userId,
          setNumber: s.setNumber,
          reps: s.reps,
          weightKg: s.weightKg,
        }))
      );
    }

    return sessionExercise;
  });
}

export async function removeExerciseFromSession(sessionExerciseId: number) {
  return db
    .delete(schema.sessionExercises)
    .where(eq(schema.sessionExercises.id, sessionExerciseId))
    .returning();
}

export async function updateSessionMeta(
  id: number,
  data: { date: string; notes?: string; participantIds: number[] }
) {
  return db.transaction(async (tx) => {
    const [session] = await tx
      .update(schema.sessions)
      .set({ date: data.date, notes: data.notes })
      .where(eq(schema.sessions.id, id))
      .returning();

    if (!session) throw new Error("Sessie niet gevonden");

    await tx
      .delete(schema.sessionParticipants)
      .where(eq(schema.sessionParticipants.sessionId, id));

    if (data.participantIds.length > 0) {
      await tx.insert(schema.sessionParticipants).values(
        data.participantIds.map((userId) => ({ sessionId: id, userId }))
      );
    }

    return session;
  });
}
