import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleRefresh = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-lg border-2 border-[#243656]/10 p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-[#243656] mb-3">
              Something went wrong
            </h2>
            <p className="text-[#243656]/70 mb-6">
              We encountered an unexpected error. Don't worry, your data is safe.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleRefresh}
                data-testid="button-refresh"
                className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-[#4A7C7C] text-white rounded-xl font-medium hover:bg-[#3d6666] transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                Refresh Page
              </button>
              <button
                onClick={this.handleGoHome}
                data-testid="button-go-home"
                className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-[#243656] text-white rounded-xl font-medium hover:bg-[#1a2744] transition-colors"
              >
                <Home className="w-5 h-5" />
                Go to Home
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-sm text-[#243656]/60 cursor-pointer hover:text-[#243656]">
                  Technical details
                </summary>
                <pre className="mt-2 p-3 bg-gray-100 rounded-lg text-xs text-red-600 overflow-auto max-h-40">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundaryWrapper(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}
