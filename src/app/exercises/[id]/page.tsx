import Link from "next/link";
import { notFound } from "next/navigation";
import { getExerciseById } from "@/lib/queries/exercises";
import {
  MUSCLE_GROUP_LABELS,
  EQUIPMENT_LABELS,
  LEVEL_LABELS,
} from "@/lib/constants";
import type { MuscleGroup, Equipment, Level } from "@/lib/constants";
import { EditExerciseForm } from "@/components/exercises/edit-exercise-form";
import { DeleteExerciseButton } from "@/components/exercises/delete-exercise-button";
import { ExerciseImage } from "@/components/exercises/exercise-image";
import { FavoriteButton } from "@/components/exercises/favorite-button";

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
    borst: "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-900/20 dark:text-red-300 dark:ring-red-500/20",
    rug: "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-900/20 dark:text-blue-300 dark:ring-blue-500/20",
    benen: "bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-900/20 dark:text-green-300 dark:ring-green-500/20",
    schouders: "bg-yellow-50 text-yellow-700 ring-yellow-600/20 dark:bg-yellow-900/20 dark:text-yellow-300 dark:ring-yellow-500/20",
    armen: "bg-purple-50 text-purple-700 ring-purple-600/20 dark:bg-purple-900/20 dark:text-purple-300 dark:ring-purple-500/20",
    core: "bg-orange-50 text-orange-700 ring-orange-600/20 dark:bg-orange-900/20 dark:text-orange-300 dark:ring-orange-500/20",
  };

  const secondaryGroups: string[] = exercise.secondaryMuscleGroups
    ? JSON.parse(exercise.secondaryMuscleGroups)
    : [];

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/exercises"
        className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-500"
      >
        &larr; Terug naar oefeningen
      </Link>

      <div className="mt-4 rounded-xl bg-white dark:bg-gray-900 shadow-[var(--shadow-card)] ring-1 ring-gray-200/60 dark:ring-gray-700/60 overflow-hidden">
        {/* Images */}
        {(exercise.imageUrl || exercise.imageUrl2) && (
          <div className="grid grid-cols-2 gap-0.5 bg-gray-100 dark:bg-gray-800">
            {exercise.imageUrl && (
              <div className="relative aspect-[4/3]">
                <ExerciseImage
                  imageUrl={exercise.imageUrl}
                  name={`${exercise.name} - startpositie`}
                  size="lg"
                />
                <span className="absolute bottom-2 left-2 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">
                  Start
                </span>
              </div>
            )}
            {exercise.imageUrl2 && (
              <div className="relative aspect-[4/3]">
                <ExerciseImage
                  imageUrl={exercise.imageUrl2}
                  name={`${exercise.name} - eindpositie`}
                  size="lg"
                />
                <span className="absolute bottom-2 left-2 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">
                  Eind
                </span>
              </div>
            )}
          </div>
        )}

        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {exercise.name}
            </h1>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ring-1 ring-inset ${
                muscleGroupColors[exercise.muscleGroup] ??
                "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 ring-gray-600/20"
              }`}
            >
              {MUSCLE_GROUP_LABELS[exercise.muscleGroup as MuscleGroup] ??
                exercise.muscleGroup}
            </span>
          </div>

          {/* Metadata */}
          <div className="mt-3 flex flex-wrap gap-2">
            {exercise.equipment && (
              <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-1 text-xs font-medium text-gray-600 dark:text-gray-400">
                {EQUIPMENT_LABELS[exercise.equipment as Equipment] ?? exercise.equipment}
              </span>
            )}
            {exercise.level && (
              <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-1 text-xs font-medium text-gray-600 dark:text-gray-400">
                {LEVEL_LABELS[exercise.level as Level] ?? exercise.level}
              </span>
            )}
            {exercise.force && (
              <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-1 text-xs font-medium text-gray-600 dark:text-gray-400">
                {exercise.force === "push" ? "Push" : exercise.force === "pull" ? "Pull" : "Static"}
              </span>
            )}
            {secondaryGroups.map((group) => (
              <span
                key={group}
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
                  muscleGroupColors[group] ??
                  "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 ring-gray-600/20"
                }`}
              >
                {MUSCLE_GROUP_LABELS[group as MuscleGroup] ?? group}
              </span>
            ))}
          </div>

          {/* Actions */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <FavoriteButton
              exerciseId={exercise.id}
              initialIsFavorite={false}
              fetchOnMount={true}
              className="w-auto px-3 gap-1.5 rounded-full ring-1 ring-gray-200 dark:ring-gray-700 bg-white dark:bg-gray-800 text-sm font-medium"
            />
            <EditExerciseForm exercise={exercise} />
            <DeleteExerciseButton exerciseId={exercise.id} />
          </div>

          {/* Description */}
          {exercise.description ? (
            <div className="mt-4">
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Beschrijving
              </h2>
              <p className="mt-1 text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {exercise.description}
              </p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-gray-400 dark:text-gray-500 italic">
              Geen beschrijving beschikbaar.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
