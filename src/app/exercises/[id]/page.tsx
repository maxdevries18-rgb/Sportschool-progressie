import Link from "next/link";
import { notFound } from "next/navigation";
import { getExerciseById } from "@/lib/queries/exercises";
import { MUSCLE_GROUP_LABELS } from "@/lib/constants";
import type { MuscleGroup } from "@/lib/constants";

export default async function ExerciseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const exercise = await getExerciseById(Number(id));

  if (!exercise) {
    notFound();
  }

  const muscleGroupColors: Record<string, string> = {
    borst: "bg-red-50 text-red-700 ring-red-600/20",
    rug: "bg-blue-50 text-blue-700 ring-blue-600/20",
    benen: "bg-green-50 text-green-700 ring-green-600/20",
    schouders: "bg-yellow-50 text-yellow-700 ring-yellow-600/20",
    armen: "bg-purple-50 text-purple-700 ring-purple-600/20",
    core: "bg-orange-50 text-orange-700 ring-orange-600/20",
  };

  return (
    <div className="mx-auto max-w-4xl">
        <Link
          href="/exercises"
          className="text-sm text-indigo-600 hover:text-indigo-500"
        >
          &larr; Terug naar oefeningen
        </Link>

        <div className="mt-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <div className="flex items-start justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              {exercise.name}
            </h1>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ring-1 ring-inset ${
                muscleGroupColors[exercise.muscleGroup] ??
                "bg-gray-50 text-gray-700 ring-gray-600/20"
              }`}
            >
              {MUSCLE_GROUP_LABELS[exercise.muscleGroup as MuscleGroup] ??
                exercise.muscleGroup}
            </span>
          </div>

          {exercise.description ? (
            <div className="mt-4">
              <h2 className="text-sm font-medium text-gray-500">
                Beschrijving
              </h2>
              <p className="mt-1 text-gray-700 whitespace-pre-line">
                {exercise.description}
              </p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-gray-400 italic">
              Geen beschrijving beschikbaar.
            </p>
          )}
        </div>
      </div>
  );
}
