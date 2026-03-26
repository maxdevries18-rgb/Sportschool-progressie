"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

interface Exercise {
  id: number;
  name: string;
  muscleGroup: string;
}

interface AddExerciseFormProps {
  sessionId: number;
  participantIds: number[];
  participantNames: Record<number, string>;
  existingExerciseIds: number[];
}

type SetData = { reps: string; weightKg: string };
type PrevSet = { setNumber: number; reps: number; weightKg: number };

export function AddExerciseForm({
  sessionId,
  participantIds,
  participantNames,
  existingExerciseIds,
}: AddExerciseFormProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [search, setSearch] = useState("");
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [numSets, setNumSets] = useState(3);
  const [sets, setSets] = useState<Record<number, SetData[]>>({});
  const [prevSets, setPrevSets] = useState<Record<number, PrevSet[]>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/exercises?page=1")
      .then((r) => r.json())
      .then((data) => {
        // Load all exercises for the picker (API returns paginated result)
        // Fetch enough pages to get all exercises
        const allExercises = data.exercises ?? data;
        if (data.totalPages && data.totalPages > 1) {
          const pagePromises = [];
          for (let p = 2; p <= data.totalPages; p++) {
            pagePromises.push(
              fetch(`/api/exercises?page=${p}`).then((r) => r.json())
            );
          }
          Promise.all(pagePromises).then((pages) => {
            const all = [...allExercises, ...pages.flatMap((p) => p.exercises ?? p)];
            setExercises(all);
          });
        } else {
          setExercises(allExercises);
        }
      })
      .catch(() => {});
  }, []);

  const initSets = (count: number) => {
    const initial: Record<number, SetData[]> = {};
    participantIds.forEach((uid) => {
      initial[uid] = Array.from({ length: count }, () => ({ reps: "", weightKg: "" }));
    });
    setSets(initial);
  };

  const handleOpen = () => {
    setIsOpen(true);
    setSelectedExercise(null);
    setSearch("");
    setError("");
    setNumSets(3);
    setPrevSets({});
    initSets(3);
  };

  const handleCancel = () => {
    setIsOpen(false);
    setSelectedExercise(null);
    setSearch("");
    setError("");
    setPrevSets({});
  };

  const handleSelectExercise = async (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setSearch("");

    // Haal vorige sessie data op
    const userIdsParam = participantIds.join(",");
    try {
      const res = await fetch(
        `/api/exercises/last-sets?exerciseId=${exercise.id}&userIds=${userIdsParam}`
      );
      if (res.ok) {
        const data: { userId: number; setNumber: number; reps: number; weightKg: number }[] = await res.json();
        const grouped: Record<number, PrevSet[]> = {};
        for (const s of data) {
          if (!grouped[s.userId]) grouped[s.userId] = [];
          grouped[s.userId].push({ setNumber: s.setNumber, reps: s.reps, weightKg: s.weightKg });
        }
        setPrevSets(grouped);
      }
    } catch {
      // geen vorige data, geen probleem
    }
  };

  const updateSet = (userId: number, setIndex: number, field: "reps" | "weightKg", value: string) => {
    setSets((prev) => {
      const updated = { ...prev };
      updated[userId] = [...updated[userId]];
      updated[userId][setIndex] = { ...updated[userId][setIndex], [field]: value };
      return updated;
    });
  };

  const addSet = () => {
    setNumSets((n) => n + 1);
    setSets((prev) => {
      const updated = { ...prev };
      participantIds.forEach((uid) => {
        updated[uid] = [...(updated[uid] ?? []), { reps: "", weightKg: "" }];
      });
      return updated;
    });
  };

  const removeSet = () => {
    if (numSets <= 1) return;
    setNumSets((n) => n - 1);
    setSets((prev) => {
      const updated = { ...prev };
      participantIds.forEach((uid) => {
        updated[uid] = updated[uid].slice(0, -1);
      });
      return updated;
    });
  };

  const handleSave = async () => {
    if (!selectedExercise) return;
    setSaving(true);
    setError("");

    const allSets: { userId: number; setNumber: number; reps: number; weightKg: number }[] = [];
    for (const userId of participantIds) {
      for (let i = 0; i < numSets; i++) {
        const s = sets[userId]?.[i];
        if (s && s.reps && s.weightKg) {
          allSets.push({
            userId,
            setNumber: i + 1,
            reps: Number(s.reps),
            weightKg: Number(s.weightKg.replace(",", ".")),
          });
        }
      }
    }

    if (allSets.length === 0) {
      setError("Vul minimaal 1 set in met reps en gewicht.");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch(`/api/sessions/${sessionId}/exercises`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exerciseId: selectedExercise.id, sets: allSets }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Fout bij opslaan");
      }

      setIsOpen(false);
      setSelectedExercise(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Onbekende fout");
    } finally {
      setSaving(false);
    }
  };

  const filteredExercises = exercises.filter(
    (e) =>
      !existingExerciseIds.includes(e.id) &&
      e.name.toLowerCase().includes(search.toLowerCase())
  );

  if (!isOpen) {
    return (
      <button
        onClick={handleOpen}
        className="w-full bg-gradient-to-b from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-medium rounded-xl px-6 py-3 shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-150"
      >
        ➕ Oefening toevoegen
      </button>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl ring-1 ring-gray-200/60 dark:ring-gray-700/60 shadow-[var(--shadow-card)] p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Oefening toevoegen
        </h3>
        <button
          onClick={handleCancel}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          ✕
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-2 rounded-xl text-sm">
          {error}
        </div>
      )}

      {!selectedExercise ? (
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Zoek oefening..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-base sm:text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:ring-indigo-400/20 dark:focus:border-indigo-400 transition-colors duration-150 placeholder-gray-400 dark:placeholder-gray-500"
            autoFocus
          />
          <div className="max-h-60 overflow-y-auto space-y-1">
            {filteredExercises.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 py-2 text-center">
                Geen oefeningen gevonden
              </p>
            ) : (
              filteredExercises.map((exercise) => (
                <button
                  key={exercise.id}
                  onClick={() => handleSelectExercise(exercise)}
                  className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors flex items-center justify-between group"
                >
                  <span className="text-gray-900 dark:text-gray-100 font-medium group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {exercise.name}
                  </span>
                  <Badge label={exercise.muscleGroup} variant={exercise.muscleGroup as "borst" | "rug" | "benen" | "schouders" | "armen" | "core"} />
                </button>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {selectedExercise.name}
            </span>
            <Badge label={selectedExercise.muscleGroup} variant={selectedExercise.muscleGroup as "borst" | "rug" | "benen" | "schouders" | "armen" | "core"} />
            <button
              onClick={() => setSelectedExercise(null)}
              className="ml-auto text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
            >
              Wijzig
            </button>
          </div>

          {/* Sets input grid */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 pr-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-12">
                    Set
                  </th>
                  {participantIds.map((uid) => (
                    <th
                      key={uid}
                      colSpan={2}
                      className="text-center py-2 px-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wider"
                    >
                      {participantNames[uid]}
                    </th>
                  ))}
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th></th>
                  {participantIds.map((uid) => (
                    <React.Fragment key={uid}>
                      <th className="text-center py-1 px-1 text-xs text-gray-400 dark:text-gray-500 font-normal">
                        Reps
                      </th>
                      <th className="text-center py-1 px-1 text-xs text-gray-400 dark:text-gray-500 font-normal">
                        Kg
                      </th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: numSets }, (_, setIdx) => (
                  <tr
                    key={setIdx}
                    className="border-b border-gray-100 dark:border-gray-800 last:border-0"
                  >
                    <td className="py-2 pr-2 text-gray-500 dark:text-gray-400 font-medium">
                      {setIdx + 1}
                    </td>
                    {participantIds.map((uid) => {
                      const prev = prevSets[uid]?.find((s) => s.setNumber === setIdx + 1);
                      return (
                        <React.Fragment key={uid}>
                          <td className="py-2 px-1">
                            <input
                              type="number"
                              inputMode="numeric"
                              min="0"
                              placeholder={prev ? String(prev.reps) : "0"}
                              value={sets[uid]?.[setIdx]?.reps ?? ""}
                              onChange={(e) => updateSet(uid, setIdx, "reps", e.target.value)}
                              className="w-16 text-center rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 py-1.5 text-base sm:text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:ring-indigo-400/20 dark:focus:border-indigo-400 transition-colors"
                            />
                            {prev && (
                              <div className="text-center text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                v: {prev.reps}
                              </div>
                            )}
                          </td>
                          <td className="py-2 px-1">
                            <input
                              type="text"
                              inputMode="decimal"
                              placeholder={prev ? String(prev.weightKg) : "0"}
                              value={sets[uid]?.[setIdx]?.weightKg ?? ""}
                              onChange={(e) => updateSet(uid, setIdx, "weightKg", e.target.value)}
                              className="w-16 text-center rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 py-1.5 text-base sm:text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:ring-indigo-400/20 dark:focus:border-indigo-400 transition-colors"
                            />
                            {prev && (
                              <div className="text-center text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                v: {prev.weightKg}
                              </div>
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

          {/* Set beheer knoppen */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={addSet}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
            >
              + Set toevoegen
            </button>
            {numSets > 1 && (
              <button
                type="button"
                onClick={removeSet}
                className="text-sm text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              >
                − Set verwijderen
              </button>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-gradient-to-b from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-medium rounded-xl px-6 py-2.5 shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-150 disabled:opacity-50"
            >
              {saving ? "Opslaan..." : "Opslaan"}
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 ring-1 ring-gray-200 dark:ring-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-150"
            >
              Annuleren
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
