"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

interface CurrentUser {
  id: number;
  name: string;
}

interface UserContextType {
  currentUserId: number | null;
  currentUserName: string | null;
  isLoaded: boolean;
  selectUser: (id: number, name: string) => void;
  clearUser: () => void;
}

const STORAGE_KEY = "sportschool-current-user";

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as CurrentUser;
        if (parsed.id && parsed.name) {
          setCurrentUser(parsed);
        }
      }
    } catch {
      // Invalid stored data, ignore
    }
    setIsLoaded(true);
  }, []);

  const selectUser = useCallback((id: number, name: string) => {
    const user = { id, name };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    setCurrentUser(user);
  }, []);

  const clearUser = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setCurrentUser(null);
  }, []);

  return (
    <UserContext.Provider
      value={{
        currentUserId: currentUser?.id ?? null,
        currentUserName: currentUser?.name ?? null,
        isLoaded,
        selectUser,
        clearUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useCurrentUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useCurrentUser must be used within a UserProvider");
  }
  return context;
}
