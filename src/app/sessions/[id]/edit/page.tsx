"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { DEFAULT_SETS_COUNT } from "@/lib/constants";

interface User {
  id: number;
  name: string;
}

interface Exercise {
  id: number;
  name: string;
  muscleGroup: string;
  description: string | null;
}

interface SetInput {
  setNumber: number;
  reps: string;
  weightKg: string;
}

interface ExerciseEntry {
  exerciseId: number;
  exercise: Exercise;
  sets: Record<number, SetInput[]>;
}

export default function EditSessionPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [exerciseSearch, setExerciseSearch] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<ExerciseEntry[]>([]);

  // Load session data + users + exercises
  useEffect(() => {
    Promise.all([
      fetch(`/api/sessions/${sessionId}`).then((r) => r.json()),
      fetch("/api/users").then((r) => r.json()),
      fetch("/api/exercises").then((r) => r.json()),
    ])
      .then(([session, users, exercises]) => {
        setAllUsers(users);
        setAllExercises(exercises);
        setDate(session.date);
        setNotes(session.notes || "");

        // Participants
        const participantIds = session.participants.map(
          (p: { user: { id: number } }) => p.user.id
        );
        setSelectedUserIds(participantIds);

        // Exercises with sets
        const entries: ExerciseEntry[] = session.sessionExercises.map(
          (se: {
            exercise: Exercise;
            sets: Array<{
              userId: number;
              setNumber: number;
              reps: number;
              weightKg: number;
            }>;
          }) => {
            const setsPerUser: Record<number, SetInput[]> = {};

            for (const uid of participantIds) {
              const userSets = se.sets
                .filter((s) => s.userId === uid)
                .sort((a, b) => a.setNumber - b.setNumber);

              const maxSets = Math.max(DEFAULT_SETS_COUNT, userSets.length);
              setsPerUser[uid] = Array.from({ length: maxSets }, (_, i) => {
                const existing = userSets.find((s) => s.setNumber === i + 1);
                return {
                  setNumber: i + 1,
                  reps: existing ? existing.reps.toString() : "",
                  weightKg: existing ? existing.weightKg.toString() : "",
                };
              });
            }

            return {
              exerciseId: se.exercise.id,
              exercise: se.exercise,
              sets: setsPerUser,
            };
          }
        );

        setSelectedExercises(entries);
        setLoading(false);
      })
      .catch(() => {
        setError("Kon sessie niet laden.");
        setLoading(false);
      });
  }, [sessionId]);

  const toggleUser = (userId: number) => {
    setSelectedUserIds((prev) => {
      const next = prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId];

      // Add/remove sets for this user in all exercises
      setSelectedExercises((exercises) =>
        exercises.map((entry) => {
          const newSets = { ...entry.sets };
          if (!prev.includes(userId) && next.includes(userId)) {
            // User added
            newSets[userId] = Array.from(
              { length: DEFAULT_SETS_COUNT },
              (_, i) => ({ setNumber: i + 1, reps: "", weightKg: "" })
            );
          } else if (prev.includes(userId) && !next.includes(userId)) {
            // User removed
            delete newSets[userId];
          }
          return { ...entry, sets: newSets };
        })
      );

      return next;
    });
  };

  const addExercise = (exercise: Exercise) => {
    if (selectedExercises.some((e) => e.exerciseId === exercise.id)) return;

    const setsPerUser: Record<number, SetInput[]> = {};
    for (const userId of selectedUserIds) {
      setsPerUser[userId] = Array.from(
        { length: DEFAULT_SETS_COUNT },
        (_, i) => ({ setNumber: i + 1, reps: "", weightKg: "" })
      );
    }

    setSelectedExercises((prev) => [
      ...prev,
      { exerciseId: exercise.id, exercise, sets: setsPerUser },
    ]);
    setExerciseSearch("");
  };

  const removeExercise = (exerciseId: number) => {
    setSelectedExercises((prev) =>
      prev.filter((e) => e.exerciseId !== exerciseId)
    );
  };

  const updateSet = (
    exerciseId: number,
    userId: number,
    setIndex: number,
    field: "reps" | "weightKg",
    value: string
  ) => {
    setSelectedExercises((prev) =>
      prev.map((entry) => {
        if (entry.exerciseId !== exerciseId) return entry;
        const userSets = [...(entry.sets[userId] || [])];
        userSets[setIndex] = { ...userSets[setIndex], [field]: value };
        return { ...entry, sets: { ...entry.sets, [userId]: userSets } };
      })
    );
  };

  const filteredExercises = allExercises.filter(
    (ex) =>
      ex.name.toLowerCase().includes(exerciseSearch.toLowerCase()) &&
      !selectedExercises.some((se) => se.exerciseId === ex.id)
  );

  const selectedUsers = allUsers.filter((u) => selectedUserIds.includes(u.id));

  const handleSave = useCallback(async () => {
    setSaving(true);
    setError(null);

    const exercises = selectedExercises.map((entry, index) => ({
      exerciseId: entry.exerciseId,
      sortOrder: index,
      sets: Object.entries(entry.sets).flatMap(([userId, sets]) =>
        sets
          .filter((s) => s.reps && s.weightKg)
          .map((s) => ({
            userId: Number(userId),
            setNumber: s.setNumber,
            reps: Number(s.reps),
            weightKg: Number(s.weightKg),
          }))
      ),
    }));

    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          notes: notes || null,
          participantIds: selectedUserIds,
          exercises,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Opslaan mislukt.");
      }

      router.push(`/sessions/${sessionId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Opslaan mislukt.");
      setSaving(false);
    }
  }, [date, notes, selectedUserIds, selectedExercises, sessionId, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href={`/sessions/${sessionId}`}
        className="text-sm text-indigo-600 hover:text-indigo-500"
      >
        &larr; Terug naar sessie
      </Link>
      <h1 className="mt-4 text-3xl font-bold text-gray-900">
        Sessie Bewerken
      </h1>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-6 space-y-6">
        {/* Date & Notes */}
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Datum & notities</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Datum
              </label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:max-w-xs"
              />
            </div>
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notities (optioneel)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Bijv. focus op techniek, licht gewicht..."
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Participants */}
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Deelnemers</h2>
          <div className="space-y-2">
            {allUsers.map((user) => (
              <label
                key={user.id}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition ${
                  selectedUserIds.includes(user.id)
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedUserIds.includes(user.id)}
                  onChange={() => toggleUser(user.id)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-medium text-gray-900">{user.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Exercise selection */}
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Oefeningen</h2>

          <div className="relative mb-4">
            <input
              type="text"
              value={exerciseSearch}
              onChange={(e) => setExerciseSearch(e.target.value)}
              placeholder="Zoek oefeningen om toe te voegen..."
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {exerciseSearch && filteredExercises.length > 0 && (
              <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                {filteredExercises.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => addExercise(ex)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-gray-50"
                  >
                    <span className="font-medium text-gray-900">{ex.name}</span>
                    <span className="text-xs text-gray-500">{ex.muscleGroup}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedExercises.length > 0 && (
            <div className="space-y-2">
              {selectedExercises.map((entry, index) => (
                <div
                  key={entry.exerciseId}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-400">
                      {index + 1}.
                    </span>
                    <span className="font-medium text-gray-900">
                      {entry.exercise.name}
                    </span>
                  </div>
                  <button
                    onClick={() => removeExercise(entry.exerciseId)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sets input */}
        {selectedExercises.length > 0 && selectedUserIds.length > 0 && (
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Sets invullen
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Vul de herhalingen en het gewicht in voor elke set.
            </p>

            {selectedExercises.map((entry) => (
              <div key={entry.exerciseId} className="mb-8 last:mb-0">
                <h3 className="text-base font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-100">
                  {entry.exercise.name}
                </h3>

                {selectedUsers.map((user) => (
                  <div key={user.id} className="mb-4 last:mb-0">
                    <p className="text-sm font-medium text-indigo-600 mb-2">
                      {user.name}
                    </p>
                    <div className="space-y-2">
                      {(entry.sets[user.id] || []).map((set, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <span className="w-12 text-sm text-gray-500">
                            Set {set.setNumber}
                          </span>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="0"
                              placeholder="Reps"
                              value={set.reps}
                              onChange={(e) =>
                                updateSet(entry.exerciseId, user.id, idx, "reps", e.target.value)
                              }
                              inputMode="numeric"
                              pattern="[0-9]*"
                              className="w-20 sm:w-20 rounded-lg border border-gray-300 px-2 py-2.5 sm:py-1.5 text-base sm:text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                            <span className="text-xs text-gray-400">reps</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="0"
                              step="0.5"
                              placeholder="kg"
                              value={set.weightKg}
                              onChange={(e) =>
                                updateSet(entry.exerciseId, user.id, idx, "weightKg", e.target.value)
                              }
                              inputMode="numeric"
                              pattern="[0-9]*"
                              className="w-20 sm:w-20 rounded-lg border border-gray-300 px-2 py-2.5 sm:py-1.5 text-base sm:text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                            <span className="text-xs text-gray-400">kg</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Save */}
        <div className="flex justify-between">
          <Link
            href={`/sessions/${sessionId}`}
            className="rounded-lg bg-white px-6 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-300 transition hover:bg-gray-50"
          >
            Annuleren
          </Link>
          <button
            onClick={handleSave}
            disabled={saving || !date || selectedUserIds.length === 0 || selectedExercises.length === 0}
            className="rounded-lg bg-indigo-600 px-8 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Opslaan..." : "Wijzigingen Opslaan"}
          </button>
        </div>
      </div>
    </div>
  );
}
