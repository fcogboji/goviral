import Link from "next/link";
import { Ban } from "lucide-react";

export default function BlockedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <Ban className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Account Blocked</h1>
        <p className="text-gray-600 mb-6">
          Your account has been suspended. If you believe this is an error, please contact our support team.
        </p>
        <Link
          href="/support"
          className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Contact Support
        </Link>
        <p className="mt-6 text-sm text-gray-500">
          <Link href="/" className="text-blue-600 hover:underline">
            Return to home
          </Link>
        </p>
      </div>
    </div>
  );
}
