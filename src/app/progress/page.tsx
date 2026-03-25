"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface User {
  id: number;
  name: string;
}

interface Exercise {
  id: number;
  name: string;
  muscleGroup: string;
}

interface ProgressDataPoint {
  date: string;
  maxWeight: number;
  maxReps: number;
  totalVolume: number;
}

interface PersonalRecord {
  exerciseId: number;
  exerciseName: string;
  muscleGroup: string;
  maxWeight: number;
  maxReps: number;
  maxSetVolume: number;
}

export default function ProgressPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(null);
  const [progressData, setProgressData] = useState<ProgressDataPoint[]>([]);
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then(setUsers)
      .catch(() => {});
    fetch("/api/exercises")
      .then((res) => res.json())
      .then(setExercises)
      .catch(() => {});

    // Detect dark mode
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const root = document.documentElement;
    const update = () => setIsDark(root.classList.contains("dark"));
    update();
    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!selectedUserId || !selectedExerciseId) {
      setProgressData([]);
      setPersonalRecords([]);
      return;
    }

    setLoading(true);
    fetch(
      `/api/progress/${selectedUserId}?exerciseId=${selectedExerciseId}`
    )
      .then((res) => res.json())
      .then((data) => {
        setProgressData(data.progress || []);
        setPersonalRecords(data.personalRecords || []);
      })
      .catch(() => {
        setProgressData([]);
        setPersonalRecords([]);
      })
      .finally(() => setLoading(false));
  }, [selectedUserId, selectedExerciseId]);

  const formatDateLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("nl-NL", { day: "numeric", month: "short" });
  };

  const gridColor = isDark ? "#374151" : "#f0f0f0";
  const axisColor = isDark ? "#6b7280" : "#9ca3af";
  const tooltipBg = isDark ? "#1f2937" : "#ffffff";
  const tooltipBorder = isDark ? "#374151" : "#e5e7eb";

  return (
    <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <Link
            href="/"
            className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            &larr; Dashboard
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">Voortgang</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Bekijk je voortgang per oefening over tijd.
          </p>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="user"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Gebruiker
            </label>
            <select
              id="user"
              value={selectedUserId ?? ""}
              onChange={(e) =>
                setSelectedUserId(e.target.value ? Number(e.target.value) : null)
              }
              className="block w-full rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 px-3 py-2 text-base sm:text-sm text-gray-900 shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:ring-indigo-400/20 dark:focus:border-indigo-400 transition-colors duration-150"
            >
              <option value="">Selecteer een gebruiker...</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="exercise"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Oefening
            </label>
            <select
              id="exercise"
              value={selectedExerciseId ?? ""}
              onChange={(e) =>
                setSelectedExerciseId(
                  e.target.value ? Number(e.target.value) : null
                )
              }
              className="block w-full rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 px-3 py-2 text-base sm:text-sm text-gray-900 shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:ring-indigo-400/20 dark:focus:border-indigo-400 transition-colors duration-150"
            >
              <option value="">Selecteer een oefening...</option>
              {exercises.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {!selectedUserId || !selectedExerciseId ? (
          <div className="rounded-xl bg-white dark:bg-gray-900 p-8 text-center shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
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
                d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
              />
            </svg>
            <p className="text-gray-500 dark:text-gray-400">
              Selecteer een gebruiker en oefening om de voortgang te bekijken.
            </p>
          </div>
        ) : loading ? (
          <div className="rounded-xl bg-white dark:bg-gray-900 p-8 text-center shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 dark:border-t-indigo-400" />
            <p className="mt-4 text-gray-500 dark:text-gray-400">Gegevens laden...</p>
          </div>
        ) : progressData.length === 0 ? (
          <div className="rounded-xl bg-white dark:bg-gray-900 p-8 text-center shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
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
                d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
              />
            </svg>
            <p className="text-gray-500 dark:text-gray-400">
              Geen voortgangsgegevens gevonden voor deze combinatie.
            </p>
          </div>
        ) : (
          <>
            <div className="rounded-xl bg-white dark:bg-gray-900 p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                Voortgang over tijd
              </h2>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDateLabel}
                    tick={{ fontSize: 12, fill: axisColor }}
                    stroke={axisColor}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 12, fill: axisColor }}
                    stroke={axisColor}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 12, fill: axisColor }}
                    stroke={axisColor}
                  />
                  <Tooltip
                    labelFormatter={(label) => {
                      const d = new Date(label);
                      return d.toLocaleDateString("nl-NL", {
                        weekday: "short",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      });
                    }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: `1px solid ${tooltipBorder}`,
                      backgroundColor: tooltipBg,
                      color: isDark ? "#f3f4f6" : "#111827",
                    }}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="maxWeight"
                    name="Max Gewicht (kg)"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="maxReps"
                    name="Max Reps"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="totalVolume"
                    name="Totaal Volume"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {personalRecords.length > 0 && (
              <div className="mt-6 rounded-xl bg-white dark:bg-gray-900 p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Persoonlijke Records
                </h2>
                <div className="grid gap-4 sm:grid-cols-3">
                  {personalRecords
                    .filter((pr) => pr.exerciseId === selectedExerciseId)
                    .map((pr) => (
                    <React.Fragment key={pr.exerciseId}>
                      <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/30 dark:to-gray-900 p-4 ring-1 ring-indigo-100 dark:ring-indigo-800">
                        <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                          Max Gewicht
                        </p>
                        <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {pr.maxWeight} kg
                        </p>
                      </div>
                      <div className="rounded-xl bg-gradient-to-br from-cyan-50 to-white dark:from-cyan-900/30 dark:to-gray-900 p-4 ring-1 ring-cyan-100 dark:ring-cyan-800">
                        <p className="text-sm font-medium text-cyan-600 dark:text-cyan-400">
                          Max Reps
                        </p>
                        <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {pr.maxReps}
                        </p>
                      </div>
                      <div className="rounded-xl bg-gradient-to-br from-amber-50 to-white dark:from-amber-900/30 dark:to-gray-900 p-4 ring-1 ring-amber-100 dark:ring-amber-800">
                        <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                          Max Volume (set)
                        </p>
                        <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {pr.maxSetVolume} kg
                        </p>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
  );
}
