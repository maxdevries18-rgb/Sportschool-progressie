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

export const EQUIPMENT_TYPES = [
  "barbell",
  "dumbbell",
  "cable",
  "machine",
  "body only",
  "kettlebells",
  "bands",
  "medicine ball",
  "exercise ball",
  "foam roll",
  "other",
] as const;

export type Equipment = (typeof EQUIPMENT_TYPES)[number];

export const EQUIPMENT_LABELS: Record<Equipment, string> = {
  barbell: "Barbell",
  dumbbell: "Dumbbell",
  cable: "Cable",
  machine: "Machine",
  "body only": "Bodyweight",
  kettlebells: "Kettlebell",
  bands: "Bands",
  "medicine ball": "Medicine Ball",
  "exercise ball": "Exercise Ball",
  "foam roll": "Foam Roll",
  other: "Overig",
};

export const LEVEL_TYPES = ["beginner", "intermediate", "expert"] as const;

export type Level = (typeof LEVEL_TYPES)[number];

export const LEVEL_LABELS: Record<Level, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  expert: "Expert",
};

export const EXERCISE_IMAGE_BASE_URL =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises";

export const DEFAULT_SETS_COUNT = 3;
