import React, { Component, ReactNode, ErrorInfo } from 'react';
import { Button } from './ui/button';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

/**
 * Production-grade Error Boundary
 * Catches React errors, logs them, and shows a user-friendly recovery UI.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, errorId: `err_${Date.now().toString(36)}` };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught error:', error.message);

    this.setState({ error, errorInfo });

    // Log to backend for monitoring (fire-and-forget)
    this.reportError(error, errorInfo);
  }

  private reportError(error: Error, errorInfo: ErrorInfo) {
    try {
      const payload = {
        message: error.message,
        stack: error.stack?.slice(0, 2000),
        componentStack: errorInfo.componentStack?.slice(0, 2000),
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        errorId: this.state.errorId,
      };
      // Store in localStorage for later retrieval / support debugging
      const existing = JSON.parse(localStorage.getItem('tb_error_log') || '[]');
      existing.unshift(payload);
      localStorage.setItem('tb_error_log', JSON.stringify(existing.slice(0, 10)));
    } catch {
      // Silently fail — don't crash error boundary
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, errorId: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4" role="alert" aria-live="assertive">
          <div className="max-w-md w-full bg-card border border-border rounded-xl p-8 shadow-lg text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-7 w-7 text-destructive" aria-hidden="true" />
            </div>

            <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
            <p className="text-muted-foreground mb-1 text-sm">
              An unexpected error occurred. We've logged it for review.
            </p>
            {this.state.errorId && (
              <p className="text-[11px] text-muted-foreground/70 font-mono mb-6">
                Ref: {this.state.errorId}
              </p>
            )}

            {import.meta.env.DEV && this.state.error && (
              <details className="mb-6 p-3 bg-muted rounded-lg text-left text-sm">
                <summary className="cursor-pointer font-medium mb-2">
                  Error Details (Dev Only)
                </summary>
                <pre className="text-xs overflow-auto whitespace-pre-wrap break-words max-h-40">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="flex gap-3">
              <Button onClick={this.handleReset} className="flex-1 gap-2">
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() => (window.location.href = '/')}
                className="flex-1 gap-2"
              >
                <Home className="h-4 w-4" aria-hidden="true" />
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
