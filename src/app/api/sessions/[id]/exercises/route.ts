import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { addExerciseToSession } from "@/lib/queries/sessions";

export async function POST(
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
    const { exerciseId, sets } = body;

    if (!exerciseId || !sets?.length) {
      return NextResponse.json(
        { error: "Oefening en sets zijn verplicht." },
        { status: 400 }
      );
    }

    const sessionExercise = await addExerciseToSession({
      sessionId,
      exerciseId,
      sets,
    });

    revalidatePath(`/sessions/${id}`);
    revalidatePath("/sessions");
    revalidatePath("/");

    return NextResponse.json(sessionExercise, { status: 201 });
  } catch (error) {
    console.error("Fout bij toevoegen oefening:", error);
    return NextResponse.json(
      { error: "Kon oefening niet toevoegen." },
      { status: 500 }
    );
  }
}
