interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className = "", onClick }: CardProps) {
  return (
    <div
      className={`rounded-lg bg-white p-6 shadow-md ${onClick ? "cursor-pointer transition-shadow hover:shadow-lg" : ""} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
