"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useCurrentUser } from "@/contexts/user-context";
import { ExerciseImage } from "@/components/exercises/exercise-image";

interface Exercise {
  id: number;
  name: string;
  muscleGroup: string;
  imageUrl: string | null;
}

interface SchemaExercise {
  id: number;
  sortOrder: number;
  exercise: Exercise;
}

interface TrainingSchema {
  id: number;
  name: string;
  description: string | null;
  isPreset: number;
  trainingSchemaExercises: SchemaExercise[];
}

interface User {
  id: number;
  name: string;
}

export default function SchemaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { currentUserId } = useCurrentUser();
  const [schema, setSchema] = useState<TrainingSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showStartForm, setShowStartForm] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    fetch(`/api/schemas/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Niet gevonden");
        return r.json();
      })
      .then(setSchema)
      .catch(() => setSchema(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Weet je zeker dat je dit schema wilt verwijderen?")) return;
    setDeleting(true);
    try {
      await fetch(`/api/schemas/${id}`, { method: "DELETE" });
      router.push("/schemas");
    } catch {
      setDeleting(false);
    }
  };

  const handleStartSession = async () => {
    if (!showStartForm) {
      setShowStartForm(true);
      const res = await fetch("/api/users");
      const users = await res.json();
      setAllUsers(users);
      setSelectedUserIds(currentUserId ? [currentUserId] : []);
      return;
    }

    if (selectedUserIds.length === 0) return;

    setStarting(true);
    try {
      const res = await fetch(`/api/schemas/${id}/start-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantIds: selectedUserIds }),
      });

      if (!res.ok) throw new Error("Kon sessie niet starten");

      const session = await res.json();
      router.push(`/sessions/${session.id}`);
    } catch {
      setStarting(false);
    }
  };

  const toggleUser = (userId: number) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  if (loading) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-8">
        Laden...
      </div>
    );
  }

  if (!schema) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">
          Schema niet gevonden.
        </p>
        <Link
          href="/schemas"
          className="mt-2 inline-block text-indigo-600 dark:text-indigo-400"
        >
          Terug naar schema&apos;s
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/schemas"
        className="inline-flex items-center text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
      >
        &larr; Terug naar schema&apos;s
      </Link>

      {/* Header */}
      <div className="bg-white dark:bg-gray-900 rounded-xl ring-1 ring-gray-200/60 dark:ring-gray-700/60 shadow-[var(--shadow-card)] p-4 sm:p-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {schema.name}
            </h1>
            {schema.isPreset === 1 && (
              <span className="inline-flex items-center rounded-full bg-amber-50 dark:bg-amber-900/30 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300">
                Standaard
              </span>
            )}
          </div>
          {schema.description && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {schema.description}
            </p>
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={handleStartSession}
            disabled={starting}
            className="px-3 py-1.5 text-sm rounded-xl bg-gradient-to-b from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-medium shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-150 disabled:opacity-50"
          >
            {starting ? "Starten..." : "Start Sessie"}
          </button>
          <Link
            href={`/schemas/${schema.id}/edit`}
            className="px-3 py-1.5 text-sm rounded-xl bg-white dark:bg-gray-800 ring-1 ring-gray-200 dark:ring-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-150"
          >
            Bewerken
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-3 py-1.5 text-sm rounded-xl bg-white dark:bg-gray-800 ring-1 ring-red-200 dark:ring-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-150 disabled:opacity-50"
          >
            {deleting ? "Verwijderen..." : "Verwijderen"}
          </button>
        </div>
      </div>

      {/* Start sessie deelnemers selectie */}
      {showStartForm && (
        <div className="bg-white dark:bg-gray-900 rounded-xl ring-1 ring-gray-200/60 dark:ring-gray-700/60 shadow-[var(--shadow-card)] p-4 sm:p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Selecteer deelnemers
          </h2>
          <div className="space-y-2">
            {allUsers.map((user) => (
              <label
                key={user.id}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedUserIds.includes(user.id)}
                  onChange={() => toggleUser(user.id)}
                  className="w-5 h-5 rounded-lg text-indigo-600 border-gray-300 dark:border-gray-600 focus:ring-indigo-500 dark:bg-gray-800"
                />
                <span className="text-gray-900 dark:text-gray-100 font-medium">
                  {user.name}
                </span>
              </label>
            ))}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleStartSession}
              disabled={starting || selectedUserIds.length === 0}
              className="flex-1 bg-gradient-to-b from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-medium rounded-xl px-6 py-2.5 shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-150 disabled:opacity-50"
            >
              {starting ? "Starten..." : "Sessie starten"}
            </button>
            <button
              onClick={() => setShowStartForm(false)}
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 ring-1 ring-gray-200 dark:ring-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-150"
            >
              Annuleren
            </button>
          </div>
        </div>
      )}

      {/* Oefeningen */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Oefeningen ({schema.trainingSchemaExercises.length})
        </h2>

        {schema.trainingSchemaExercises.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-xl ring-1 ring-gray-200/60 dark:ring-gray-700/60 shadow-[var(--shadow-card)] p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              Dit schema heeft nog geen oefeningen.
            </p>
            <Link
              href={`/schemas/${schema.id}/edit`}
              className="mt-2 inline-block text-indigo-600 dark:text-indigo-400 text-sm"
            >
              Oefeningen toevoegen
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {schema.trainingSchemaExercises.map((se, index) => (
              <div
                key={se.id}
                className="bg-white dark:bg-gray-900 rounded-xl ring-1 ring-gray-200/60 dark:ring-gray-700/60 shadow-[var(--shadow-card)] p-4 flex items-center gap-4"
              >
                <span className="text-sm font-bold text-gray-400 dark:text-gray-500 w-6 text-center">
                  {index + 1}
                </span>
                {se.exercise.imageUrl && (
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <ExerciseImage
                      imageUrl={se.exercise.imageUrl}
                      name={se.exercise.name}
                      size="sm"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                    {se.exercise.name}
                  </p>
                </div>
                <Badge
                  label={se.exercise.muscleGroup}
                  variant={
                    se.exercise.muscleGroup as
                      | "borst"
                      | "rug"
                      | "benen"
                      | "schouders"
                      | "armen"
                      | "core"
                  }
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
