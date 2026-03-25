import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getSessionById,
  deleteSession,
  updateSession,
  updateSessionMeta,
} from "@/lib/queries/sessions";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSessionById(Number(id));

    if (!session) {
      return NextResponse.json(
        { error: "Sessie niet gevonden." },
        { status: 404 }
      );
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error("Fout bij ophalen sessie:", error);
    return NextResponse.json(
      { error: "Kon sessie niet ophalen." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessionId = parseInt(id, 10);
    if (isNaN(sessionId)) {
      return NextResponse.json(
        { error: "Ongeldig sessie-ID." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { date, notes, participantIds, exercises } = body;

    if (!date || !participantIds?.length || !exercises?.length) {
      return NextResponse.json(
        { error: "Datum, deelnemers en oefeningen zijn verplicht." },
        { status: 400 }
      );
    }

    const session = await updateSession(sessionId, {
      date,
      notes: notes || undefined,
      participantIds,
      exercises,
    });

    revalidatePath(`/sessions/${id}`);
    revalidatePath("/sessions");
    revalidatePath("/");

    return NextResponse.json(session);
  } catch (error) {
    console.error("Fout bij bijwerken sessie:", error);
    return NextResponse.json(
      { error: "Kon sessie niet bijwerken." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessionId = parseInt(id, 10);
    if (isNaN(sessionId)) {
      return NextResponse.json(
        { error: "Ongeldig sessie-ID." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { date, notes, participantIds } = body;

    if (!date || !participantIds?.length) {
      return NextResponse.json(
        { error: "Datum en deelnemers zijn verplicht." },
        { status: 400 }
      );
    }

    const session = await updateSessionMeta(sessionId, {
      date,
      notes: notes || undefined,
      participantIds,
    });

    revalidatePath(`/sessions/${id}`);
    revalidatePath("/sessions");
    revalidatePath("/");

    return NextResponse.json(session);
  } catch (error) {
    console.error("Fout bij bijwerken sessie:", error);
    return NextResponse.json(
      { error: "Kon sessie niet bijwerken." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteSession(Number(id));

    revalidatePath("/sessions");
    revalidatePath("/");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Fout bij verwijderen sessie:", error);
    return NextResponse.json(
      { error: "Kon sessie niet verwijderen." },
      { status: 500 }
    );
  }
}
