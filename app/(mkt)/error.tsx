'use client'
 
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-6">
      <div className="text-center max-w-2xl">
        <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
        <p className="text-red-400 mb-2 font-mono text-sm">{error.message}</p>
        {error.digest && (
          <p className="text-gray-500 text-xs mb-4">Error ID: {error.digest}</p>
        )}
        <button
          onClick={reset}
          className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors"
        >
          Try again
        </button>
        <div className="mt-8 text-left bg-gray-900 p-4 rounded-lg text-xs font-mono overflow-auto max-h-64">
          <pre>{error.stack}</pre>
        </div>
      </div>
    </div>
  )
}

