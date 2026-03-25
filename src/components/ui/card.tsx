interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className = "", onClick }: CardProps) {
  return (
    <div
      className={`rounded-xl bg-white dark:bg-gray-900 p-6 shadow-[var(--shadow-card)] ring-1 ring-gray-200/60 dark:ring-gray-700/60 ${onClick ? "cursor-pointer hover:shadow-[var(--shadow-card-hover)] transition-shadow" : ""} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
