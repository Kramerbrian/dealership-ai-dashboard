import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import DealershipAIDashboard from '../DealershipAIDashboard'

export default function Dashboard() {
  const { isSignedIn, isLoaded } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in')
    }
  }, [isLoaded, isSignedIn, router])

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg mx-auto mb-4 animate-pulse" />
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return <DealershipAIDashboard />
}