'use client';

import dynamic from 'next/dynamic';

// Dynamically import SignIn component with SSR disabled
const SignIn = dynamic(
  () => import('@clerk/nextjs').then((mod) => ({ default: mod.SignIn })),
  { 
    ssr: false,
    loading: () => (
      <div className="space-y-6">
        <div className="text-center">
          <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto animate-pulse"></div>
        </div>
        
        <div className="space-y-4">
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>
        
        <div className="text-center">
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto animate-pulse"></div>
        </div>
      </div>
    )
  }
);

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="flex min-h-screen">
        <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back
              </h1>
              <p className="text-gray-600">
                Sign in to your account to continue
              </p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <SignIn 
                appearance={{
                  elements: {
                    card: "shadow-none bg-transparent",
                    headerTitle: "text-2xl font-bold text-gray-900",
                    headerSubtitle: "text-gray-600",
                    socialButtonsBlockButton: "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50",
                    formFieldInput: "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500",
                    formButtonPrimary: "bg-indigo-600 hover:bg-indigo-700 text-white",
                    footerActionLink: "text-indigo-600 hover:text-indigo-500"
                  }
                }}
                redirectUrl="/dashboard"
                signUpUrl="/sign-up"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}