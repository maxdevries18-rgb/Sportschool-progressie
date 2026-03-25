type MuscleGroup = "borst" | "rug" | "benen" | "schouders" | "armen" | "core";

interface BadgeProps {
  label: string;
  variant?: MuscleGroup;
}

const variantClasses: Record<MuscleGroup, string> = {
  borst: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  rug: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  benen: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  schouders: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  armen: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  core: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
};

const defaultClasses = "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";

export function Badge({ label, variant }: BadgeProps) {
  const colorClasses = variant ? variantClasses[variant] : defaultClasses;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClasses}`}
    >
      {label}
    </span>
  );
}
