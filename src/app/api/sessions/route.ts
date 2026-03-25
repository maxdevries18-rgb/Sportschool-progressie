import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAllSessions, createSession } from "@/lib/queries/sessions";

export async function GET() {
  try {
    const sessions = await getAllSessions();
    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Fout bij ophalen sessies:", error);
    return NextResponse.json(
      { error: "Kon sessies niet ophalen." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { date, notes, participantIds, exercises } = body;

    if (!date || !participantIds?.length) {
      return NextResponse.json(
        { error: "Datum en deelnemers zijn verplicht." },
        { status: 400 }
      );
    }

    const session = await createSession({
      date,
      notes,
      participantIds,
      exercises: exercises || [],
    });

    revalidatePath("/sessions");
    revalidatePath("/");

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error("Fout bij aanmaken sessie:", error);
    return NextResponse.json(
      { error: "Kon sessie niet aanmaken." },
      { status: 500 }
    );
  }
}
