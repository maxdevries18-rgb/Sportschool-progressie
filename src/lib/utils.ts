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

export function parseWeight(value: string): number {
  return Number(value.replace(",", "."));
}

export function todayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

export function getWeekLabel(weekStartStr: string): string {
  const weekStart = new Date(weekStartStr);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const weekNum = getISOWeekNumber(weekStart);
  const startStr = weekStart.toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "short",
  });
  const endStr = weekEnd.toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "short",
  });

  return `Week ${weekNum} (${startStr} - ${endStr})`;
}

function getISOWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
