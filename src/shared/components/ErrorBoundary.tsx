'use client';

import React, { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * 에러 바운더리 컴포넌트
 * 자식 컴포넌트에서 발생하는 에러를 잡아서 폴백 UI를 표시합니다.
 * 특히 웹소켓 연결 에러 등으로 인한 앱 크래시를 방지합니다.
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    // 에러가 발생하면 state를 업데이트하여 다음 렌더링에서 폴백 UI를 표시합니다.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 에러 로깅 서비스에 에러를 기록할 수 있습니다.
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // 외부에서 제공된 에러 핸들러 실행
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      // 커스텀 폴백 UI가 제공되면 사용
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 기본 폴백 UI
      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center p-8">
          <div className="text-center">
            <h2 className="mb-2 text-lg font-semibold text-gray-900">문제가 발생했습니다</h2>
            <p className="mb-4 text-sm text-gray-600">
              일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-4 text-left">
                <summary className="cursor-pointer text-sm text-gray-500">에러 상세 정보</summary>
                <pre className="mt-2 overflow-auto rounded bg-gray-100 p-2 text-xs text-red-600">
                  {this.state.error.message}
                  {'\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
            <button
              onClick={this.handleReset}
              className="rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              다시 시도
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * 웹소켓 에러를 위한 특화된 에러 바운더리
 */
export const WebSocketErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    // 웹소켓 관련 에러인 경우 특별 처리
    if (
      error.message.includes('WebSocket') ||
      error.message.includes('subscription') ||
      error.message.includes('already exists')
    ) {
      console.warn('[WebSocket] 에러가 발생했지만 서비스는 계속 동작합니다:', error.message);
      // 여기서 추가적인 에러 보고나 모니터링 로직을 추가할 수 있습니다.
    }
  };

  return (
    <ErrorBoundary
      onError={handleError}
      fallback={
        <div className="flex min-h-[400px] flex-col items-center justify-center p-8">
          <div className="text-center">
            <h2 className="mb-2 text-lg font-semibold text-gray-900">연결 문제가 발생했습니다</h2>
            <p className="mb-4 text-sm text-gray-600">
              실시간 업데이트가 일시적으로 중단되었습니다.
              <br />
              페이지를 새로고침하면 다시 연결됩니다.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              새로고침
            </button>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
};