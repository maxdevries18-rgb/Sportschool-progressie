"use client";

import { useState, useEffect } from "react";

interface User {
  id: number;
  name: string;
}

export default function SettingsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [editNames, setEditNames] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState<Record<number, boolean>>({});
  const [feedback, setFeedback] = useState<Record<number, { type: "success" | "error"; message: string }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data: User[]) => {
        setUsers(data);
        const names: Record<number, string> = {};
        data.forEach((u) => (names[u.id] = u.name));
        setEditNames(names);
        setLoading(false);
      });
  }, []);

  async function handleSave(userId: number) {
    const newName = editNames[userId]?.trim();
    if (!newName) return;

    const original = users.find((u) => u.id === userId);
    if (original && original.name === newName) return;

    setSaving((prev) => ({ ...prev, [userId]: true }));
    setFeedback((prev) => ({ ...prev, [userId]: undefined as never }));

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Fout bij opslaan");
      }

      const updated = await res.json();
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      setFeedback((prev) => ({
        ...prev,
        [userId]: { type: "success", message: "Opgeslagen!" },
      }));

      setTimeout(() => {
        setFeedback((prev) => {
          const next = { ...prev };
          delete next[userId];
          return next;
        });
      }, 2000);
    } catch (err) {
      setFeedback((prev) => ({
        ...prev,
        [userId]: {
          type: "error",
          message: err instanceof Error ? err.message : "Fout bij opslaan",
        },
      }));
    } finally {
      setSaving((prev) => ({ ...prev, [userId]: false }));
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">Instellingen</h1>

      <div className="rounded-xl bg-white dark:bg-gray-900 p-6 shadow-[var(--shadow-card)] ring-1 ring-gray-200/60 dark:ring-gray-700/60">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
          Gebruikers beheren
        </h2>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          Pas de namen aan van de gebruikers in de app.
        </p>

        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="flex items-center gap-3">
              <div className="flex-1">
                <label
                  htmlFor={`user-${user.id}`}
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Gebruiker {user.id}
                </label>
                <input
                  id={`user-${user.id}`}
                  type="text"
                  value={editNames[user.id] ?? ""}
                  onChange={(e) =>
                    setEditNames((prev) => ({
                      ...prev,
                      [user.id]: e.target.value,
                    }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSave(user.id);
                  }}
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-base sm:text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:ring-indigo-400/20 dark:focus:border-indigo-400 transition-colors duration-150 focus:outline-none"
                />
              </div>
              <button
                onClick={() => handleSave(user.id)}
                disabled={saving[user.id]}
                className="mt-6 rounded-xl bg-gradient-to-b from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-150 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {saving[user.id] ? "Opslaan..." : "Opslaan"}
              </button>
              {feedback[user.id] && (
                <span
                  className={`mt-6 text-sm ${
                    feedback[user.id].type === "success"
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {feedback[user.id].message}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
