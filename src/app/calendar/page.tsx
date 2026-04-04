"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCurrentUser } from "@/contexts/user-context";

interface Session {
  id: number;
  date: string;
  notes: string | null;
  exerciseCount: number;
  participants: { userId: number; userName: string }[];
}

const MAANDEN = [
  "Januari", "Februari", "Maart", "April", "Mei", "Juni",
  "Juli", "Augustus", "September", "Oktober", "November", "December",
];

const DAGEN_KORT = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];

function getDayOfWeek(date: Date): number {
  // 0 = Monday, 6 = Sunday
  return (date.getDay() + 6) % 7;
}

function formatDutchDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return `${day} ${MAANDEN[month - 1]} ${year}`;
}

export default function CalendarPage() {
  const { currentUserId } = useCurrentUser();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-indexed
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showAllUsers, setShowAllUsers] = useState(false);

  useEffect(() => {
    setLoading(true);
    const url =
      !showAllUsers && currentUserId
        ? `/api/sessions?userId=${currentUserId}`
        : "/api/sessions";
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setSessions(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [currentUserId, showAllUsers]);

  // Group sessions by date string
  const sessionsByDate = sessions.reduce<Record<string, Session[]>>((acc, s) => {
    if (!acc[s.date]) acc[s.date] = [];
    acc[s.date].push(s);
    return acc;
  }, {});

  // Build calendar grid
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = getDayOfWeek(firstDay); // how many empty cells before day 1

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // Pad to complete last week row
  while (cells.length % 7 !== 0) cells.push(null);

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }

  function nextMonth() {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }

  function dateStr(day: number) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  const todayStr = today.toISOString().split("T")[0];
  const selectedSessions = selectedDate ? (sessionsByDate[selectedDate] ?? []) : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Kalender
      </h1>

      {/* Filter toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowAllUsers(false)}
          className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
            !showAllUsers
              ? "bg-primary-600 text-white"
              : "bg-white dark:bg-gray-800 ring-1 ring-gray-200 dark:ring-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          }`}
        >
          Mijn sessies
        </button>
        <button
          onClick={() => setShowAllUsers(true)}
          className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
            showAllUsers
              ? "bg-primary-600 text-white"
              : "bg-white dark:bg-gray-800 ring-1 ring-gray-200 dark:ring-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          }`}
        >
          Alle sessies
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl ring-1 ring-gray-200/60 dark:ring-gray-700/60 shadow-[var(--shadow-card)] p-4 sm:p-6">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={prevMonth}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
            aria-label="Vorige maand"
          >
            ←
          </button>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {MAANDEN[month]} {year}
          </h2>
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
            aria-label="Volgende maand"
          >
            →
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {DAGEN_KORT.map((d) => (
            <div
              key={d}
              className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-1"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        {loading ? (
          <div className="py-12 text-center text-gray-500 dark:text-gray-400 text-sm">
            Laden...
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (!day) {
                return <div key={`empty-${i}`} />;
              }
              const ds = dateStr(day);
              const daySessions = sessionsByDate[ds] ?? [];
              const isToday = ds === todayStr;
              const isSelected = ds === selectedDate;
              const hasSessions = daySessions.length > 0;

              return (
                <button
                  key={ds}
                  onClick={() => setSelectedDate(isSelected ? null : ds)}
                  className={`relative flex flex-col items-center justify-start pt-1.5 pb-2 rounded-xl min-h-[52px] text-sm font-medium transition-all ${
                    isSelected
                      ? "bg-primary-600 text-white shadow-sm"
                      : isToday
                      ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 ring-1 ring-primary-200 dark:ring-primary-700"
                      : hasSessions
                      ? "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100"
                      : "text-gray-400 dark:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <span>{day}</span>
                  {hasSessions && (
                    <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                      {daySessions.slice(0, 3).map((s) => (
                        <span
                          key={s.id}
                          className={`w-1.5 h-1.5 rounded-full ${
                            isSelected
                              ? "bg-white/80"
                              : "bg-primary-500 dark:bg-primary-400"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected day sessions */}
      {selectedDate && (
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {formatDutchDate(selectedDate)}
          </h3>
          {selectedSessions.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Geen sessies op deze dag.
            </p>
          ) : (
            selectedSessions.map((s) => (
              <Link
                key={s.id}
                href={`/sessions/${s.id}`}
                className="block bg-white dark:bg-gray-900 rounded-xl ring-1 ring-gray-200/60 dark:ring-gray-700/60 shadow-[var(--shadow-card)] p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {s.notes || "Sessie"}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      {s.participants.map((p) => p.userName).join(", ")}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
                    {s.exerciseCount} oefeningen
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      )}

      {/* Monthly summary */}
      {!loading && (
        <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
          {Object.keys(sessionsByDate).filter((d) => d.startsWith(`${year}-${String(month + 1).padStart(2, "0")}`)).length} trainingsdagen in {MAANDEN[month]}
        </div>
      )}
    </div>
  );
}
