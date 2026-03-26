"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DuplicateButton({ sessionId }: { sessionId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDuplicate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/duplicate`, {
        method: "POST",
      });
      if (res.ok) {
        const newSession = await res.json();
        router.push(`/sessions/${newSession.id}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDuplicate}
      disabled={loading}
      className="px-3 py-1.5 text-sm rounded-xl bg-white dark:bg-gray-800 ring-1 ring-gray-200 dark:ring-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-150 disabled:opacity-50"
    >
      {loading ? "..." : "📋 Dupliceren"}
    </button>
  );
}
