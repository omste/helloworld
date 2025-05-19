import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';
import { Logger } from '@/lib/logger';

// Mock Logger
jest.mock('@/lib/logger', () => ({
  Logger: {
    getInstance: jest.fn().mockReturnValue({
      error: jest.fn(),
    }),
  },
}));

// Component that throws an error
const BuggyComponent = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>Working component</div>;
};

describe('ErrorBoundary', () => {
  const originalConsoleError = console.error;
  beforeAll(() => {
    // Suppress console.error for cleaner test output
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders default error UI when there is an error', () => {
    const spy = jest.spyOn(console, 'error');
    spy.mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <BuggyComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
    
    spy.mockRestore();
  });

  it('renders custom fallback when provided', () => {
    const spy = jest.spyOn(console, 'error');
    spy.mockImplementation(() => {});

    render(
      <ErrorBoundary fallback={<div>Custom error message</div>}>
        <BuggyComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
    
    spy.mockRestore();
  });

  it('logs error when component crashes', () => {
    const spy = jest.spyOn(console, 'error');
    spy.mockImplementation(() => {});

    const mockLogger = Logger.getInstance();

    render(
      <ErrorBoundary>
        <BuggyComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(mockLogger.error).toHaveBeenCalledWith(
      'Component error caught by boundary',
      expect.objectContaining({
        error: expect.any(Error),
        componentStack: expect.any(String),
      })
    );
    
    spy.mockRestore();
  });
}); 