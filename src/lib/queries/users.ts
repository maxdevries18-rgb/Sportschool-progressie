"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function getAllUsers() {
  return db
    .select({ id: users.id, name: users.name })
    .from(users)
    .orderBy(asc(users.name));
}

export async function createUser(name: string) {
  const [newUser] = await db
    .insert(users)
    .values({ name: name.trim() })
    .returning({ id: users.id, name: users.name });

  return newUser;
}

export async function updateUser(id: number, name: string) {
  const [updated] = await db
    .update(users)
    .set({ name })
    .where(eq(users.id, id))
    .returning({ id: users.id, name: users.name });

  return updated;
}
