"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCurrentUser } from "@/contexts/user-context";

interface User {
  id: number;
  name: string;
}

interface Schema {
  id: number;
  name: string;
  description: string | null;
  exerciseCount: number;
}

interface SchemaDetail {
  id: number;
  name: string;
  trainingSchemaExercises: {
    id: number;
    sortOrder: number;
    exercise: { id: number; name: string; muscleGroup: string };
  }[];
}

export default function NewSessionPage() {
  const router = useRouter();
  const { currentUserId } = useCurrentUser();
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);

  const [schemas, setSchemas] = useState<Schema[]>([]);
  const [selectedSchemaId, setSelectedSchemaId] = useState<number | null>(null);
  const [schemaDetail, setSchemaDetail] = useState<SchemaDetail | null>(null);
  const [schemaLoading, setSchemaLoading] = useState(false);

  useEffect(() => {
    async function fetchUsers() {
      setUsersLoading(true);
      setUsersError(null);
      try {
        const r = await fetch("/api/users");
        if (!r.ok) {
          setUsersError("Kon gebruikers niet laden.");
          return;
        }
        const data = await r.json();
        if (!Array.isArray(data)) {
          setUsersError("Kon gebruikers niet laden.");
          return;
        }
        setAllUsers(data);
        setSelectedUserIds(currentUserId ? [currentUserId] : []);
      } catch {
        setUsersError("Kon gebruikers niet laden.");
      } finally {
        setUsersLoading(false);
      }
    }
    fetchUsers();
  }, [currentUserId]);

  useEffect(() => {
    fetch("/api/schemas")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setSchemas(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedSchemaId) {
      setSchemaDetail(null);
      return;
    }
    setSchemaLoading(true);
    fetch(`/api/schemas/${selectedSchemaId}`)
      .then((r) => r.json())
      .then((data) => setSchemaDetail(data))
      .catch(() => setSchemaDetail(null))
      .finally(() => setSchemaLoading(false));
  }, [selectedSchemaId]);

  const toggleUser = (userId: number) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || selectedUserIds.length === 0) {
      setError("Selecteer een datum en minstens 1 deelnemer.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      let res: Response;

      if (selectedSchemaId) {
        res = await fetch(`/api/schemas/${selectedSchemaId}/start-session`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            participantIds: selectedUserIds,
            date,
          }),
        });
      } else {
        res = await fetch("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date,
            notes: notes || null,
            participantIds: selectedUserIds,
          }),
        });
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Fout bij aanmaken");
      }

      const session = await res.json();
      router.push(`/sessions/${session.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Onbekende fout");
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link
        href="/sessions"
        className="inline-flex items-center text-sm text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 transition-colors"
      >
        ← Terug naar sessies
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Nieuwe sessie
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
              Datum
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-base sm:text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:focus:ring-primary-400/20 dark:focus:border-primary-400 transition-colors duration-150"
            />
          </div>

          {/* Schema picker */}
          {schemas.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Schema als template (optioneel)
              </label>
              <select
                value={selectedSchemaId ?? ""}
                onChange={(e) =>
                  setSelectedSchemaId(e.target.value ? Number(e.target.value) : null)
                }
                className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-base sm:text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:focus:ring-primary-400/20 dark:focus:border-primary-400 transition-colors duration-150"
              >
                <option value="">— Geen schema —</option>
                {schemas.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.exerciseCount} oefeningen)
                  </option>
                ))}
              </select>

              {selectedSchemaId && (
                <div className="mt-3">
                  {schemaLoading ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">Laden...</p>
                  ) : schemaDetail ? (
                    <div className="rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800/40 px-4 py-3 space-y-1">
                      <p className="text-xs font-medium text-primary-700 dark:text-primary-300 uppercase tracking-wide">
                        Oefeningen uit dit schema
                      </p>
                      <ul className="space-y-0.5">
                        {schemaDetail.trainingSchemaExercises
                          .sort((a, b) => a.sortOrder - b.sortOrder)
                          .map((tse) => (
                            <li
                              key={tse.id}
                              className="text-sm text-primary-800 dark:text-primary-200"
                            >
                              {tse.exercise.name}
                            </li>
                          ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          )}

          {/* Notities: alleen tonen als geen schema geselecteerd */}
          {!selectedSchemaId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notities (optioneel)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Bijv. leg day, upper body focus..."
                className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-base sm:text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:focus:ring-primary-400/20 dark:focus:border-primary-400 transition-colors duration-150 placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Deelnemers
            </label>
            <div className="space-y-2">
              {usersLoading ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Gebruikers laden...
                </p>
              ) : usersError ? (
                <p className="text-sm text-red-500 dark:text-red-400">
                  {usersError}{" "}
                  <Link href="/sessions/new" className="underline hover:no-underline">
                    Ververs de pagina
                  </Link>
                </p>
              ) : allUsers.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Geen gebruikers gevonden.
                </p>
              ) : (
                allUsers.map((user) => (
                  <label
                    key={user.id}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedUserIds.includes(user.id)}
                      onChange={() => toggleUser(user.id)}
                      className="w-5 h-5 rounded-lg text-primary-600 border-gray-300 dark:border-gray-600 focus:ring-primary-500 dark:bg-gray-800"
                    />
                    <span className="text-gray-900 dark:text-gray-100 font-medium">
                      {user.name}
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving || selectedUserIds.length === 0}
          className="w-full bg-gradient-to-b from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-medium rounded-xl px-6 py-3 shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-150 disabled:opacity-50"
        >
          {saving ? "Aanmaken..." : selectedSchemaId ? "Sessie starten met schema" : "Sessie aanmaken"}
        </button>
      </form>
    </div>
  );
}
