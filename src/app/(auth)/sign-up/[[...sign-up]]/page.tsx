// File path comment identifying the location of this component
// app/(auth)/sign-up/[[...sign-up]]/page.tsx
// Directive to mark this component as a client component (runs in the browser)
"use client";

// Import React library for creating React components
import React from "react";
// Import the SignUp component from Clerk authentication library
import { SignUp } from "@clerk/nextjs";
// Import Link component from Next.js for client-side navigation
import Link from "next/link";

// Default export - Main Sign Up Page component
export default function SignUpPage() {
  // Define an SVG background pattern as a data URI for decorative purposes
  // Creates a plus sign pattern with 60x60 viewBox
  const backgroundPattern = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e2e8f0' fill-opacity='0.3'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

  // Return the JSX for the sign-up page
  return (
    // Main container with full viewport height, gradient background, and relative positioning
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-100 relative">
      {/* Background Pattern Layer */}
      {/* Decorative background div positioned absolutely to cover entire parent */}
      <div
        // Absolute positioning to overlay the background, 40% opacity for subtle effect
        className="absolute inset-0 opacity-40"
        // Apply the SVG pattern as background image
        style={{ backgroundImage: backgroundPattern }}
      ></div>

      {/* Main content container - flex layout to center content vertically and horizontally */}
      <div className="flex justify-center items-center min-h-screen p-4">
        {/* Inner container with max width for the form */}
        <div className="w-full max-w-md">
          {/* Header Section */}
          {/* Text-centered header section with bottom margin */}
          <div className="text-center mb-8">
            {/* Icon container - gradient circle with user-plus icon */}
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              {/* SVG icon for user registration (user with plus sign) */}
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {/* Path defining the user-plus icon shape */}
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            {/* Main heading text */}
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
            {/* Subtitle paragraph explaining the page purpose */}
            <p className="text-gray-600">Join us and start your journey today</p>
          </div>

          {/* Sign Up Component Container */}
          {/* White card with rounded corners, shadow, and padding */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            {/* Clerk SignUp component with extensive custom styling */}
            <SignUp
              // Routing configuration to prevent redirect loops
              forceRedirectUrl="/dashboard"
              signInUrl="/sign-in"
              // Custom appearance configuration for styling Clerk's UI elements
              appearance={{
                // Element-specific CSS classes to customize the look and feel
                elements: {
                  // Remove default card shadow and make background transparent
                  card: "shadow-none bg-transparent",
                  // Hide the default header title (we use our own above)
                  headerTitle: "hidden",
                  // Hide the default header subtitle
                  headerSubtitle: "hidden",
                  // Style for social login buttons (Google, Facebook, etc.) with hover effects
                  socialButtonsBlockButton: "bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200",
                  // Style for text inside social login buttons
                  socialButtonsBlockButtonText: "font-semibold",
                  // Style for the divider line between social and email signup
                  dividerLine: "bg-gray-200",
                  // Style for the divider text (typically says "OR")
                  dividerText: "text-gray-500 text-sm",
                  // Style for form field labels
                  formFieldLabel: "text-gray-700 font-medium",
                  // Style for form input fields with focus states and transitions
                  formFieldInput: "border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-lg px-4 py-3 transition-all duration-200",
                  // Style for primary action button (Create Account) with gradient and hover effects
                  formButtonPrimary: "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl",
                  // Style for footer action links (e.g., "Already have an account?")
                  footerActionLink: "text-purple-600 hover:text-purple-700 font-medium transition-colors duration-200",
                  // Style for identity preview text (email/phone verification)
                  identityPreviewText: "text-gray-700",
                  // Style for identity preview edit button
                  identityPreviewEditButton: "text-purple-600 hover:text-purple-700",
                }
              }}
            />
          </div>

          {/* Footer Section - Link to Sign In Page */}
          {/* Center-aligned text section with top margin */}
          <div className="text-center mt-6">
            {/* Small text paragraph asking if user has an account */}
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              {/* Link to sign-in page with purple color and hover effect */}
              <Link href="/sign-in" className="text-purple-600 hover:text-purple-700 font-medium transition-colors duration-200">
                Sign in here
              </Link>
            </p>
          </div>

          {/* Terms Agreement Section */}
          {/* Center-aligned legal text section with top margin */}
          <div className="text-center mt-6">
            {/* Extra small text for legal disclaimers */}
            <p className="text-xs text-gray-500">
              By creating an account, you agree to our{' '}
              {/* Link to Terms of Service page */}
              <Link href="/terms" className="text-purple-600 hover:text-purple-700 underline">
                Terms of Service
              </Link>
              {' '}and{' '}
              {/* Link to Privacy Policy page */}
              <Link href="/privacy" className="text-purple-600 hover:text-purple-700 underline">
                Privacy Policy
              </Link>
            </p>
          </div>

          {/* Additional Links Section */}
          {/* Flex container for horizontal navigation links with spacing */}
          <div className="flex justify-center space-x-6 mt-8">
            {/* Link to Help Center page */}
            <Link href="/help" className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200">
              Help Center
            </Link>
            {/* Link to Contact Us page */}
            <Link href="/contact" className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200">
              Contact Us
            </Link>
            {/* Link to About Us page */}
            <Link href="/about" className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200">
              About Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}