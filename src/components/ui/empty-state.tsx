interface EmptyStateProps {
  title: string;
  description: string;
  icon?: string;
}

export function EmptyState({ title, description, icon = "📭" }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 px-6 py-12 text-center">
      <span className="text-5xl" role="img" aria-hidden="true">
        {icon}
      </span>
      <h3 className="mt-4 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </div>
  );
}
