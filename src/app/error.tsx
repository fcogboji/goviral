// Directive to mark this component as a client component (runs in the browser)
"use client";

// Import useEffect hook from React for side effects
import { useEffect } from "react";
// Import AlertTriangle icon from lucide-react icon library
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

// Sanitize error message for production display
function getSafeErrorMessage(error: Error): string {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    return error.message;
  }

  // In production, only show safe, user-friendly messages
  const safePatterns = [
    /unauthorized/i,
    /forbidden/i,
    /not found/i,
    /validation/i,
  ];

  for (const pattern of safePatterns) {
    if (pattern.test(error.message)) {
      return error.message;
    }
  }

  // Generic message for production
  return 'An unexpected error occurred';
}

// Error boundary component that catches and displays errors in the app
// This is a Next.js special file that shows when an error occurs
export default function Error({
  error, // The error object that was thrown
  reset, // Function to reset the error boundary and retry rendering
}: {
  error: Error & { digest?: string }; // Error type with optional digest property
  reset: () => void; // Reset function type definition
}) {
  // useEffect hook to run side effects when error changes
  useEffect(() => {
    // Log the error (in production, would send to error tracking service)
    if (process.env.NODE_ENV === 'production') {
      // Only log minimal info in production
      console.error("Application error:", error.name, error.digest);
    } else {
      // Log full details in development
      console.error("Application error:", error);
    }
  }, [error]); // Dependency array - runs when error changes

  const safeMessage = getSafeErrorMessage(error);

  // Return the error UI
  return (
    // Full screen container with light gray background and centered content
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      {/* Error card container with max width, white background, and shadow */}
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Icon container - circular red background with alert triangle icon */}
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          {/* Alert triangle icon in red */}
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>

        {/* Main error heading */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Something went wrong!
        </h2>

        {/* Error description paragraph */}
        <p className="text-gray-600 mb-6">
          We&apos;re sorry, but something unexpected happened. Please try again or contact support if the problem persists.
        </p>

        {/* Conditional rendering - only show error message if it exists */}
        {safeMessage && (
          // Error message container with red background and border
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
            {/* Display the sanitized error message */}
            <p className="text-sm text-red-800 break-words">
              {safeMessage}
            </p>
            {error.digest && process.env.NODE_ENV === 'production' && (
              <p className="text-xs text-red-600 mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Action buttons container with flexbox layout and gap */}
        <div className="flex gap-3 justify-center">
          {/* Retry button - calls reset function to attempt recovery */}
          <button
            onClick={reset} // Reset the error boundary when clicked
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Try again
          </button>

          {/* Home button - navigates back to homepage */}
          <Link
            href="/"
            className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}