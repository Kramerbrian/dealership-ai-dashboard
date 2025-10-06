import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@clerk/nextjs'

export default function Home() {
  const router = useRouter()
  const { isSignedIn, isLoaded } = useAuth()

  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn) {
        router.push('/dashboard')
      } else {
        router.push('/sign-in')
      }
    }
  }, [isLoaded, isSignedIn, router])

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg mx-auto mb-4 animate-pulse" />
        <h1 className="text-2xl font-bold text-white">DealershipAI</h1>
        <p className="text-slate-400 mt-2">Loading...</p>
      </div>
    </div>
  )
}