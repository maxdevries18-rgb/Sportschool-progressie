import { NextRequest, NextResponse } from "next/server";
import { getAllExercises } from "@/lib/queries/exercises";

export async function GET(request: NextRequest) {
  try {
    const muscleGroup = request.nextUrl.searchParams.get("muscleGroup") ?? undefined;
    const exercises = await getAllExercises(muscleGroup);
    return NextResponse.json(exercises);
  } catch (error) {
    console.error("Fout bij ophalen oefeningen:", error);
    return NextResponse.json(
      { error: "Kon oefeningen niet ophalen." },
      { status: 500 }
    );
  }
}
