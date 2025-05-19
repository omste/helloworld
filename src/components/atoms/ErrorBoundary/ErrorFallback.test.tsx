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
    expect(getByText('Oops! Something went wrong')).toBeInTheDocument();
    expect(getByText('Test error message')).toBeInTheDocument();
  });

  it('renders default error message when error is undefined', () => {
    const { getByText } = render(
      <ErrorFallback onRetry={mockOnRetry} />
    );
    expect(getByText('An unexpected error occurred')).toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', () => {
    const { getByText } = render(
      <ErrorFallback error={testError} onRetry={mockOnRetry} />
    );
    fireEvent.click(getByText('Try Again'));
    expect(mockOnRetry).toHaveBeenCalledTimes(1);
  });

  it('does not render retry button when onRetry is not provided', () => {
    const { queryByText } = render(
      <ErrorFallback error={testError} />
    );
    expect(queryByText('Try Again')).not.toBeInTheDocument();
  });

  it('uses correct styling classes', () => {
    const { getByText } = render(
      <ErrorFallback error={testError} onRetry={mockOnRetry} />
    );
    
    const heading = getByText('Oops! Something went wrong');
    expect(heading).toHaveClass('text-2xl', 'md:text-3xl', 'text-red-200');
    
    const button = getByText('Try Again');
    expect(button).toHaveClass(
      'px-6',
      'py-2',
      'border-2',
      'border-white/80',
      'rounded-full',
      'hover:bg-white/10',
      'transition-colors',
      'duration-200'
    );
  });
}); 