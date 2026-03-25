"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
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
  sets: Record<number, SetInput[]>; // userId -> sets
}

export default function NewSessionPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Date
  const [date, setDate] = useState(() => {
    const now = new Date();
    return now.toISOString().split("T")[0];
  });
  const [notes, setNotes] = useState("");

  // Step 2: Participants
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);

  // Step 3: Exercises
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [exerciseSearch, setExerciseSearch] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<ExerciseEntry[]>(
    []
  );

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => setAllUsers(data))
      .catch(() => setError("Kon gebruikers niet laden."));
  }, []);

  useEffect(() => {
    fetch("/api/exercises")
      .then((res) => res.json())
      .then((data) => setAllExercises(data))
      .catch(() => setError("Kon oefeningen niet laden."));
  }, []);

  const toggleUser = (userId: number) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const addExercise = (exercise: Exercise) => {
    if (selectedExercises.some((e) => e.exerciseId === exercise.id)) return;

    const setsPerUser: Record<number, SetInput[]> = {};
    for (const userId of selectedUserIds) {
      setsPerUser[userId] = Array.from({ length: DEFAULT_SETS_COUNT }, (_, i) => ({
        setNumber: i + 1,
        reps: "",
        weightKg: "",
      }));
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

  const canProceedStep1 = date.length > 0;
  const canProceedStep2 = selectedUserIds.length > 0;
  const canProceedStep3 = selectedExercises.length > 0;

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
      const res = await fetch("/api/sessions", {
        method: "POST",
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

      const data = await res.json();
      router.push(`/sessions/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Opslaan mislukt.");
      setSaving(false);
    }
  }, [date, notes, selectedUserIds, selectedExercises, router]);

  const selectedUsers = allUsers.filter((u) => selectedUserIds.includes(u.id));

  return (
    <div className="mx-auto max-w-4xl">
        <Link
          href="/sessions"
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
        >
          &larr; Terug naar sessies
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-gray-100">
          Nieuwe Sessie
        </h1>

        {/* Step indicator */}
        <div className="mt-6 mb-8">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                    step === s
                      ? "bg-indigo-600 text-white"
                      : step > s
                        ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {step > s ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  ) : (
                    s
                  )}
                </div>
                {s < 4 && (
                  <div
                    className={`mx-2 h-0.5 w-8 sm:w-16 ${
                      step > s ? "bg-indigo-400" : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="mt-2 flex gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="w-8 text-center">Datum</span>
            <span className="mx-2 w-8 sm:w-16" />
            <span className="w-8 text-center">Wie</span>
            <span className="mx-2 w-8 sm:w-16" />
            <span className="w-8 text-center">Wat</span>
            <span className="mx-2 w-8 sm:w-16" />
            <span className="w-8 text-center">Sets</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Step 1: Date */}
        {step === 1 && (
          <div className="rounded-xl bg-white dark:bg-gray-900 p-6 shadow-[var(--shadow-card)] ring-1 ring-gray-200/60 dark:ring-gray-700/60">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Wanneer was de training?
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Datum
                </label>
                <input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="block w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-base sm:text-sm text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:ring-indigo-400/20 dark:focus:border-indigo-400 transition-colors duration-150 sm:max-w-xs"
                />
              </div>
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notities (optioneel)
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Bijv. focus op techniek, licht gewicht..."
                  className="block w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-base sm:text-sm text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:ring-indigo-400/20 dark:focus:border-indigo-400 transition-colors duration-150"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!canProceedStep1}
                className="rounded-xl bg-gradient-to-b from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-150 px-6 py-3 sm:py-2 text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Volgende
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Participants */}
        {step === 2 && (
          <div className="rounded-xl bg-white dark:bg-gray-900 p-6 shadow-[var(--shadow-card)] ring-1 ring-gray-200/60 dark:ring-gray-700/60">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Wie doen er mee?
            </h2>
            {allUsers.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">Gebruikers laden...</p>
            ) : (
              <div className="space-y-2">
                {allUsers.map((user) => (
                  <label
                    key={user.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-all duration-150 ${
                      selectedUserIds.includes(user.id)
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30"
                        : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedUserIds.includes(user.id)}
                      onChange={() => toggleUser(user.id)}
                      className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {user.name}
                    </span>
                  </label>
                ))}
              </div>
            )}
            <div className="mt-6 flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="rounded-xl bg-white dark:bg-gray-800 px-6 py-3 sm:py-2 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm ring-1 ring-gray-300 dark:ring-gray-600 transition-all duration-150 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Vorige
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!canProceedStep2}
                className="rounded-xl bg-gradient-to-b from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-150 px-6 py-3 sm:py-2 text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Volgende
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Select exercises */}
        {step === 3 && (
          <div className="rounded-xl bg-white dark:bg-gray-900 p-6 shadow-[var(--shadow-card)] ring-1 ring-gray-200/60 dark:ring-gray-700/60">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Welke oefeningen?
            </h2>

            <div className="relative mb-4">
              <input
                type="text"
                value={exerciseSearch}
                onChange={(e) => setExerciseSearch(e.target.value)}
                placeholder="Zoek oefeningen..."
                className="block w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-base sm:text-sm text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:ring-indigo-400/20 dark:focus:border-indigo-400 transition-colors duration-150"
              />
              {exerciseSearch && filteredExercises.length > 0 && (
                <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
                  {filteredExercises.map((ex) => (
                    <button
                      key={ex.id}
                      onClick={() => addExercise(ex)}
                      className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {ex.name}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {ex.muscleGroup}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedExercises.length > 0 && (
              <div className="space-y-2 mb-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Geselecteerd:
                </p>
                {selectedExercises.map((entry, index) => (
                  <div
                    key={entry.exerciseId}
                    className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-400 dark:text-gray-500">
                        {index + 1}.
                      </span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {entry.exercise.name}
                      </span>
                    </div>
                    <button
                      onClick={() => removeExercise(entry.exerciseId)}
                      className="text-red-400 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18 18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="rounded-xl bg-white dark:bg-gray-800 px-6 py-3 sm:py-2 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm ring-1 ring-gray-300 dark:ring-gray-600 transition-all duration-150 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Vorige
              </button>
              <button
                onClick={() => setStep(4)}
                disabled={!canProceedStep3}
                className="rounded-xl bg-gradient-to-b from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-150 px-6 py-3 sm:py-2 text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Volgende
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Enter sets */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="rounded-xl bg-white dark:bg-gray-900 p-6 shadow-[var(--shadow-card)] ring-1 ring-gray-200/60 dark:ring-gray-700/60">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                Sets invullen
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Vul de herhalingen en het gewicht in voor elke set.
              </p>

              {selectedExercises.map((entry) => (
                <div key={entry.exerciseId} className="mb-8 last:mb-0">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3 pb-2 border-b border-gray-100 dark:border-gray-800">
                    {entry.exercise.name}
                  </h3>

                  {selectedUsers.map((user) => (
                    <div key={user.id} className="mb-4 last:mb-0">
                      <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-2">
                        {user.name}
                      </p>
                      <div className="space-y-2">
                        {(entry.sets[user.id] || []).map((set, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3"
                          >
                            <span className="w-12 text-sm text-gray-500 dark:text-gray-400">
                              Set {set.setNumber}
                            </span>
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min="0"
                                placeholder="Reps"
                                value={set.reps}
                                onChange={(e) =>
                                  updateSet(
                                    entry.exerciseId,
                                    user.id,
                                    idx,
                                    "reps",
                                    e.target.value
                                  )
                                }
                                inputMode="numeric"
                                pattern="[0-9]*"
                                className="w-20 sm:w-20 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-2.5 sm:py-1.5 text-base sm:text-sm text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:ring-indigo-400/20 dark:focus:border-indigo-400 transition-colors duration-150"
                              />
                              <span className="text-xs text-gray-400 dark:text-gray-500">
                                reps
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min="0"
                                step="0.5"
                                placeholder="kg"
                                value={set.weightKg}
                                onChange={(e) =>
                                  updateSet(
                                    entry.exerciseId,
                                    user.id,
                                    idx,
                                    "weightKg",
                                    e.target.value
                                  )
                                }
                                inputMode="numeric"
                                pattern="[0-9]*"
                                className="w-20 sm:w-20 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-2.5 sm:py-1.5 text-base sm:text-sm text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:ring-indigo-400/20 dark:focus:border-indigo-400 transition-colors duration-150"
                              />
                              <span className="text-xs text-gray-400 dark:text-gray-500">kg</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(3)}
                className="rounded-xl bg-white dark:bg-gray-800 px-6 py-3 sm:py-2 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm ring-1 ring-gray-300 dark:ring-gray-600 transition-all duration-150 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Vorige
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-xl bg-gradient-to-b from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-150 px-8 py-3 sm:py-2 text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Opslaan..." : "Sessie Opslaan"}
              </button>
            </div>
          </div>
        )}
      </div>
  );
}
