"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteExerciseButton({ exerciseId }: { exerciseId: number }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    if (!confirm("Weet je zeker dat je deze oefening wilt verwijderen?")) return;

    setDeleting(true);
    setError("");

    try {
      const res = await fetch(`/api/exercises/${exerciseId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Kon oefening niet verwijderen.");
        return;
      }

      router.push("/exercises");
      router.refresh();
    } catch {
      setError("Kon oefening niet verwijderen.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="px-3 py-1.5 text-sm rounded-xl bg-white dark:bg-gray-800 ring-1 ring-red-200 dark:ring-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-150 disabled:opacity-50"
      >
        {deleting ? "..." : "🗑️ Verwijderen"}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
