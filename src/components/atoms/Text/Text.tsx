import { FC, ReactNode } from 'react';

interface TextProps {
  children: ReactNode;
  className?: string;
}

export const Text: FC<TextProps> = ({ children, className = '' }) => {
  return (
    <div className={`text-white text-4xl md:text-6xl lg:text-7xl font-light ${className}`}>
      {children}
    </div>
  );
}; 