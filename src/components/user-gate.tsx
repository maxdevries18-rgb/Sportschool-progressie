"use client";

import { type ReactNode } from "react";
import { useCurrentUser } from "@/contexts/user-context";
import { UserSelectionScreen } from "@/components/user-selection-screen";

export function UserGate({ children }: { children: ReactNode }) {
  const { currentUserId, isLoaded } = useCurrentUser();

  if (!isLoaded) {
    return null;
  }

  if (!currentUserId) {
    return <UserSelectionScreen />;
  }

  return <>{children}</>;
}
