import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionById } from "@/lib/queries/sessions";
import { formatDate } from "@/lib/utils";
import { ExerciseList } from "@/components/sessions/exercise-list";
import { AddExerciseForm } from "@/components/sessions/add-exercise-form";
import { DuplicateButton } from "@/components/sessions/duplicate-button";
import { DeleteButton } from "@/components/sessions/delete-button";

export const dynamic = "force-dynamic";

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSessionById(Number(id));

  if (!session) {
    notFound();
  }

  const participantIds = session.participants.map(
    (p: { userId: number }) => p.userId
  );
  const participantNames: Record<number, string> = {};
  for (const p of session.participants) {
    participantNames[p.userId] = p.user.name;
  }
  const existingExerciseIds = session.sessionExercises.map(
    (se: { exercise: { id: number } }) => se.exercise.id
  );

  return (
    <div className="space-y-6">
      <Link
        href="/sessions"
        className="inline-flex items-center text-sm text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 transition-colors"
      >
        ← Terug naar sessies
      </Link>

      {/* Header */}
      <div className="bg-white dark:bg-gray-900 rounded-xl ring-1 ring-gray-200/60 dark:ring-gray-700/60 shadow-[var(--shadow-card)] p-4 sm:p-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {formatDate(session.date)}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {session.participants
              .map((p: { user: { name: string } }) => p.user.name)
              .join(", ")}
          </p>
          {session.notes && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 italic">
              {session.notes}
            </p>
          )}
          {session.trainingSchema && (
            <p className="mt-2">
              <Link
                href={`/schemas/${session.trainingSchema.id}`}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-2.5 py-1 rounded-full hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors"
              >
                📋 {session.trainingSchema.name}
              </Link>
            </p>
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href={`/sessions/${session.id}/edit`}
            className="px-3 py-1.5 text-sm rounded-xl bg-white dark:bg-gray-800 ring-1 ring-gray-200 dark:ring-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-150"
          >
            ✏️ Bewerken
          </Link>
          <DuplicateButton sessionId={session.id} />
          <DeleteButton sessionId={session.id} />
        </div>
      </div>

      {/* Exercises */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Oefeningen ({session.sessionExercises.length})
        </h2>

        {session.sessionExercises.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-xl ring-1 ring-gray-200/60 dark:ring-gray-700/60 shadow-[var(--shadow-card)] p-8 text-center">
            <p className="text-4xl mb-3">🏋️</p>
            <p className="text-gray-500 dark:text-gray-400">
              Nog geen oefeningen toegevoegd.
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Voeg je eerste oefening toe!
            </p>
          </div>
        ) : (
          <ExerciseList
            sessionId={session.id}
            sessionExercises={session.sessionExercises}
            participants={session.participants}
          />
        )}

        <AddExerciseForm
          sessionId={session.id}
          participantIds={participantIds}
          participantNames={participantNames}
          existingExerciseIds={existingExerciseIds}
        />
      </div>
    </div>
  );
}
