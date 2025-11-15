'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import TronAcknowledgment from '@/components/cognitive/TronAcknowledgment'
import OrchestratorReadyState from '@/components/cognitive/OrchestratorReadyState'
import PulseAssimilation from '@/components/cognitive/PulseAssimilation'
import SystemOnlineOverlay from '@/components/cognitive/SystemOnlineOverlay'
import { useBrandHue } from '@/lib/hooks/useBrandHue'

type CinematicPhase =
  | 'tron'
  | 'ready'
  | 'assimilation'
  | 'online'
  | 'dashboard'
  | 'error'

export default function OrchestratorPreview() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [phase, setPhase] = useState<CinematicPhase>('tron')
  const [pulses, setPulses] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [canSkip, setCanSkip] = useState(false)

  // Get domain from user metadata or session
  const domain =
    (user?.publicMetadata?.website_url as string) ||
    (user?.publicMetadata?.dealershipUrl as string) ||
    (typeof window !== 'undefined' ? sessionStorage.getItem('dai:domain') : null) || undefined

  const hue = useBrandHue(domain as string | undefined)

  // Enable skip after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => setCanSkip(true), 2000)
    return () => clearTimeout(timer)
  }, [])

  // Fetch pulses for assimilation
  useEffect(() => {
    if (phase === 'ready') {
      const fetchPulses = async () => {
        try {
          setLoading(true)
          setError(null)
          const url = new URL('/api/pulse/snapshot', window.location.origin)
          if (domain) url.searchParams.set('domain', domain)

          const response = await fetch(url.toString(), {
            cache: 'no-store',
            credentials: 'include',
          })

          if (!response.ok) {
            throw new Error(`Failed to fetch pulses: ${response.statusText}`)
          }

          const data = await response.json()
          if (!data.ok) {
            throw new Error(data.error || 'Failed to fetch pulse snapshot')
          }

          const pulseData = data?.snapshot?.pulses || []
          setPulses(pulseData.slice(0, 5)) // Limit to 5 for cinematic effect
        } catch (error: any) {
          console.error('Failed to fetch pulses:', error)
          setError(error.message || 'Failed to load pulse data')
          // Continue with empty pulses - don't block the flow
          setPulses([])
        } finally {
          setLoading(false)
        }
      }

      fetchPulses()
    }
  }, [phase, domain])

  // Handle skip to dashboard
  const handleSkip = () => {
    router.push('/dashboard')
  }

  const handleTronComplete = () => {
    setPhase('ready')
  }

  const handleReadyComplete = () => {
    setPhase('assimilation')
  }

  const handleAssimilationComplete = () => {
    setPhase('online')
  }

  const handleOnlineDismiss = () => {
    setPhase('dashboard')
    // Redirect to main dashboard after a brief moment
    setTimeout(() => {
      router.push('/dashboard')
    }, 500)
  }

  // Show loading state while Clerk loads
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="text-white/60 font-mono">Loading...</div>
        </div>
      </div>
    )
  }

  // Render current phase
  switch (phase) {
    case 'error':
      return (
        <div className="min-h-screen flex items-center justify-center bg-black p-6">
          <div className="max-w-md w-full text-center">
            <div className="text-red-400 font-mono mb-4">SYSTEM ERROR</div>
            <div className="text-white/60 font-mono text-sm mb-6">{error || 'An unexpected error occurred'}</div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  setPhase('tron')
                  setError(null)
                }}
                className="px-6 py-3 border border-white/20 rounded-lg font-mono text-white hover:bg-white/10 transition-colors"
              >
                RETRY
              </button>
              <button
                onClick={handleSkip}
                className="px-6 py-3 bg-white/10 border border-white/20 rounded-lg font-mono text-white hover:bg-white/20 transition-colors"
              >
                SKIP TO DASHBOARD
              </button>
            </div>
          </div>
        </div>
      )
    case 'tron':
      return (
        <>
          <TronAcknowledgment
            domain={domain}
            onComplete={handleTronComplete}
            duration={3000}
            onSkip={canSkip ? handleSkip : undefined}
          />
          {canSkip && (
            <button
              onClick={handleSkip}
              className="fixed top-4 right-4 z-50 px-4 py-2 bg-black/50 border border-white/20 rounded-lg font-mono text-xs text-white/60 hover:text-white hover:bg-black/70 transition-colors backdrop-blur-sm"
            >
              SKIP
            </button>
          )}
        </>
      )

    case 'ready':
      return (
        <>
          <OrchestratorReadyState
            domain={domain}
            onReady={handleReadyComplete}
            onSkip={canSkip ? handleSkip : undefined}
          />
          {canSkip && (
            <button
              onClick={handleSkip}
              className="fixed top-4 right-4 z-50 px-4 py-2 bg-black/50 border border-white/20 rounded-lg font-mono text-xs text-white/60 hover:text-white hover:bg-black/70 transition-colors backdrop-blur-sm"
            >
              SKIP
            </button>
          )}
        </>
      )

    case 'assimilation':
      return (
        <>
          <PulseAssimilation
            domain={domain}
            pulses={pulses}
            onComplete={handleAssimilationComplete}
            loading={loading}
            error={error}
            onSkip={canSkip ? handleSkip : undefined}
          />
          {canSkip && (
            <button
              onClick={handleSkip}
              className="fixed top-4 right-4 z-50 px-4 py-2 bg-black/50 border border-white/20 rounded-lg font-mono text-xs text-white/60 hover:text-white hover:bg-black/70 transition-colors backdrop-blur-sm"
            >
              SKIP
            </button>
          )}
        </>
      )

    case 'online':
      return (
        <SystemOnlineOverlay
          domain={domain}
          onDismiss={handleOnlineDismiss}
        />
      )

    case 'dashboard':
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-mono mb-4">Redirecting...</div>
          </div>
        </div>
      )

    default:
      return null
  }
}

