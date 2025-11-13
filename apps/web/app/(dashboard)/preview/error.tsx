'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PreviewError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    console.error('Preview error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-6">
      <div className="max-w-md w-full text-center">
        <div className="text-red-400 font-mono mb-4 text-2xl">SYSTEM ERROR</div>
        <div className="text-white/60 font-mono text-sm mb-2">
          {error.message || 'An unexpected error occurred in the orchestrator preview'}
        </div>
        {error.digest && (
          <div className="text-white/40 font-mono text-xs mb-6">
            Error ID: {error.digest}
          </div>
        )}
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 border border-white/20 rounded-lg font-mono text-white hover:bg-white/10 transition-colors"
          >
            RETRY
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-white/10 border border-white/20 rounded-lg font-mono text-white hover:bg-white/20 transition-colors"
          >
            GO TO DASHBOARD
          </button>
        </div>
      </div>
    </div>
  )
}

