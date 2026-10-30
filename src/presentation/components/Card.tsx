import type { ReactNode } from 'react';

interface Props {
  title?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Card({ title, icon, children, className = '' }: Props) {
  return (
      <section className={`neo space-y-4 rounded-4xl p-5 ${className}`}>
        {title && (
            <h3 className="flex items-center gap-2 text-lg font-bold">
              {icon}
              {title}
            </h3>
        )}
        {children}
      </section>
  );
}