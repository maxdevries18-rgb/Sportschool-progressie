import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSessionById, deleteSession } from "@/lib/queries/sessions";
import { formatDate, calculateVolume } from "@/lib/utils";

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

  const participants = session.participants.map(
    (p: { user: { id: number; name: string } }) => p.user
  );

  async function handleDelete() {
    "use server";
    await deleteSession(Number(id));
    redirect("/sessions");
  }

  return (
    <div className="mx-auto max-w-6xl">
        <Link
          href="/sessions"
          className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          &larr; Terug naar sessies
        </Link>

        <div className="mt-4 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Sessie van {formatDate(session.date)}
            </h1>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              Deelnemers: {participants.map((p: { name: string }) => p.name).join(", ")}
            </p>
            {session.notes && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 italic">
                {session.notes}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/sessions/${id}/edit`}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 text-sm font-medium text-indigo-700 dark:text-indigo-300 ring-1 ring-inset ring-indigo-600/20 transition-all duration-150 hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
              </svg>
              Bewerken
            </Link>
            <form action={handleDelete}>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-900/30 px-4 py-2 text-sm font-medium text-red-700 dark:text-red-300 ring-1 ring-inset ring-red-600/20 transition-all duration-150 hover:bg-red-100 dark:hover:bg-red-900/50"
              >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                />
              </svg>
              Verwijderen
              </button>
            </form>
          </div>
        </div>

        <div className="mt-6 space-y-6">
          {session.sessionExercises.length === 0 ? (
            <div className="rounded-xl bg-white dark:bg-gray-900 p-8 text-center shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
              <p className="text-gray-500 dark:text-gray-400">
                Er zijn geen oefeningen geregistreerd voor deze sessie.
              </p>
            </div>
          ) : (
            session.sessionExercises.map(
              (se: {
                id: number;
                exercise: { id: number; name: string };
                sets: Array<{
                  id: number;
                  userId: number;
                  setNumber: number;
                  reps: number;
                  weightKg: number;
                }>;
              }) => {
                const maxSetNumber = Math.max(
                  ...se.sets.map((s) => s.setNumber),
                  0
                );
                const setNumbers = Array.from(
                  { length: maxSetNumber },
                  (_, i) => i + 1
                );

                return (
                  <div
                    key={se.id}
                    className="rounded-xl bg-white dark:bg-gray-900 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700"
                  >
                    <div className="border-b border-gray-100 dark:border-gray-800 px-5 py-4">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {se.exercise.name}
                      </h2>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-100 dark:border-gray-800 text-left text-gray-500 dark:text-gray-400">
                            <th className="px-5 py-3 font-medium">Set</th>
                            {participants.map((p: { id: number; name: string }) => (
                              <th
                                key={p.id}
                                colSpan={3}
                                className="px-3 py-3 text-center font-medium"
                              >
                                {p.name}
                              </th>
                            ))}
                          </tr>
                          <tr className="border-b border-gray-100 dark:border-gray-800 text-xs text-gray-400 dark:text-gray-500">
                            <th className="px-5 py-2" />
                            {participants.map((p: { id: number; name: string }) => (
                              <React.Fragment key={p.id}>
                                <th className="px-3 py-2 text-center font-medium">
                                  Reps
                                </th>
                                <th className="px-3 py-2 text-center font-medium">
                                  Gewicht (kg)
                                </th>
                                <th className="px-3 py-2 text-center font-medium">
                                  Volume
                                </th>
                              </React.Fragment>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {setNumbers.map((setNum) => (
                            <tr
                              key={setNum}
                              className="border-b border-gray-50 dark:border-gray-800 last:border-0 even:bg-gray-50 dark:even:bg-gray-800/50"
                            >
                              <td className="px-5 py-3 font-medium text-gray-700 dark:text-gray-300">
                                {setNum}
                              </td>
                              {participants.map((p: { id: number; name: string }) => {
                                const set = se.sets.find(
                                  (s) =>
                                    s.userId === p.id &&
                                    s.setNumber === setNum
                                );
                                return set ? (
                                  <React.Fragment key={p.id}>
                                    <td className="px-3 py-3 text-center text-gray-700 dark:text-gray-300">
                                      {set.reps}
                                    </td>
                                    <td className="px-3 py-3 text-center text-gray-700 dark:text-gray-300">
                                      {set.weightKg}
                                    </td>
                                    <td className="px-3 py-3 text-center font-medium text-indigo-600 dark:text-indigo-400">
                                      {calculateVolume(
                                        set.reps,
                                        set.weightKg
                                      )}
                                    </td>
                                  </React.Fragment>
                                ) : (
                                  <React.Fragment key={p.id}>
                                    <td className="px-3 py-3 text-center text-gray-300 dark:text-gray-600">
                                      -
                                    </td>
                                    <td className="px-3 py-3 text-center text-gray-300 dark:text-gray-600">
                                      -
                                    </td>
                                    <td className="px-3 py-3 text-center text-gray-300 dark:text-gray-600">
                                      -
                                    </td>
                                  </React.Fragment>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              }
            )
          )}
        </div>
      </div>
  );
}
