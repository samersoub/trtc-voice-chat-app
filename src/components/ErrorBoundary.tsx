import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

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
 * Error Boundary Component - يلتقط جميع أخطاء React ويعرض UI احتياطي
 * يمنع تعطل التطبيق بالكامل عند حدوث خطأ في component معين
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Update state with error details
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
    // this.logErrorToService(error, errorInfo);
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // Example: Send to Sentry
    // Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
    
    // For now, just log to localStorage for debugging
    try {
      const errorLog = {
        timestamp: new Date().toISOString(),
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      };
      
      const existingLogs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
      existingLogs.push(errorLog);
      
      // Keep only last 50 errors
      if (existingLogs.length > 50) {
        existingLogs.shift();
      }
      
      localStorage.setItem('errorLogs', JSON.stringify(existingLogs));
    } catch (e) {
      console.error('Failed to log error:', e);
    }
  };

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <div className="flex items-center gap-3 text-destructive">
                <AlertCircle className="h-6 w-6" />
                <CardTitle>حدث خطأ غير متوقع</CardTitle>
              </div>
              <CardDescription>
                نعتذر، حدث خطأ أثناء معالجة طلبك. يمكنك المحاولة مرة أخرى أو العودة للصفحة الرئيسية.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Error Details (Development Mode Only) */}
              {process.env.NODE_ENV === 'development' && (
                <div className="space-y-2">
                  <details className="text-sm">
                    <summary className="cursor-pointer font-semibold text-muted-foreground hover:text-foreground">
                      تفاصيل الخطأ (وضع التطوير)
                    </summary>
                    <div className="mt-3 space-y-2">
                      <div className="bg-muted p-3 rounded-md">
                        <p className="font-mono text-xs text-destructive break-all">
                          {this.state.error?.message}
                        </p>
                      </div>
                      {this.state.error?.stack && (
                        <pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-64 text-muted-foreground">
                          {this.state.error.stack}
                        </pre>
                      )}
                      {this.state.errorInfo?.componentStack && (
                        <pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-64 text-muted-foreground">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      )}
                    </div>
                  </details>
                </div>
              )}

              {/* User-Friendly Message */}
              <div className="bg-muted p-4 rounded-md">
                <h3 className="font-semibold mb-2">ماذا يمكنك فعله؟</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>حاول تحديث الصفحة</li>
                  <li>امسح ذاكرة المتصفح المؤقتة (Cache)</li>
                  <li>تحقق من اتصالك بالإنترنت</li>
                  <li>حاول مرة أخرى بعد قليل</li>
                </ul>
              </div>
            </CardContent>

            <CardFooter className="flex gap-3">
              <Button onClick={this.handleReset} variant="default" className="flex-1">
                <RefreshCcw className="mr-2 h-4 w-4" />
                إعادة المحاولة
              </Button>
              <Button onClick={this.handleGoHome} variant="outline" className="flex-1">
                <Home className="mr-2 h-4 w-4" />
                الصفحة الرئيسية
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
