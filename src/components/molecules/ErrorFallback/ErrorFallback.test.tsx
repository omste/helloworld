import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorFallback } from './ErrorFallback';

describe('ErrorFallback', () => {
  it('renders default error message when no error provided', () => {
    render(<ErrorFallback />);
    expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument();
  });

  it('renders specific error message when error provided', () => {
    const error = new Error('Test specific error');
    render(<ErrorFallback error={error} />);
    expect(screen.getByText('Test specific error')).toBeInTheDocument();
  });

  it('renders try again button when resetError provided', () => {
    const resetError = jest.fn();
    render(<ErrorFallback resetError={resetError} />);
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('does not render try again button when resetError not provided', () => {
    render(<ErrorFallback />);
    expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
  });

  it('calls resetError when try again button clicked', () => {
    const resetError = jest.fn();
    render(<ErrorFallback resetError={resetError} />);
    
    const button = screen.getByText('Try Again');
    fireEvent.click(button);
    
    expect(resetError).toHaveBeenCalledTimes(1);
  });

  it('uses our design system components', () => {
    render(<ErrorFallback />);
    
    // Check for Text component styling
    const heading = screen.getByText('Oops! Something went wrong');
    expect(heading).toHaveClass('text-2xl', 'md:text-3xl', 'text-red-200');
    
    // Check for Box component
    const container = heading.parentElement;
    expect(container).toHaveClass('flex', 'flex-col', 'items-center', 'gap-6');
  });
}); 