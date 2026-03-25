export const MUSCLE_GROUPS = [
  "borst",
  "rug",
  "benen",
  "schouders",
  "armen",
  "core",
] as const;

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  borst: "Borst",
  rug: "Rug",
  benen: "Benen",
  schouders: "Schouders",
  armen: "Armen",
  core: "Core",
};

export const MUSCLE_GROUP_EMOJI: Record<MuscleGroup, string> = {
  borst: "🫁",
  rug: "🔙",
  benen: "🦵",
  schouders: "💪",
  armen: "💪",
  core: "🎯",
};

export const DEFAULT_SETS_COUNT = 3;
