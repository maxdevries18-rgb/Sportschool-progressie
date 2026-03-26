import { NextRequest, NextResponse } from "next/server";
import { getWeeklyOverview } from "@/lib/queries/weekly";

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");
    const weeks = await getWeeklyOverview(
      6,
      userId ? Number(userId) : undefined
    );
    return NextResponse.json(weeks);
  } catch (error) {
    console.error("Fout bij ophalen weekoverzicht:", error);
    return NextResponse.json(
      { error: "Kon weekoverzicht niet ophalen." },
      { status: 500 }
    );
  }
}
