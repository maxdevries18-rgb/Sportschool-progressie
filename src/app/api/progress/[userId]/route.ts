import { NextRequest, NextResponse } from "next/server";
import { getProgressData, getPersonalRecords } from "@/lib/queries/progress";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const exerciseId = request.nextUrl.searchParams.get("exerciseId");

    if (!exerciseId) {
      return NextResponse.json(
        { error: "exerciseId query parameter is verplicht." },
        { status: 400 }
      );
    }

    const [progress, personalRecords] = await Promise.all([
      getProgressData(Number(userId), Number(exerciseId)),
      getPersonalRecords(Number(userId)),
    ]);

    return NextResponse.json({ progress, personalRecords });
  } catch (error) {
    console.error("Fout bij ophalen voortgang:", error);
    return NextResponse.json(
      { error: "Kon voortgang niet ophalen." },
      { status: 500 }
    );
  }
}
