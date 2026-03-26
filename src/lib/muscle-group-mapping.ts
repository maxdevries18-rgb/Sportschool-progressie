import type { MuscleGroup } from "./constants";

const muscleGroupMapping: Record<string, MuscleGroup> = {
  chest: "borst",
  "middle back": "rug",
  "lower back": "rug",
  lats: "rug",
  traps: "rug",
  neck: "rug",
  quadriceps: "benen",
  hamstrings: "benen",
  glutes: "benen",
  calves: "benen",
  abductors: "benen",
  adductors: "benen",
  shoulders: "schouders",
  biceps: "armen",
  triceps: "armen",
  forearms: "armen",
  abdominals: "core",
};

export function mapMuscleGroup(englishName: string): MuscleGroup {
  return muscleGroupMapping[englishName.toLowerCase()] ?? "core";
}

export function mapMuscleGroups(muscles: string[]): MuscleGroup[] {
  const mapped = new Set(muscles.map(mapMuscleGroup));
  return [...mapped];
}
