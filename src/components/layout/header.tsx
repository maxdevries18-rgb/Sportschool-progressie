"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "./theme-toggle";
import { useCurrentUser } from "@/contexts/user-context";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/exercises", label: "Oefeningen" },
  { href: "/sessions", label: "Sessies" },
  { href: "/schemas", label: "Schema's" },
  { href: "/progress", label: "Progressie" },
  { href: "/settings", label: "Instellingen" },
];

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { currentUserName, currentUserId, clearUser } = useCurrentUser();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
          <span role="img" aria-label="gewichtheffen">
            🏋️
          </span>
          Sportschool Tracker
        </Link>

        {/* Desktop navigatie */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "bg-gray-100 dark:bg-gray-700 text-indigo-600 dark:text-white"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <ThemeToggle />
          {currentUserId && (
            <button
              onClick={clearUser}
              className="ml-2 flex items-center gap-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Wissel van gebruiker"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {currentUserName?.charAt(0).toUpperCase()}
              </span>
              {currentUserName}
            </button>
          )}
        </nav>

        {/* Mobiel hamburger knop */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-label="Menu openen"
        >
          {menuOpen ? (
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Mobiel menu */}
      {menuOpen && (
        <nav className="border-t border-gray-200 dark:border-gray-700 px-4 pb-4 md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`block rounded-md px-3 py-2 text-base font-medium transition-colors ${
                isActive(link.href)
                  ? "bg-gray-100 dark:bg-gray-700 text-indigo-600 dark:text-white"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-2 border-t border-gray-200 dark:border-gray-700 pt-2 flex items-center justify-between">
            <ThemeToggle />
            {currentUserId && (
              <button
                onClick={() => { clearUser(); setMenuOpen(false); }}
                className="flex items-center gap-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {currentUserName?.charAt(0).toUpperCase()}
                </span>
                {currentUserName}
              </button>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
