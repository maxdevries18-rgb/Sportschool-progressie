import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { duplicateSession } from "@/lib/queries/sessions";

export async function POST(
  _request: Request,
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

    const newSession = await duplicateSession(sessionId);

    revalidatePath("/sessions");
    revalidatePath("/");

    return NextResponse.json(newSession, { status: 201 });
  } catch (error) {
    console.error("Fout bij dupliceren sessie:", error);
    return NextResponse.json(
      { error: "Kon sessie niet dupliceren." },
      { status: 500 }
    );
  }
}
