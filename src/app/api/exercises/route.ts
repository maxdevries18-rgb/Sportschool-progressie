import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAllExercises, createExercise } from "@/lib/queries/exercises";

export async function GET(request: NextRequest) {
  try {
    const muscleGroup = request.nextUrl.searchParams.get("muscleGroup") ?? undefined;
    const search = request.nextUrl.searchParams.get("search") ?? undefined;
    const page = parseInt(request.nextUrl.searchParams.get("page") ?? "1", 10) || 1;
    const result = await getAllExercises(muscleGroup, search, page);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Fout bij ophalen oefeningen:", error);
    return NextResponse.json(
      { error: "Kon oefeningen niet ophalen." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, muscleGroup, description, equipment, level } = body;

    if (!name?.trim() || !muscleGroup) {
      return NextResponse.json(
        { error: "Naam en spiergroep zijn verplicht." },
        { status: 400 }
      );
    }

    const exercise = await createExercise({
      name: name.trim(),
      muscleGroup,
      description: description?.trim() || undefined,
      equipment: equipment || undefined,
      level: level || undefined,
    });

    revalidatePath("/exercises");

    return NextResponse.json(exercise, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("unique")) {
      return NextResponse.json(
        { error: "Een oefening met deze naam bestaat al." },
        { status: 409 }
      );
    }
    console.error("Fout bij aanmaken oefening:", error);
    return NextResponse.json(
      { error: "Kon oefening niet aanmaken." },
      { status: 500 }
    );
  }
}
