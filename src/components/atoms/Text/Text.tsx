import { FC, ReactNode } from 'react';

interface TextProps {
  children: ReactNode;
  className?: string;
}

export const Text: FC<TextProps> = ({ children, className = '' }) => {
  return (
    <div 
      className={`
        text-white text-2xl transition-all duration-300
        md:text-4xl lg:text-6xl font-light
        ${className}
      `}
    >
      {children}
    </div>
  );
}; 