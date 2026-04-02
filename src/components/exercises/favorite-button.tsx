"use client";

import { useState, useEffect } from "react";
import { useCurrentUser } from "@/contexts/user-context";

interface FavoriteButtonProps {
  exerciseId: number;
  initialIsFavorite: boolean;
  fetchOnMount?: boolean;
  className?: string;
}

export function FavoriteButton({
  exerciseId,
  initialIsFavorite,
  fetchOnMount = false,
  className = "",
}: FavoriteButtonProps) {
  const { currentUserId } = useCurrentUser();
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!fetchOnMount || !currentUserId) return;
    fetch(`/api/exercises/${exerciseId}/favorite?userId=${currentUserId}`)
      .then((r) => r.json())
      .then((data) => setIsFavorite(data.isFavorite))
      .catch(() => {});
  }, [fetchOnMount, exerciseId, currentUserId]);

  if (!currentUserId) return null;

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;

    setLoading(true);
    const optimistic = !isFavorite;
    setIsFavorite(optimistic);

    try {
      const res = await fetch(`/api/exercises/${exerciseId}/favorite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUserId }),
      });
      const data = await res.json();
      setIsFavorite(data.isFavorite);
    } catch {
      setIsFavorite(!optimistic);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      aria-label={isFavorite ? "Verwijder uit favorieten" : "Voeg toe aan favorieten"}
      className={`flex items-center justify-center rounded-full w-8 h-8 transition-colors duration-150 ${
        isFavorite
          ? "text-red-500 hover:text-red-400"
          : "text-gray-300 dark:text-gray-600 hover:text-red-400 dark:hover:text-red-400"
      } ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill={isFavorite ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={2}
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    </button>
  );
}
