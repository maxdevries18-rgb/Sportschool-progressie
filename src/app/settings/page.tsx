"use client";

import { useState, useEffect } from "react";
import { useCurrentUser } from "@/contexts/user-context";
import { useTheme, type ColorTheme } from "@/components/layout/theme-provider";

interface User {
  id: number;
  name: string;
}

const COLOR_THEMES: { value: ColorTheme; label: string; swatch: string }[] = [
  { value: "indigo", label: "Indigo", swatch: "#6366f1" },
  { value: "blue", label: "Blauw", swatch: "#3b82f6" },
  { value: "emerald", label: "Groen", swatch: "#10b981" },
  { value: "rose", label: "Rood", swatch: "#f43f5e" },
  { value: "amber", label: "Oranje", swatch: "#f59e0b" },
  { value: "violet", label: "Paars", swatch: "#8b5cf6" },
];

export default function SettingsPage() {
  const { currentUserName, clearUser } = useCurrentUser();
  const { colorTheme, setColorTheme } = useTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [newUserName, setNewUserName] = useState("");
  const [creatingUser, setCreatingUser] = useState(false);
  const [createError, setCreateError] = useState("");
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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">Instellingen</h1>

      {/* Uiterlijk */}
      <div className="mb-6 rounded-xl bg-white dark:bg-gray-900 p-6 shadow-[var(--shadow-card)] ring-1 ring-gray-200/60 dark:ring-gray-700/60">
        <h2 className="mb-1 text-lg font-semibold text-gray-900 dark:text-gray-100">Uiterlijk</h2>
        <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">Kies een kleurenthema voor de app.</p>
        <div className="flex flex-wrap gap-3">
          {COLOR_THEMES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setColorTheme(t.value)}
              className={`flex flex-col items-center gap-1.5 rounded-xl border-2 px-4 py-3 transition-all duration-150 ${
                colorTheme === t.value
                  ? "border-primary-500 bg-primary-50 dark:bg-primary-950/30"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
              aria-pressed={colorTheme === t.value}
            >
              <span
                className="h-6 w-6 rounded-full shadow-sm ring-1 ring-black/10"
                style={{ backgroundColor: t.swatch }}
              />
              <span className={`text-xs font-medium ${colorTheme === t.value ? "text-primary-700 dark:text-primary-300" : "text-gray-600 dark:text-gray-400"}`}>
                {t.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Gebruikers beheren */}
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
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-base sm:text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:focus:ring-primary-400/20 dark:focus:border-primary-400 transition-colors duration-150 focus:outline-none"
                />
              </div>
              <button
                onClick={() => handleSave(user.id)}
                disabled={saving[user.id]}
                className="mt-6 rounded-xl bg-gradient-to-b from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-150 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
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

        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
            Nieuwe gebruiker aanmaken
          </h3>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!newUserName.trim()) return;
              setCreatingUser(true);
              setCreateError("");
              try {
                const res = await fetch("/api/users", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ name: newUserName.trim() }),
                });
                if (!res.ok) {
                  const data = await res.json();
                  setCreateError(data.error || "Kon gebruiker niet aanmaken.");
                  return;
                }
                const newUser = await res.json();
                setUsers((prev) => [...prev, newUser]);
                setEditNames((prev) => ({ ...prev, [newUser.id]: newUser.name }));
                setNewUserName("");
              } catch {
                setCreateError("Kon gebruiker niet aanmaken.");
              } finally {
                setCreatingUser(false);
              }
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              placeholder="Naam"
              className="flex-1 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-base sm:text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:focus:ring-primary-400/20 dark:focus:border-primary-400 transition-colors duration-150 focus:outline-none"
              disabled={creatingUser}
            />
            <button
              type="submit"
              disabled={creatingUser || !newUserName.trim()}
              className="rounded-xl bg-gradient-to-b from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-150 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {creatingUser ? "..." : "Aanmaken"}
            </button>
          </form>
          {createError && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{createError}</p>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-xl bg-white dark:bg-gray-900 p-6 shadow-[var(--shadow-card)] ring-1 ring-gray-200/60 dark:ring-gray-700/60">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
          Account
        </h2>
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          Je bent ingelogd als <span className="font-medium text-gray-900 dark:text-gray-100">{currentUserName}</span>.
        </p>
        <button
          onClick={clearUser}
          className="rounded-xl bg-gray-100 dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          Wissel van gebruiker
        </button>
      </div>
    </div>
  );
}
