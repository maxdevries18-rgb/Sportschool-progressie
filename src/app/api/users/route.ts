import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { asc } from "drizzle-orm";

export async function GET() {
  try {
    const allUsers = await db
      .select({
        id: users.id,
        name: users.name,
      })
      .from(users)
      .orderBy(asc(users.name));

    return NextResponse.json(allUsers);
  } catch (error) {
    console.error("Fout bij ophalen gebruikers:", error);
    return NextResponse.json(
      { error: "Kon gebruikers niet ophalen." },
      { status: 500 }
    );
  }
}
