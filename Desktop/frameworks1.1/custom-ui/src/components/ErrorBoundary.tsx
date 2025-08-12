import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('UI Error caught by boundary:', error, errorInfo);
    
    // Notify Figma about the error
    if (window.parent && window.parent !== window) {
      try {
        window.parent.postMessage({
          pluginMessage: {
            type: 'ui-error',
            payload: { error: error.message }
          }
        }, '*');
      } catch (e) {
        console.error('Failed to send error to Figma:', e);
      }
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-center">
          <div className="text-red-600 text-lg mb-4">⚠️ Something went wrong</div>
          <div className="text-gray-600 text-sm mb-4">
            The UI encountered an error. Please try refreshing the plugin.
          </div>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
          {this.state.error && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-gray-500">Error Details</summary>
              <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
