"use client";

import Image from "next/image";
import { useState } from "react";

interface ExerciseImageProps {
  imageUrl: string | null;
  imageUrl2?: string | null;
  name: string;
  size?: "sm" | "md" | "lg";
  showToggle?: boolean;
}

const sizes = {
  sm: { width: 80, height: 80, className: "h-20 w-20" },
  md: { width: 200, height: 200, className: "h-48 w-full" },
  lg: { width: 400, height: 400, className: "h-64 w-full" },
};

export function ExerciseImage({
  imageUrl,
  imageUrl2,
  name,
  size = "md",
  showToggle = false,
}: ExerciseImageProps) {
  const [showSecond, setShowSecond] = useState(false);
  const [error, setError] = useState(false);
  const { width, height, className } = sizes[size];

  const currentUrl = showSecond && imageUrl2 ? imageUrl2 : imageUrl;

  if (!currentUrl || error) {
    return (
      <div
        className={`${className} flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800`}
      >
        <svg
          className="h-8 w-8 text-gray-300 dark:text-gray-600"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className={`${className} relative overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800`}>
        <Image
          src={currentUrl}
          alt={name}
          width={width}
          height={height}
          className="h-full w-full object-cover"
          onError={() => setError(true)}
          unoptimized
        />
      </div>
      {showToggle && imageUrl2 && (
        <button
          type="button"
          onClick={() => setShowSecond(!showSecond)}
          className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white hover:bg-black/80 transition-colors"
        >
          {showSecond ? "Start" : "Eind"}
        </button>
      )}
    </div>
  );
}
