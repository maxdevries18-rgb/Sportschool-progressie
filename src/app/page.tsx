"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useCurrentUser } from "@/contexts/user-context";
import { formatDate, getWeekLabel } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { MUSCLE_GROUP_LABELS } from "@/lib/constants";

interface WeekOverview {
  weekStart: string;
  sessionCount: number;
  muscleGroups: string[];
}

interface Session {
  id: number;
  date: string;
  notes: string | null;
  exerciseCount: number;
  participants: { userId: number; userName: string }[];
}

export default function DashboardPage() {
  const { currentUserId } = useCurrentUser();
  const [weeklyOverview, setWeeklyOverview] = useState<WeekOverview[]>([]);
  const [recentSessions, setRecentSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUserId) return;

    async function fetchData() {
      setLoading(true);
      try {
        const [weeklyRes, sessionsRes] = await Promise.all([
          fetch(`/api/weekly?userId=${currentUserId}`),
          fetch(`/api/sessions?userId=${currentUserId}`),
        ]);
        const weekly = await weeklyRes.json();
        const sessions = await sessionsRes.json();
        setWeeklyOverview(weekly);
        setRecentSessions(sessions.slice(0, 5));
      } catch (error) {
        console.error("Fout bij laden dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [currentUserId]);

  return (
    <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Welkom bij Sportschool Tracker
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Houd je trainingen bij en volg je voortgang.
          </p>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Link
            href="/sessions/new"
            className="flex flex-col items-center rounded-xl bg-gradient-to-b from-primary-500 to-primary-600 p-4 text-white shadow-sm hover:from-primary-600 hover:to-primary-700 hover:shadow-md active:scale-[0.98] transition-all duration-150"
          >
            <svg
              className="mb-2 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            <span className="text-sm font-medium">Nieuwe Sessie</span>
          </Link>
          <Link
            href="/sessions"
            className="flex flex-col items-center rounded-xl bg-white dark:bg-gray-900 p-4 text-gray-700 dark:text-gray-300 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 transition hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <svg
              className="mb-2 h-6 w-6 text-primary-500"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
              />
            </svg>
            <span className="text-sm font-medium">Sessies</span>
          </Link>
          <Link
            href="/exercises"
            className="flex flex-col items-center rounded-xl bg-white dark:bg-gray-900 p-4 text-gray-700 dark:text-gray-300 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 transition hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <svg
              className="mb-2 h-6 w-6 text-primary-500"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"
              />
            </svg>
            <span className="text-sm font-medium">Oefeningen</span>
          </Link>
          <Link
            href="/progress"
            className="flex flex-col items-center rounded-xl bg-white dark:bg-gray-900 p-4 text-gray-700 dark:text-gray-300 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 transition hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <svg
              className="mb-2 h-6 w-6 text-primary-500"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
              />
            </svg>
            <span className="text-sm font-medium">Voortgang</span>
          </Link>
        </div>

        {loading ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            Laden...
          </div>
        ) : (
          <>
            {/* Weekoverzicht */}
            {weeklyOverview.length > 0 && (
              <section className="mb-8">
                <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Weekoverzicht
                </h2>
                <div className="space-y-3">
                  {weeklyOverview.map((week) => {
                    const isCurrentWeek = (() => {
                      const now = new Date();
                      const weekStart = new Date(week.weekStart);
                      const weekEnd = new Date(weekStart);
                      weekEnd.setDate(weekEnd.getDate() + 6);
                      return now >= weekStart && now <= weekEnd;
                    })();

                    return (
                      <div
                        key={week.weekStart}
                        className={`rounded-xl bg-white dark:bg-gray-900 p-4 shadow-sm ring-1 ${
                          isCurrentWeek
                            ? "ring-primary-300 bg-primary-50/30 dark:bg-primary-900/20 dark:ring-primary-700"
                            : "ring-gray-200 dark:ring-gray-700"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {getWeekLabel(week.weekStart)}
                              {isCurrentWeek && (
                                <span className="ml-2 text-xs font-medium text-primary-600 dark:text-primary-400">
                                  Deze week
                                </span>
                              )}
                            </p>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                              {week.sessionCount}{" "}
                              {week.sessionCount === 1 ? "sessie" : "sessies"}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {week.muscleGroups.map((mg) => (
                            <Badge
                              key={mg}
                              label={
                                MUSCLE_GROUP_LABELS[
                                  mg as keyof typeof MUSCLE_GROUP_LABELS
                                ] || mg
                              }
                              variant={
                                mg as "borst" | "rug" | "benen" | "schouders" | "armen" | "core"
                              }
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            <section>
              <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
                Recente Sessies
              </h2>

              {recentSessions.length === 0 ? (
                <div className="rounded-xl bg-white dark:bg-gray-900 p-8 text-center shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                  <svg
                    className="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                    />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Nog geen sessies
                  </h3>
                  <p className="mt-1 text-gray-500 dark:text-gray-400">
                    Begin met het vastleggen van je eerste training!
                  </p>
                  <Link
                    href="/sessions/new"
                    className="mt-4 inline-flex items-center rounded-xl bg-gradient-to-b from-primary-500 to-primary-600 px-4 py-2 text-sm font-medium text-white hover:from-primary-600 hover:to-primary-700 shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-150"
                  >
                    Eerste sessie aanmaken
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentSessions.map((session) => (
                    <Link
                      key={session.id}
                      href={`/sessions/${session.id}`}
                      className="block rounded-xl bg-white dark:bg-gray-900 p-4 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 transition hover:shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {formatDate(session.date)}
                          </p>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {session.participants.map((p) => p.userName).join(", ")}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="inline-flex items-center rounded-full bg-primary-50 dark:bg-primary-900/30 px-2.5 py-0.5 text-xs font-medium text-primary-700 dark:text-primary-300">
                            {session.exerciseCount}{" "}
                            {session.exerciseCount === 1
                              ? "oefening"
                              : "oefeningen"}
                          </span>
                        </div>
                      </div>
                      {session.notes && (
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                          {session.notes}
                        </p>
                      )}
                    </Link>
                  ))}

                  <div className="pt-2 text-center">
                    <Link
                      href="/sessions"
                      className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                    >
                      Alle sessies bekijken &rarr;
                    </Link>
                  </div>
                </div>
              )}
            </section>
          </>
        )}
      </div>
  );
}
