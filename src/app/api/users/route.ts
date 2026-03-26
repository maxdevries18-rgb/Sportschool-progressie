import { NextRequest, NextResponse } from "next/server";
import { getAllUsers, createUser } from "@/lib/queries/users";

export async function GET() {
  try {
    const users = await getAllUsers();
    return NextResponse.json(users);
  } catch (error) {
    console.error("Fout bij ophalen gebruikers:", error);
    return NextResponse.json(
      { error: "Kon gebruikers niet ophalen." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Naam is verplicht." },
        { status: 400 }
      );
    }

    const newUser = await createUser(name);
    return NextResponse.json(newUser, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("unique")) {
      return NextResponse.json(
        { error: "Deze naam is al in gebruik." },
        { status: 409 }
      );
    }
    console.error("Fout bij aanmaken gebruiker:", error);
    return NextResponse.json(
      { error: "Kon gebruiker niet aanmaken." },
      { status: 500 }
    );
  }
}
