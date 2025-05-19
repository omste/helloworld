import { FC, ReactNode } from 'react';
import { Box } from '@/components/atoms/Box/Box';
import { Text } from '@/components/atoms/Text/Text';

interface ContentBoxProps {
  children: ReactNode;
  className?: string;
}

export const ContentBox: FC<ContentBoxProps> = ({ children, className = '' }) => {
  return (
    <Box className={`flex items-center justify-center ${className}`}>
      <Text>{children}</Text>
    </Box>
  );
}; 