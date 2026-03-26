import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { startSessionFromSchema } from "@/lib/queries/schemas";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const schemaId = parseInt(id, 10);
    if (isNaN(schemaId)) {
      return NextResponse.json(
        { error: "Ongeldig schema-ID." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { participantIds } = body;

    if (!participantIds?.length) {
      return NextResponse.json(
        { error: "Minstens één deelnemer is verplicht." },
        { status: 400 }
      );
    }

    const session = await startSessionFromSchema(schemaId, participantIds);

    revalidatePath("/sessions");
    revalidatePath("/");

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error("Fout bij starten sessie vanuit schema:", error);
    return NextResponse.json(
      { error: "Kon sessie niet starten." },
      { status: 500 }
    );
  }
}
