import React from 'react';
import { FiRefreshCw, FiAlertTriangle } from 'react-icons/fi';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // You can also log the error to an error reporting service here
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: error.toString(),
        fatal: false
      });
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-2xl mx-auto py-16 px-4">
          <div className="flex flex-col items-center space-y-8 text-center">
            <FiAlertTriangle className="w-16 h-16 text-red-400" />
            
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-red-400">
                Oops! Something went wrong
              </h1>
              
              <p className="text-lg text-slate-400 max-w-md">
                We encountered an unexpected error. Don't worry, your data is safe.
              </p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-md p-4 max-w-lg w-full">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <FiAlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Error Details:
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    {this.state.error && this.state.error.toString()}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-3">
              <button
                className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                onClick={this.handleReload}
              >
                <FiRefreshCw className="w-4 h-4 mr-2" />
                Reload Page
              </button>
              
              <button
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 transition-colors"
                onClick={this.handleGoHome}
              >
                Go to Home
              </button>
            </div>

            {/* Error details for development */}
            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <details className="bg-slate-100 p-4 rounded-md w-full text-sm">
                <summary className="font-bold cursor-pointer mb-2">
                  Error Details (Development Only)
                </summary>
                <pre className="text-left whitespace-pre-wrap text-xs">
                  {this.state.error && this.state.error.stack}
                  {this.state.errorInfo.componentStack}
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

export default ErrorBoundary;