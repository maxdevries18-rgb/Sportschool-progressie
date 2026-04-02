import { NextRequest, NextResponse } from "next/server";
import { toggleFavorite, getFavoriteExerciseIds } from "@/lib/queries/exercises";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const exerciseId = parseInt(id, 10);
    const body = await request.json();
    const userId = parseInt(body.userId, 10);

    if (!userId || isNaN(userId) || isNaN(exerciseId)) {
      return NextResponse.json({ error: "Ongeldige parameters." }, { status: 400 });
    }

    const isFavorite = await toggleFavorite(userId, exerciseId);
    return NextResponse.json({ isFavorite });
  } catch (error) {
    console.error("Fout bij toggling favoriet:", error);
    return NextResponse.json({ error: "Kon favoriet niet bijwerken." }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const exerciseId = parseInt(id, 10);
    const userId = parseInt(request.nextUrl.searchParams.get("userId") ?? "", 10);

    if (!userId || isNaN(userId) || isNaN(exerciseId)) {
      return NextResponse.json({ error: "Ongeldige parameters." }, { status: 400 });
    }

    const favoriteIds = await getFavoriteExerciseIds(userId);
    return NextResponse.json({ isFavorite: favoriteIds.includes(exerciseId) });
  } catch (error) {
    console.error("Fout bij ophalen favoriet status:", error);
    return NextResponse.json({ error: "Kon favoriet status niet ophalen." }, { status: 500 });
  }
}
