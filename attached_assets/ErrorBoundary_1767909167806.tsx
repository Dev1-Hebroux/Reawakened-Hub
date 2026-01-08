import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error boundary component that catches JavaScript errors in child components.
 * Displays a fallback UI instead of crashing the entire page.
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    
    // Log error for observability
    console.error('ErrorBoundary caught an error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });
    
    // Call optional error callback
    this.props.onError?.(error, errorInfo);
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private handleGoHome = (): void => {
    window.location.href = '/';
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-gray-900 rounded-2xl p-8 border border-white/10 text-center">
            <div className="h-16 w-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
            
            <h2 className="text-xl font-bold text-white mb-2">
              Something went wrong
            </h2>
            
            <p className="text-gray-400 mb-6">
              We encountered an unexpected error. Please try refreshing the page or return home.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left mb-6 bg-black/50 rounded-lg p-4 border border-white/5">
                <summary className="text-sm text-gray-500 cursor-pointer">
                  Error details
                </summary>
                <pre className="mt-2 text-xs text-red-400 overflow-auto max-h-40">
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
            
            <div className="flex gap-3 justify-center">
              <Button
                onClick={this.handleRetry}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              
              <Button
                onClick={this.handleGoHome}
                className="bg-primary hover:bg-primary/90"
              >
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Spark-specific error fallback component with contextual messaging.
 */
export function SparkDetailError(): JSX.Element {
  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoToSparks = () => {
    window.location.href = '/sparks';
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gradient-to-br from-gray-900 to-black rounded-2xl p-8 border border-white/10 text-center">
        <div className="h-16 w-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="h-8 w-8 text-amber-400" />
        </div>
        
        <h2 className="text-xl font-bold text-white mb-2">
          Couldn't load this devotional
        </h2>
        
        <p className="text-gray-400 mb-6">
          We had trouble loading this spark. This might be a temporary issue. 
          Please try refreshing or browse other devotionals.
        </p>
        
        <div className="flex gap-3 justify-center">
          <Button
            onClick={handleRefresh}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          <Button
            onClick={handleGoToSparks}
            className="bg-primary hover:bg-primary/90"
          >
            Browse Sparks
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * HOC to wrap a component with error boundary.
 * Usage: export default withErrorBoundary(MyComponent, { fallback: <MyFallback /> });
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
): React.FC<P> {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  
  const ComponentWithErrorBoundary: React.FC<P> = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );
  
  ComponentWithErrorBoundary.displayName = `withErrorBoundary(${displayName})`;
  
  return ComponentWithErrorBoundary;
}
