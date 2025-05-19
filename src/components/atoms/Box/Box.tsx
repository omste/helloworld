import { FC, ReactNode } from 'react';

interface BoxProps {
  children: ReactNode;
  className?: string;
}

export const Box: FC<BoxProps> = ({ children, className = '' }) => {
  return (
    <div className={`p-8 rounded-3xl border-2 border-white/80 ${className}`}>
      {children}
    </div>
  );
}; 