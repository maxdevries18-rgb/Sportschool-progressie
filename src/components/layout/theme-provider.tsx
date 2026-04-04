"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export type ColorTheme = "indigo" | "blue" | "emerald" | "rose" | "amber" | "violet";

interface ThemeContextType {
  theme: "light" | "dark";
  toggleTheme: () => void;
  colorTheme: ColorTheme;
  setColorTheme: (color: ColorTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [colorTheme, setColorThemeState] = useState<ColorTheme>("indigo");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark") {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    } else if (stored === "light") {
      setTheme("light");
      document.documentElement.classList.remove("dark");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) {
        setTheme("dark");
        document.documentElement.classList.add("dark");
      }
    }

    const storedColor = localStorage.getItem("colorTheme") as ColorTheme | null;
    if (storedColor) {
      setColorThemeState(storedColor);
      document.documentElement.setAttribute("data-color-theme", storedColor);
    }

    setMounted(true);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("theme", next);
      if (next === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return next;
    });
  }, []);

  const setColorTheme = useCallback((color: ColorTheme) => {
    setColorThemeState(color);
    localStorage.setItem("colorTheme", color);
    document.documentElement.setAttribute("data-color-theme", color);
  }, []);

  if (!mounted) {
    return <ThemeContext.Provider value={{ theme, toggleTheme, colorTheme, setColorTheme }}>{children}</ThemeContext.Provider>;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colorTheme, setColorTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
