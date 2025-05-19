import { render, fireEvent } from '@testing-library/react';
import { ErrorFallback } from './ErrorFallback';

describe('ErrorFallback', () => {
  const mockOnRetry = jest.fn();
  const testError = new Error('Test error message');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders error message', () => {
    const { getByText } = render(
      <ErrorFallback error={testError} onRetry={mockOnRetry} />
    );
    expect(getByText('Something went wrong')).toBeInTheDocument();
    expect(getByText('Test error message')).toBeInTheDocument();
  });

  it('renders default error message when error is null', () => {
    const { getByText } = render(
      <ErrorFallback error={null} onRetry={mockOnRetry} />
    );
    expect(getByText('An unexpected error occurred')).toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', () => {
    const { getByText } = render(
      <ErrorFallback error={testError} onRetry={mockOnRetry} />
    );
    fireEvent.click(getByText('Try again'));
    expect(mockOnRetry).toHaveBeenCalledTimes(1);
  });
}); 