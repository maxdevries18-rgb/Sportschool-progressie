import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  updateExercise,
  deleteExercise,
  isExerciseInUse,
} from "@/lib/queries/exercises";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const exerciseId = parseInt(id, 10);
    if (isNaN(exerciseId)) {
      return NextResponse.json(
        { error: "Ongeldig oefening-ID." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, muscleGroup, description } = body;

    if (!name?.trim() || !muscleGroup) {
      return NextResponse.json(
        { error: "Naam en spiergroep zijn verplicht." },
        { status: 400 }
      );
    }

    const exercise = await updateExercise(exerciseId, {
      name: name.trim(),
      muscleGroup,
      description: description?.trim() || undefined,
    });

    revalidatePath("/exercises");
    revalidatePath(`/exercises/${id}`);

    return NextResponse.json(exercise);
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("unique")) {
      return NextResponse.json(
        { error: "Een oefening met deze naam bestaat al." },
        { status: 409 }
      );
    }
    console.error("Fout bij bijwerken oefening:", error);
    return NextResponse.json(
      { error: "Kon oefening niet bijwerken." },
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
    const exerciseId = parseInt(id, 10);
    if (isNaN(exerciseId)) {
      return NextResponse.json(
        { error: "Ongeldig oefening-ID." },
        { status: 400 }
      );
    }

    const inUse = await isExerciseInUse(exerciseId);
    if (inUse) {
      return NextResponse.json(
        { error: "Deze oefening wordt gebruikt in sessies en kan niet verwijderd worden." },
        { status: 409 }
      );
    }

    await deleteExercise(exerciseId);

    revalidatePath("/exercises");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Fout bij verwijderen oefening:", error);
    return NextResponse.json(
      { error: "Kon oefening niet verwijderen." },
      { status: 500 }
    );
  }
}
