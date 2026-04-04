import Link from "next/link";
import { Suspense } from "react";
import { getAllExercises, getFavoriteExerciseIds } from "@/lib/queries/exercises";
import { MUSCLE_GROUPS, MUSCLE_GROUP_LABELS, EQUIPMENT_LABELS } from "@/lib/constants";
import type { MuscleGroup, Equipment } from "@/lib/constants";
import { AddExerciseForm } from "@/components/exercises/add-exercise-form";
import { ExerciseSearch } from "@/components/exercises/exercise-search";
import { Pagination } from "@/components/exercises/pagination";
import { ExerciseImage } from "@/components/exercises/exercise-image";
import { FavoriteButton } from "@/components/exercises/favorite-button";
import { FavoritesFilterButton } from "@/components/exercises/favorites-filter-button";

export default async function ExercisesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const selectedGroup = typeof params.muscleGroup === "string" ? params.muscleGroup : undefined;
  const search = typeof params.search === "string" ? params.search : undefined;
  const page = typeof params.page === "string" ? Math.max(1, parseInt(params.page, 10) || 1) : 1;
  const favoritesOnly = params.favorites === "1";
  const userId = typeof params.userId === "string" ? parseInt(params.userId, 10) || undefined : undefined;

  const { exercises, total, totalPages } = await getAllExercises(selectedGroup, search, page, userId, favoritesOnly);
  const favoriteIds = userId ? await getFavoriteExerciseIds(userId) : [];

  const muscleGroupColors: Record<string, string> = {
    borst: "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-900/20 dark:text-red-300 dark:ring-red-500/20",
    rug: "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-900/20 dark:text-blue-300 dark:ring-blue-500/20",
    benen: "bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-900/20 dark:text-green-300 dark:ring-green-500/20",
    schouders: "bg-yellow-50 text-yellow-700 ring-yellow-600/20 dark:bg-yellow-900/20 dark:text-yellow-300 dark:ring-yellow-500/20",
    armen: "bg-purple-50 text-purple-700 ring-purple-600/20 dark:bg-purple-900/20 dark:text-purple-300 dark:ring-purple-500/20",
    core: "bg-orange-50 text-orange-700 ring-orange-600/20 dark:bg-orange-900/20 dark:text-orange-300 dark:ring-orange-500/20",
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link
            href="/"
            className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-500"
          >
            &larr; Dashboard
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
            Oefeningen
          </h1>
        </div>
      </div>

      <div className="mb-4">
        <Suspense>
          <ExerciseSearch />
        </Suspense>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          href="/exercises"
          className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-150 ${
            !selectedGroup && !favoritesOnly
              ? "bg-gradient-to-b from-primary-500 to-primary-600 text-white shadow-sm"
              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 ring-1 ring-gray-200 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
          }`}
        >
          Alle
        </Link>
        <Suspense>
          <FavoritesFilterButton />
        </Suspense>
        {MUSCLE_GROUPS.map((group) => (
          <Link
            key={group}
            href={`/exercises?muscleGroup=${group}${search ? `&search=${search}` : ""}`}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-150 ${
              selectedGroup === group
                ? "bg-gradient-to-b from-primary-500 to-primary-600 text-white shadow-sm"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 ring-1 ring-gray-200 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            {MUSCLE_GROUP_LABELS[group as MuscleGroup]}
          </Link>
        ))}
      </div>

      {exercises.length === 0 ? (
        <div className="rounded-xl bg-white dark:bg-gray-900 p-8 text-center shadow-sm ring-1 ring-gray-200/60 dark:ring-gray-700/60">
          <svg
            className="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-600"
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
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Geen oefeningen gevonden
          </h3>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            {search
              ? `Geen resultaten voor "${search}".`
              : selectedGroup
                ? "Er zijn geen oefeningen voor deze spiergroep."
                : "Er zijn nog geen oefeningen toegevoegd."}
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {exercises.map((exercise) => (
              <div key={exercise.id} className="relative">
                <Link
                  href={`/exercises/${exercise.id}`}
                  className="group rounded-xl bg-white dark:bg-gray-900 shadow-[var(--shadow-card)] ring-1 ring-gray-200/60 dark:ring-gray-700/60 transition hover:shadow-[var(--shadow-card-hover)] overflow-hidden block"
                >
                  <ExerciseImage
                    imageUrl={exercise.imageUrl}
                    name={exercise.name}
                    size="md"
                  />
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm leading-tight">
                        {exercise.name}
                      </h3>
                      <span
                        className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                          muscleGroupColors[exercise.muscleGroup] ??
                          "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 ring-gray-600/20"
                        }`}
                      >
                        {MUSCLE_GROUP_LABELS[exercise.muscleGroup as MuscleGroup] ??
                          exercise.muscleGroup}
                      </span>
                    </div>
                    {exercise.equipment && (
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {EQUIPMENT_LABELS[exercise.equipment as Equipment] ?? exercise.equipment}
                      </p>
                    )}
                  </div>
                </Link>
                <div className="absolute top-2 right-2">
                  <FavoriteButton
                    exerciseId={exercise.id}
                    initialIsFavorite={favoriteIds.includes(exercise.id)}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <Suspense>
              <Pagination currentPage={page} totalPages={totalPages} total={total} />
            </Suspense>
          </div>
        </>
      )}

      <div className="mt-6">
        <AddExerciseForm />
      </div>
    </div>
  );
}
