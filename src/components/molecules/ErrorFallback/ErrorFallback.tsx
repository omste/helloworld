import { FC } from 'react';
import { Box } from '@/components/atoms/Box/Box';
import { Text } from '@/components/atoms/Text/Text';

interface ErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
}

export const ErrorFallback: FC<ErrorFallbackProps> = ({ error, resetError }) => {
  return (
    <Box className="flex flex-col items-center gap-6">
      <Text className="text-2xl md:text-3xl text-red-200">
        Oops! Something went wrong
      </Text>
      <div className="text-white/80 text-center">
        <p className="mb-4">
          {error?.message || 'An unexpected error occurred'}
        </p>
        {resetError && (
          <button
            onClick={resetError}
            className="px-6 py-2 border-2 border-white/80 rounded-full 
                     hover:bg-white/10 transition-colors duration-200
                     focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            Try Again
          </button>
        )}
      </div>
    </Box>
  );
}; 