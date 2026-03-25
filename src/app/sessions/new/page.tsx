"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface User {
  id: number;
  name: string;
}

export default function NewSessionPage() {
  const router = useRouter();
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then((data) => {
        setAllUsers(data);
        setSelectedUserIds(data.map((u: User) => u.id));
      })
      .catch(() => {});
  }, []);

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
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          notes: notes || null,
          participantIds: selectedUserIds,
        }),
      });

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
        className="inline-flex items-center text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
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
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-base sm:text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:ring-indigo-400/20 dark:focus:border-indigo-400 transition-colors duration-150"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notities (optioneel)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Bijv. leg day, upper body focus..."
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-base sm:text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:ring-indigo-400/20 dark:focus:border-indigo-400 transition-colors duration-150 placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Deelnemers
            </label>
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
              {allUsers.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Gebruikers laden...
                </p>
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving || selectedUserIds.length === 0}
          className="w-full bg-gradient-to-b from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-medium rounded-xl px-6 py-3 shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-150 disabled:opacity-50"
        >
          {saving ? "Aanmaken..." : "Sessie aanmaken"}
        </button>
      </form>
    </div>
  );
}
