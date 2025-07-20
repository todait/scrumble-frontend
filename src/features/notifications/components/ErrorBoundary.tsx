'use client';

import { Component, ReactNode, ErrorInfo } from 'react';
import { RiErrorWarningLine } from '@remixicon/react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class NotificationErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('알림 시스템 에러:', error, errorInfo);
    
    this.setState({
      hasError: true,
      error,
      errorInfo
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <div className="mb-4 rounded-full bg-red-50 p-3">
            <RiErrorWarningLine className="h-8 w-8 text-red-500" />
          </div>
          
          <h3 className="mb-2 text-lg font-semibold text-red-700">
            알림을 불러오는 중 오류가 발생했습니다
          </h3>
          
          <p className="text-center text-sm text-red-600 mb-4 max-w-md">
            예기치 않은 오류가 발생했습니다. 페이지를 새로고침하거나 잠시 후 다시 시도해주세요.
          </p>
          
          <div className="flex gap-2">
            <button
              onClick={this.handleRetry}
              className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors touch-manipulation min-h-[44px]"
              aria-label="알림 시스템 다시 시도"
            >
              다시 시도
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors touch-manipulation min-h-[44px]"
              aria-label="페이지 새로고침"
            >
              새로고침
            </button>
          </div>
          
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-4 p-4 bg-gray-100 rounded-lg text-xs max-w-md">
              <summary className="cursor-pointer font-medium text-gray-700">
                에러 상세 정보
              </summary>
              <pre className="mt-2 text-red-600 whitespace-pre-wrap">
                {this.state.error.message}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export { NotificationErrorBoundary };