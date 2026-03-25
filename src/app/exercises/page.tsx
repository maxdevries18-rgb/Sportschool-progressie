import Link from "next/link";
import { getAllExercises } from "@/lib/queries/exercises";
import { MUSCLE_GROUPS, MUSCLE_GROUP_LABELS } from "@/lib/constants";
import type { MuscleGroup } from "@/lib/constants";

export default async function ExercisesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { muscleGroup } = await searchParams;
  const selectedGroup = typeof muscleGroup === "string" ? muscleGroup : undefined;
  const exercises = await getAllExercises(selectedGroup);

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
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link
              href="/"
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              &larr; Dashboard
            </Link>
            <h1 className="mt-2 text-3xl font-bold text-gray-900">
              Oefeningen
            </h1>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <Link
            href="/exercises"
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              !selectedGroup
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50"
            }`}
          >
            Alle
          </Link>
          {MUSCLE_GROUPS.map((group) => (
            <Link
              key={group}
              href={`/exercises?muscleGroup=${group}`}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                selectedGroup === group
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50"
              }`}
            >
              {MUSCLE_GROUP_LABELS[group as MuscleGroup]}
            </Link>
          ))}
        </div>

        {exercises.length === 0 ? (
          <div className="rounded-xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-200">
            <svg
              className="mx-auto mb-4 h-12 w-12 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900">
              Geen oefeningen gevonden
            </h3>
            <p className="mt-1 text-gray-500">
              {selectedGroup
                ? "Er zijn geen oefeningen voor deze spiergroep."
                : "Er zijn nog geen oefeningen toegevoegd."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {exercises.map((exercise) => (
              <Link
                key={exercise.id}
                href={`/exercises/${exercise.id}`}
                className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200 transition hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-gray-900">
                    {exercise.name}
                  </h3>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                      muscleGroupColors[exercise.muscleGroup] ??
                      "bg-gray-50 text-gray-700 ring-gray-600/20"
                    }`}
                  >
                    {MUSCLE_GROUP_LABELS[exercise.muscleGroup as MuscleGroup] ??
                      exercise.muscleGroup}
                  </span>
                </div>
                {exercise.description && (
                  <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                    {exercise.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
  );
}
