"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function updateUser(id: number, name: string) {
  const [updated] = await db
    .update(users)
    .set({ name })
    .where(eq(users.id, id))
    .returning({ id: users.id, name: users.name });

  return updated;
}
