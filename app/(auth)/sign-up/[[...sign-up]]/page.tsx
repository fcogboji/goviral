// app/(auth)/sign-up/[[...sign-up]]/page.tsx
"use client";

import React from "react";
import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function SignUpPage() {
  const backgroundPattern = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e2e8f0' fill-opacity='0.3'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-100 relative">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{ backgroundImage: backgroundPattern }}
      ></div>
      
      <div className="flex justify-center items-center min-h-screen p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
            <p className="text-gray-600">Join us and start your journey today</p>
          </div>

          {/* Sign Up Component */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <SignUp 
              appearance={{
                elements: {
                  card: "shadow-none bg-transparent",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  socialButtonsBlockButton: "bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200",
                  socialButtonsBlockButtonText: "font-semibold",
                  dividerLine: "bg-gray-200",
                  dividerText: "text-gray-500 text-sm",
                  formFieldLabel: "text-gray-700 font-medium",
                  formFieldInput: "border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-lg px-4 py-3 transition-all duration-200",
                  formButtonPrimary: "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl",
                  footerActionLink: "text-purple-600 hover:text-purple-700 font-medium transition-colors duration-200",
                  identityPreviewText: "text-gray-700",
                  identityPreviewEditButton: "text-purple-600 hover:text-purple-700",
                }
              }}
              redirectUrl="/dashboard"
              signInUrl="/sign-in"
            />
          </div>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <Link href="/sign-in" className="text-purple-600 hover:text-purple-700 font-medium transition-colors duration-200">
                Sign in here
              </Link>
            </p>
          </div>

          {/* Terms Agreement */}
          <div className="text-center mt-6">
            <p className="text-xs text-gray-500">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="text-purple-600 hover:text-purple-700 underline">
                Terms of Service
              </Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-purple-600 hover:text-purple-700 underline">
                Privacy Policy
              </Link>
            </p>
          </div>

          {/* Additional Links */}
          <div className="flex justify-center space-x-6 mt-8">
            <Link href="/help" className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200">
              Help Center
            </Link>
            <Link href="/contact" className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200">
              Contact Us
            </Link>
            <Link href="/about" className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200">
              About Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}