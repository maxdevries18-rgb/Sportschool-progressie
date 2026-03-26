"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

interface ExerciseCardProps {
  sessionId: number;
  sessionExercise: {
    id: number;
    exercise: { id: number; name: string; muscleGroup: string; imageUrl: string | null };
    sets: {
      id: number;
      userId: number;
      setNumber: number;
      reps: number;
      weightKg: number;
      user: { id: number; name: string };
    }[];
  };
  participants: { userId: number; user: { id: number; name: string } }[];
  onDelete?: (id: number) => void;
}

export function ExerciseCard({
  sessionId,
  sessionExercise,
  participants,
  onDelete,
}: ExerciseCardProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Weet je zeker dat je deze oefening wilt verwijderen?")) return;
    setDeleting(true);

    try {
      const res = await fetch(
        `/api/sessions/${sessionId}/exercises/${sessionExercise.id}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        onDelete?.(sessionExercise.id);
        router.refresh();
      }
    } catch {
      // ignore
    } finally {
      setDeleting(false);
    }
  };

  const totalSets = sessionExercise.sets.length > 0
    ? Math.max(...sessionExercise.sets.map((s) => s.setNumber))
    : 0;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl ring-1 ring-gray-200/60 dark:ring-gray-700/60 shadow-[var(--shadow-card)] p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {sessionExercise.exercise.imageUrl && (
            <Image
              src={sessionExercise.exercise.imageUrl}
              alt={sessionExercise.exercise.name}
              width={40}
              height={40}
              className="h-10 w-10 rounded-lg object-cover shrink-0"
              unoptimized
            />
          )}
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            {sessionExercise.exercise.name}
          </h3>
          <Badge label={sessionExercise.exercise.muscleGroup} variant={sessionExercise.exercise.muscleGroup as "borst" | "rug" | "benen" | "schouders" | "armen" | "core"} />
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors text-sm disabled:opacity-50"
          title="Verwijderen"
        >
          {deleting ? "..." : "🗑️"}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-2 pr-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-12">
                Set
              </th>
              {participants.map((p) => (
                <th
                  key={p.userId}
                  colSpan={3}
                  className="text-center py-2 px-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wider"
                >
                  {p.user.name}
                </th>
              ))}
            </tr>
            <tr className="border-b border-gray-100 dark:border-gray-800">
              <th></th>
              {participants.map((p) => (
                <React.Fragment key={p.userId}>
                  <th className="text-center py-1 px-1 text-xs text-gray-400 dark:text-gray-500 font-normal">
                    Reps
                  </th>
                  <th className="text-center py-1 px-1 text-xs text-gray-400 dark:text-gray-500 font-normal">
                    Gewicht
                  </th>
                  <th className="text-center py-1 px-1 text-xs text-gray-400 dark:text-gray-500 font-normal">
                    Volume
                  </th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: totalSets }, (_, i) => i + 1).map((setNum) => (
              <tr
                key={setNum}
                className="border-b border-gray-100 dark:border-gray-800 last:border-0 even:bg-gray-50 dark:even:bg-gray-800/50"
              >
                <td className="py-2 pr-2 text-gray-500 dark:text-gray-400 font-medium">
                  {setNum}
                </td>
                {participants.map((p) => {
                  const set = sessionExercise.sets.find(
                    (s) => s.userId === p.userId && s.setNumber === setNum
                  );
                  return (
                    <React.Fragment key={p.userId}>
                      <td className="text-center py-2 px-1 text-gray-900 dark:text-gray-100">
                        {set ? set.reps : <span className="text-gray-300 dark:text-gray-600">-</span>}
                      </td>
                      <td className="text-center py-2 px-1 text-gray-900 dark:text-gray-100">
                        {set ? (
                          `${set.weightKg} kg`
                        ) : (
                          <span className="text-gray-300 dark:text-gray-600">-</span>
                        )}
                      </td>
                      <td className="text-center py-2 px-1 text-indigo-600 dark:text-indigo-400 font-medium">
                        {set ? (
                          (set.reps * set.weightKg).toFixed(1)
                        ) : (
                          <span className="text-gray-300 dark:text-gray-600">-</span>
                        )}
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
