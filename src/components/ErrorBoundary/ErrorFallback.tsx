import { FC } from 'react';
import { Box } from '@/components/atoms/Box/Box';
import { Text } from '@/components/atoms/Text/Text';

interface ErrorFallbackProps {
  error: Error | null;
  onRetry: () => void;
}

export const ErrorFallback: FC<ErrorFallbackProps> = ({ error, onRetry }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Box className="max-w-2xl w-full">
        <div className="space-y-6">
          <Text className="text-red-500">Something went wrong</Text>
          <div className="text-white/80 text-lg">
            {error?.message || 'An unexpected error occurred'}
          </div>
          <button
            onClick={onRetry}
            className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-colors"
          >
            Try again
          </button>
        </div>
      </Box>
    </div>
  );
}; 