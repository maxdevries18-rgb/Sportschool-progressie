import { NextRequest, NextResponse } from "next/server";
import { getLastExerciseSets } from "@/lib/queries/sessions";

export async function GET(request: NextRequest) {
  try {
    const exerciseId = Number(request.nextUrl.searchParams.get("exerciseId"));
    const userIdsParam = request.nextUrl.searchParams.get("userIds");

    if (!exerciseId || !userIdsParam) {
      return NextResponse.json(
        { error: "exerciseId en userIds zijn verplicht." },
        { status: 400 }
      );
    }

    const userIds = userIdsParam.split(",").map(Number).filter(Boolean);
    const sets = await getLastExerciseSets(exerciseId, userIds);

    return NextResponse.json(sets);
  } catch (error) {
    console.error("Fout bij ophalen vorige sets:", error);
    return NextResponse.json(
      { error: "Kon vorige sets niet ophalen." },
      { status: 500 }
    );
  }
}
