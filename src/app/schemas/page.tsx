"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface Schema {
  id: number;
  name: string;
  description: string | null;
  isPreset: number;
  exerciseCount: number;
}

export default function SchemasPage() {
  const [schemas, setSchemas] = useState<Schema[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSchemas() {
      try {
        const res = await fetch("/api/schemas");
        const data = await res.json();
        setSchemas(data);
      } catch (error) {
        console.error("Fout bij laden schema's:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSchemas();
  }, []);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link
            href="/"
            className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            &larr; Dashboard
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
            Trainingsschema&apos;s
          </h1>
        </div>
        <Link
          href="/schemas/new"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-indigo-500 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:from-indigo-600 hover:to-indigo-700 hover:shadow-md active:scale-[0.98] transition-all duration-150"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          Nieuw Schema
        </Link>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          Laden...
        </div>
      ) : schemas.length === 0 ? (
        <div className="rounded-xl bg-white dark:bg-gray-900 p-8 text-center shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
          <svg
            className="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15a2.25 2.25 0 0 1 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Nog geen schema&apos;s
          </h3>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Maak je eerste trainingsschema aan!
          </p>
          <Link
            href="/schemas/new"
            className="mt-4 inline-flex items-center rounded-xl bg-gradient-to-b from-indigo-500 to-indigo-600 px-4 py-2 text-sm font-medium text-white hover:from-indigo-600 hover:to-indigo-700 shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-150"
          >
            Eerste schema aanmaken
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {schemas.map((schema) => (
            <Link
              key={schema.id}
              href={`/schemas/${schema.id}`}
              className="block rounded-xl bg-white dark:bg-gray-900 p-4 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 transition hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {schema.name}
                  </p>
                  {schema.description && (
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                      {schema.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {schema.isPreset === 1 && (
                    <span className="inline-flex items-center rounded-full bg-amber-50 dark:bg-amber-900/30 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300">
                      Standaard
                    </span>
                  )}
                  <span className="inline-flex items-center rounded-full bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:text-indigo-300">
                    {schema.exerciseCount}{" "}
                    {schema.exerciseCount === 1 ? "oefening" : "oefeningen"}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
