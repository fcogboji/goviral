// File path comment identifying the location of this component
// app/loading.tsx
// Loading component displayed while page content is being loaded
// This is a Next.js special file that shows during navigation/data fetching
export default function Loading() {
  // Return the loading UI
  return (
    // Full screen container with flexbox centering and light gray background
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      {/* Center-aligned content wrapper */}
      <div className="text-center">
        {/* Spinning circle loader - animated border creates spinning effect */}
        {/* Blue border on bottom rotates to create loading animation */}
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        {/* Loading text displayed below the spinner */}
        <p className="text-gray-600">Loading GoViral...</p>
      </div>
    </div>
  )
}