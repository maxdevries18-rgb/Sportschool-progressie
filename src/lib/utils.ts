export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("nl-NL", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateShort(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function calculateVolume(reps: number, weightKg: number): number {
  return reps * weightKg;
}

export function todayDateString(): string {
  return new Date().toISOString().split("T")[0];
}
