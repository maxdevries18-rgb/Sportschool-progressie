"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useCurrentUser } from "@/contexts/user-context";
import { formatDate } from "@/lib/utils";

interface Session {
  id: number;
  date: string;
  notes: string | null;
  exerciseCount: number;
  participants: { userId: number; userName: string }[];
}

export default function SessionsPage() {
  const { currentUserId } = useCurrentUser();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!currentUserId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    async function fetchSessions() {
      try {
        const res = await fetch(`/api/sessions?userId=${currentUserId}`);
        if (!res.ok) {
          if (!cancelled) setError("Kon sessies niet laden. Probeer het opnieuw.");
          return;
        }
        const data = await res.json();
        if (!Array.isArray(data)) {
          if (!cancelled) setError("Kon sessies niet laden. Probeer het opnieuw.");
          return;
        }
        if (!cancelled) setSessions(data);
      } catch {
        if (!cancelled) setError("Kon sessies niet laden. Probeer het opnieuw.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchSessions();
    return () => { cancelled = true; };
  }, [currentUserId, retryKey]);

  return (
    <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link
              href="/"
              className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
            >
              &larr; Dashboard
            </Link>
            <h1 className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">Sessies</h1>
          </div>
          <Link
            href="/sessions/new"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-primary-500 to-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:from-primary-600 hover:to-primary-700 hover:shadow-md active:scale-[0.98] transition-all duration-150"
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
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            Nieuwe Sessie
          </Link>
        </div>

        {loading ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            Laden...
          </div>
        ) : error ? (
          <div className="rounded-xl bg-red-50 dark:bg-red-900/20 p-8 text-center ring-1 ring-red-200 dark:ring-red-800">
            <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
            <button
              onClick={() => setRetryKey(k => k + 1)}
              className="mt-4 inline-flex items-center rounded-xl bg-gradient-to-b from-primary-500 to-primary-600 px-4 py-2 text-sm font-medium text-white hover:from-primary-600 hover:to-primary-700 shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-150"
            >
              Opnieuw proberen
            </button>
          </div>
        ) : sessions.length === 0 ? (
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
            {sessions.map((session) => (
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
                      {session.participants
                        .map((p) => p.userName)
                        .join(", ")}
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
          </div>
        )}
      </div>
  );
}
