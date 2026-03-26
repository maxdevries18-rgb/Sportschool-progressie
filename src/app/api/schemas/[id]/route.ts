import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getSchemaById,
  updateSchema,
  deleteSchema,
} from "@/lib/queries/schemas";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const trainingSchema = await getSchemaById(Number(id));

    if (!trainingSchema) {
      return NextResponse.json(
        { error: "Schema niet gevonden." },
        { status: 404 }
      );
    }

    return NextResponse.json(trainingSchema);
  } catch (error) {
    console.error("Fout bij ophalen schema:", error);
    return NextResponse.json(
      { error: "Kon schema niet ophalen." },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const { name, description, exerciseIds } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Naam is verplicht." },
        { status: 400 }
      );
    }

    const trainingSchema = await updateSchema(schemaId, {
      name: name.trim(),
      description: description?.trim() || undefined,
      exerciseIds: exerciseIds || [],
    });

    revalidatePath(`/schemas/${id}`);
    revalidatePath("/schemas");

    return NextResponse.json(trainingSchema);
  } catch (error) {
    console.error("Fout bij bijwerken schema:", error);
    return NextResponse.json(
      { error: "Kon schema niet bijwerken." },
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
    await deleteSchema(Number(id));

    revalidatePath("/schemas");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Fout bij verwijderen schema:", error);
    return NextResponse.json(
      { error: "Kon schema niet verwijderen." },
      { status: 500 }
    );
  }
}
