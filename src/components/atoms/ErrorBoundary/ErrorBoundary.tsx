import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Logger } from '@/lib/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  private logger: Logger;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
    this.logger = Logger.getInstance();
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.logger.error('Component error caught by boundary', {
      error,
      componentStack: errorInfo.componentStack,
    });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-8 rounded-3xl border-2 border-red-400/80 text-white">
          <h2 className="text-xl font-medium mb-2">Something went wrong</h2>
          <p className="text-white/80">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
        </div>
      );
    }

    return this.props.children;
  }
} 