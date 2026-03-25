interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className = "", onClick }: CardProps) {
  return (
    <div
      className={`rounded-lg bg-white dark:bg-gray-900 p-6 shadow-md dark:ring-1 dark:ring-gray-700 ${onClick ? "cursor-pointer transition-shadow hover:shadow-lg" : ""} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
