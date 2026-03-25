type MuscleGroup = "borst" | "rug" | "benen" | "schouders" | "armen" | "core";

interface BadgeProps {
  label: string;
  variant?: MuscleGroup;
}

const variantClasses: Record<MuscleGroup, string> = {
  borst: "bg-blue-100 text-blue-800",
  rug: "bg-green-100 text-green-800",
  benen: "bg-red-100 text-red-800",
  schouders: "bg-purple-100 text-purple-800",
  armen: "bg-orange-100 text-orange-800",
  core: "bg-yellow-100 text-yellow-800",
};

const defaultClasses = "bg-gray-100 text-gray-800";

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
