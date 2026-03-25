import {
  pgTable,
  serial,
  text,
  integer,
  real,
  date,
  timestamp,
  primaryKey,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================
// TABELLEN
// ============================================

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const exercises = pgTable("exercises", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  muscleGroup: text("muscle_group").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sessionParticipants = pgTable(
  "session_participants",
  {
    sessionId: integer("session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
  },
  (table) => [primaryKey({ columns: [table.sessionId, table.userId] })]
);

export const sessionExercises = pgTable(
  "session_exercises",
  {
    id: serial("id").primaryKey(),
    sessionId: integer("session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    exerciseId: integer("exercise_id")
      .notNull()
      .references(() => exercises.id),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [unique().on(table.sessionId, table.exerciseId)]
);

export const sets = pgTable(
  "sets",
  {
    id: serial("id").primaryKey(),
    sessionExerciseId: integer("session_exercise_id")
      .notNull()
      .references(() => sessionExercises.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    setNumber: integer("set_number").notNull(),
    reps: integer("reps").notNull(),
    weightKg: real("weight_kg").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    unique().on(table.sessionExerciseId, table.userId, table.setNumber),
  ]
);

// ============================================
// RELATIES
// ============================================

export const usersRelations = relations(users, ({ many }) => ({
  sessionParticipants: many(sessionParticipants),
  sets: many(sets),
}));

export const exercisesRelations = relations(exercises, ({ many }) => ({
  sessionExercises: many(sessionExercises),
}));

export const sessionsRelations = relations(sessions, ({ many }) => ({
  participants: many(sessionParticipants),
  sessionExercises: many(sessionExercises),
}));

export const sessionParticipantsRelations = relations(
  sessionParticipants,
  ({ one }) => ({
    session: one(sessions, {
      fields: [sessionParticipants.sessionId],
      references: [sessions.id],
    }),
    user: one(users, {
      fields: [sessionParticipants.userId],
      references: [users.id],
    }),
  })
);

export const sessionExercisesRelations = relations(
  sessionExercises,
  ({ one, many }) => ({
    session: one(sessions, {
      fields: [sessionExercises.sessionId],
      references: [sessions.id],
    }),
    exercise: one(exercises, {
      fields: [sessionExercises.exerciseId],
      references: [exercises.id],
    }),
    sets: many(sets),
  })
);

export const setsRelations = relations(sets, ({ one }) => ({
  sessionExercise: one(sessionExercises, {
    fields: [sets.sessionExerciseId],
    references: [sessionExercises.id],
  }),
  user: one(users, {
    fields: [sets.userId],
    references: [users.id],
  }),
}));
