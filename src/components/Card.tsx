interface CardProps {
  children: React.ReactNode;
}

export function Card({ children }: CardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
      {children}
    </div>
  );
}
