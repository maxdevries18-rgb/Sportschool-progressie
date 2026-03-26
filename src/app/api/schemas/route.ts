import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAllSchemas, createSchema } from "@/lib/queries/schemas";

export async function GET() {
  try {
    const schemas = await getAllSchemas();
    return NextResponse.json(schemas);
  } catch (error) {
    console.error("Fout bij ophalen schema's:", error);
    return NextResponse.json(
      { error: "Kon schema's niet ophalen." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, exerciseIds } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Naam is verplicht." },
        { status: 400 }
      );
    }

    const trainingSchema = await createSchema({
      name: name.trim(),
      description: description?.trim() || undefined,
      exerciseIds: exerciseIds || [],
    });

    revalidatePath("/schemas");

    return NextResponse.json(trainingSchema, { status: 201 });
  } catch (error) {
    console.error("Fout bij aanmaken schema:", error);
    return NextResponse.json(
      { error: "Kon schema niet aanmaken." },
      { status: 500 }
    );
  }
}
