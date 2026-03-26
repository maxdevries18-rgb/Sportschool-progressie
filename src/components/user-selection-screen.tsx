"use client";

import { useState, useEffect } from "react";
import { useCurrentUser } from "@/contexts/user-context";

interface User {
  id: number;
  name: string;
}

export function UserSelectionScreen() {
  const { selectUser } = useCurrentUser();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data);
    } catch {
      setError("Kon gebruikers niet laden.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setCreating(true);
    setError("");

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Kon gebruiker niet aanmaken.");
        return;
      }

      const newUser = await res.json();
      setNewName("");
      selectUser(newUser.id, newUser.name);
    } catch {
      setError("Kon gebruiker niet aanmaken.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="text-5xl">🏋️</span>
          <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-gray-100">
            Sportschool Tracker
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Wie ben je?
          </p>
        </div>

        {loading ? (
          <div className="text-center text-gray-500 dark:text-gray-400">
            Laden...
          </div>
        ) : (
          <>
            {users.length > 0 && (
              <div className="mb-6 space-y-3">
                {users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => selectUser(user.id, user.name)}
                    className="w-full rounded-xl bg-white dark:bg-gray-900 p-4 text-left text-lg font-medium text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 transition hover:shadow-md hover:ring-indigo-300 dark:hover:ring-indigo-600 active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      {user.name}
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="rounded-xl bg-white dark:bg-gray-900 p-4 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
              <h2 className="mb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                Nieuwe gebruiker aanmaken
              </h2>
              <form onSubmit={handleCreate} className="flex gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Naam"
                  className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  disabled={creating}
                />
                <button
                  type="submit"
                  disabled={creating || !newName.trim()}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition"
                >
                  {creating ? "..." : "Aanmaken"}
                </button>
              </form>
              {error && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
