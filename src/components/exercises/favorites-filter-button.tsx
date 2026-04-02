"use client";

import { useCurrentUser } from "@/contexts/user-context";
import { useRouter, useSearchParams } from "next/navigation";

export function FavoritesFilterButton() {
  const { currentUserId } = useCurrentUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  if (!currentUserId) return null;

  const isActive =
    searchParams.get("favorites") === "1" &&
    searchParams.get("userId") === String(currentUserId);

  const handleClick = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (isActive) {
      params.delete("favorites");
      params.delete("userId");
    } else {
      params.set("favorites", "1");
      params.set("userId", String(currentUserId));
      params.delete("page");
    }
    router.push(`/exercises?${params.toString()}`);
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-150 ${
        isActive
          ? "bg-gradient-to-b from-red-500 to-red-600 text-white shadow-sm"
          : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 ring-1 ring-gray-200 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        fill={isActive ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={2}
        className="w-4 h-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
      Favorieten
    </button>
  );
}
