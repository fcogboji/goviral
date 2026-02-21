// Directive to mark this component as a client component (runs in the browser)
'use client';

// Import the dynamic function from Next.js for code splitting and lazy loading
import dynamic from 'next/dynamic';

// Dynamically import the SignIn component from Clerk authentication library
// This imports the component only when needed and disables server-side rendering
const SignIn = dynamic(
  // Import function that returns the SignIn component from Clerk
  () => import('@clerk/nextjs').then((mod) => ({ default: mod.SignIn })),
  {
    // Disable server-side rendering for this component (client-only)
    ssr: false,
    // Loading component to display while the SignIn component is being loaded
    loading: () => (
      // Container div with vertical spacing between elements
      <div className="space-y-6">
        {/* Header skeleton loader section */}
        <div className="text-center">
          {/* Animated placeholder for the main title */}
          <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
          {/* Animated placeholder for the subtitle, 75% width, centered */}
          <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto animate-pulse"></div>
        </div>

        {/* Form fields skeleton loader section */}
        <div className="space-y-4">
          {/* Animated placeholder for first form input field */}
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          {/* Animated placeholder for second form input field */}
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          {/* Animated placeholder for third form input field */}
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          {/* Animated placeholder for submit button */}
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Footer skeleton loader section */}
        <div className="text-center">
          {/* Animated placeholder for footer link, 50% width, centered */}
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto animate-pulse"></div>
        </div>
      </div>
    )
  }
);

// Default export - Main Sign In Page component
export default function SignInPage() {
  // Return the JSX for the sign-in page
  return (
    // Main container with full viewport height and gradient background from indigo to cyan
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Flex container taking full screen height */}
      <div className="flex min-h-screen">
        {/* Main content area with responsive padding and centering */}
        <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
          {/* Inner container with max width constraint */}
          <div className="mx-auto w-full max-w-sm lg:w-96">
            {/* Header section with text centered and margin bottom */}
            <div className="text-center mb-8">
              {/* Main page heading */}
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back
              </h1>
              {/* Subtitle paragraph describing the page purpose */}
              <p className="text-gray-600">
                Sign in to your account to continue
              </p>
            </div>

            {/* White card container for the sign-in form */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              {/* Clerk SignIn component with custom styling */}
              <SignIn
                // Routing configuration to prevent redirect loops
                forceRedirectUrl="/dashboard"
                signUpUrl="/sign-up"
                // Custom appearance configuration for styling Clerk's UI elements
                appearance={{
                  // Element-specific CSS classes
                  elements: {
                    // Remove default card shadow and background
                    card: "shadow-none bg-transparent",
                    // Style for the header title text
                    headerTitle: "text-2xl font-bold text-gray-900",
                    // Style for the header subtitle text
                    headerSubtitle: "text-gray-600",
                    // Style for social login buttons (Google, Facebook, etc.)
                    socialButtonsBlockButton: "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50",
                    // Style for form input fields with focus states
                    formFieldInput: "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500",
                    // Style for primary action button (Sign In button)
                    formButtonPrimary: "bg-indigo-600 hover:bg-indigo-700 text-white",
                    // Style for footer links (e.g., "Forgot password?")
                    footerActionLink: "text-indigo-600 hover:text-indigo-500"
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}