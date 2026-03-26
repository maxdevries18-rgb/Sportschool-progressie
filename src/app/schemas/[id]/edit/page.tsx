"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface Exercise {
  id: number;
  name: string;
  muscleGroup: string;
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
  trainingSchemaExercises: SchemaExercise[];
}

export default function EditSchemaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch(`/api/schemas/${id}`).then((r) => r.json()),
      fetch("/api/exercises?page=1").then((r) => r.json()),
    ]).then(async ([schema, exerciseData]: [TrainingSchema, { exercises?: Exercise[]; totalPages?: number }]) => {
      setName(schema.name);
      setDescription(schema.description || "");
      setSelectedExercises(
        schema.trainingSchemaExercises.map((se: SchemaExercise) => se.exercise)
      );

      const exercises = exerciseData.exercises ?? (exerciseData as unknown as Exercise[]);
      if (exerciseData.totalPages && exerciseData.totalPages > 1) {
        const pagePromises = [];
        for (let p = 2; p <= exerciseData.totalPages; p++) {
          pagePromises.push(
            fetch(`/api/exercises?page=${p}`).then((r) => r.json())
          );
        }
        const pages = await Promise.all(pagePromises);
        const all = [
          ...exercises,
          ...pages.flatMap((p: { exercises?: Exercise[] }) => p.exercises ?? (p as unknown as Exercise[])),
        ];
        setAllExercises(all);
      } else {
        setAllExercises(exercises);
      }

      setLoading(false);
    });
  }, [id]);

  const addExercise = (exercise: Exercise) => {
    setSelectedExercises((prev) => [...prev, exercise]);
    setSearch("");
  };

  const removeExercise = (exerciseId: number) => {
    setSelectedExercises((prev) => prev.filter((e) => e.id !== exerciseId));
  };

  const moveExercise = (index: number, direction: "up" | "down") => {
    setSelectedExercises((prev) => {
      const updated = [...prev];
      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= updated.length) return prev;
      [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
      return updated;
    });
  };

  const filteredExercises = allExercises.filter(
    (e) =>
      !selectedExercises.some((s) => s.id === e.id) &&
      e.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Naam is verplicht.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/schemas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          exerciseIds: selectedExercises.map((e) => e.id),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Fout bij opslaan");
      }

      router.push(`/schemas/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Onbekende fout");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-8">
        Laden...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href={`/schemas/${id}`}
        className="inline-flex items-center text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
      >
        &larr; Terug naar schema
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Schema bewerken
      </h1>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl ring-1 ring-gray-200/60 dark:ring-gray-700/60 shadow-[var(--shadow-card)] p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Naam
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Bijv. Push Day, Leg Day..."
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-base sm:text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:ring-indigo-400/20 dark:focus:border-indigo-400 transition-colors duration-150 placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Beschrijving (optioneel)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Bijv. focus op borst, schouders en triceps..."
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-base sm:text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:ring-indigo-400/20 dark:focus:border-indigo-400 transition-colors duration-150 placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>
        </div>

        {/* Geselecteerde oefeningen */}
        <div className="bg-white dark:bg-gray-900 rounded-xl ring-1 ring-gray-200/60 dark:ring-gray-700/60 shadow-[var(--shadow-card)] p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Oefeningen ({selectedExercises.length})
          </h2>

          {selectedExercises.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Voeg oefeningen toe aan je schema.
            </p>
          ) : (
            <div className="space-y-2">
              {selectedExercises.map((exercise, index) => (
                <div
                  key={exercise.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50"
                >
                  <span className="text-sm font-medium text-gray-400 dark:text-gray-500 w-6 text-center">
                    {index + 1}
                  </span>
                  <span className="flex-1 text-gray-900 dark:text-gray-100 font-medium text-sm">
                    {exercise.name}
                  </span>
                  <Badge
                    label={exercise.muscleGroup}
                    variant={
                      exercise.muscleGroup as
                        | "borst"
                        | "rug"
                        | "benen"
                        | "schouders"
                        | "armen"
                        | "core"
                    }
                  />
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveExercise(index, "up")}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => moveExercise(index, "down")}
                      disabled={index === selectedExercises.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => removeExercise(exercise.id)}
                      className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Oefening zoeken en toevoegen */}
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Zoek oefening om toe te voegen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-base sm:text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:ring-indigo-400/20 dark:focus:border-indigo-400 transition-colors duration-150 placeholder-gray-400 dark:placeholder-gray-500"
            />
            {search && (
              <div className="max-h-48 overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                {filteredExercises.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 py-3 text-center">
                    Geen oefeningen gevonden
                  </p>
                ) : (
                  filteredExercises.slice(0, 20).map((exercise) => (
                    <button
                      key={exercise.id}
                      type="button"
                      onClick={() => addExercise(exercise)}
                      className="w-full text-left px-3 py-2.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors flex items-center justify-between border-b border-gray-100 dark:border-gray-800 last:border-0"
                    >
                      <span className="text-gray-900 dark:text-gray-100 font-medium text-sm">
                        {exercise.name}
                      </span>
                      <Badge
                        label={exercise.muscleGroup}
                        variant={
                          exercise.muscleGroup as
                            | "borst"
                            | "rug"
                            | "benen"
                            | "schouders"
                            | "armen"
                            | "core"
                        }
                      />
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving || !name.trim()}
          className="w-full bg-gradient-to-b from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-medium rounded-xl px-6 py-3 shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-150 disabled:opacity-50"
        >
          {saving ? "Opslaan..." : "Schema opslaan"}
        </button>
      </form>
    </div>
  );
}
