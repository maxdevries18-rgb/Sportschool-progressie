import { NextResponse } from "next/server";
import { updateUser } from "@/lib/queries/users";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: "Ongeldig gebruikers-ID." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const name = body.name?.trim();

    if (!name) {
      return NextResponse.json(
        { error: "Naam mag niet leeg zijn." },
        { status: 400 }
      );
    }

    const updated = await updateUser(userId, name);

    if (!updated) {
      return NextResponse.json(
        { error: "Gebruiker niet gevonden." },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Fout bij bijwerken gebruiker:", error);
    return NextResponse.json(
      { error: "Kon gebruiker niet bijwerken." },
      { status: 500 }
    );
  }
}
