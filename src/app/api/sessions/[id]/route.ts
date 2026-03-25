import { NextResponse } from "next/server";
import { getSessionById, deleteSession } from "@/lib/queries/sessions";

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

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteSession(Number(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Fout bij verwijderen sessie:", error);
    return NextResponse.json(
      { error: "Kon sessie niet verwijderen." },
      { status: 500 }
    );
  }
}
