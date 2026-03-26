"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

export function ExerciseSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(searchParams.get("search") ?? "");

  function handleSearch(newValue: string) {
    setValue(newValue);
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (newValue.trim()) {
        params.set("search", newValue.trim());
      } else {
        params.delete("search");
      }
      params.delete("page");
      router.push(`/exercises?${params.toString()}`);
    });
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Zoek oefening..."
        className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 pl-10 pr-4 py-2.5 text-base sm:text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:ring-indigo-400/20 dark:focus:border-indigo-400 transition-colors placeholder-gray-400 dark:placeholder-gray-500"
      />
      <svg
        className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 ${isPending ? "text-indigo-500 animate-pulse" : "text-gray-400 dark:text-gray-500"}`}
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
        />
      </svg>
    </div>
  );
}
