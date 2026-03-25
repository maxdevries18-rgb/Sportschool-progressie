import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { removeExerciseFromSession } from "@/lib/queries/sessions";

export async function DELETE(
  _request: Request,
  {
    params,
  }: { params: Promise<{ id: string; sessionExerciseId: string }> }
) {
  try {
    const { id, sessionExerciseId } = await params;

    await removeExerciseFromSession(parseInt(sessionExerciseId, 10));

    revalidatePath(`/sessions/${id}`);
    revalidatePath("/sessions");
    revalidatePath("/");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Fout bij verwijderen oefening:", error);
    return NextResponse.json(
      { error: "Kon oefening niet verwijderen." },
      { status: 500 }
    );
  }
}
