import React from "react";

class SupabaseErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error("Supabase Error Boundary caught an error:", error, errorInfo);

    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    // You can also log the error to an error reporting service here
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService = (error, errorInfo) => {
    // Enhanced error logging for Supabase-specific errors
    const errorDetails = {
      message: error?.message || "Unknown error",
      stack: error?.stack || "No stack trace available",
      componentStack: errorInfo?.componentStack || "No component stack",
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      isSupabaseError: this.isSupabaseError(error),
      errorType: this.categorizeError(error),
    };

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.group("🔴 Supabase Error Details");
      console.error("Error:", error);
      console.error("Error Info:", errorInfo);
      console.error("Full Details:", errorDetails);
      console.groupEnd();
    }

    // Here you could send to an error reporting service like Sentry
    // Example: Sentry.captureException(error, { extra: errorDetails });
  };

  isSupabaseError = (error) => {
    if (!error) return false;
    return (
      error.message?.includes("supabase") ||
      error.message?.includes("postgres") ||
      error.message?.includes("PostgREST") ||
      error.stack?.includes("supabase")
    );
  };

  categorizeError = (error) => {
    if (!error) return "unknown";
    const message = error.message?.toLowerCase() || "";

    if (message.includes("network") || message.includes("fetch")) {
      return "network";
    }
    if (message.includes("permission") || message.includes("policy")) {
      return "permission";
    }
    if (message.includes("auth") || message.includes("unauthorized")) {
      return "authentication";
    }
    if (message.includes("postgres") || message.includes("sql")) {
      return "database";
    }
    if (message.includes("rate limit") || message.includes("quota")) {
      return "rate_limit";
    }

    return "unknown";
  };

  getErrorMessage = () => {
    const { error } = this.state;
    if (!error) return "Something went wrong";

    const errorType = this.categorizeError(error);

    switch (errorType) {
      case "network":
        return "Network connection issue. Please check your internet connection and try again.";
      case "permission":
        return "You don't have permission to perform this action. Please try logging out and back in.";
      case "authentication":
        return "Authentication error. Please sign in again to continue.";
      case "database":
        return "Database connection issue. Please try again in a moment.";
      case "rate_limit":
        return "Too many requests. Please wait a moment before trying again.";
      default:
        return "An unexpected error occurred. Please refresh the page and try again.";
    }
  };

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const errorMessage = this.getErrorMessage();
      const isSupabaseError = this.isSupabaseError(this.state.error);

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="text-center">
              {/* Error Icon */}
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                <svg
                  className="h-6 w-6 text-red-600 dark:text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>

              {/* Error Title */}
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Oops! Something went wrong
              </h3>

              {/* Error Message */}
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                {errorMessage}
              </p>

              {/* Error Details in Development */}
              {process.env.NODE_ENV === "development" && (
                <details className="mb-6 text-left">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    🔧 Debug Information
                  </summary>
                  <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-xs">
                    <p className="font-semibold text-red-600 dark:text-red-400 mb-2">
                      {this.state.error?.message}
                    </p>
                    {isSupabaseError && (
                      <p className="text-blue-600 dark:text-blue-400 mb-2">
                        🔍 This appears to be a Supabase-related error
                      </p>
                    )}
                    <pre className="whitespace-pre-wrap break-all text-gray-600 dark:text-gray-300">
                      {this.state.error?.stack}
                    </pre>
                  </div>
                </details>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={this.handleRetry}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                >
                  Try Again
                </button>
                <button
                  onClick={this.handleReload}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                >
                  Reload Page
                </button>
              </div>

              {/* Help Text */}
              <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                If this problem persists, please contact support or try
                refreshing the page.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default SupabaseErrorBoundary;
