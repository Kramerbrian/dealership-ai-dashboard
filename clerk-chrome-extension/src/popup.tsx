import { useState, useEffect } from "react"
import { ClerkProvider, SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/clerk-react"
import { Brain, Target, TrendingUp, Zap } from "lucide-react"

import "~style.css"

// Clerk publishable key
const CLERK_PUBLISHABLE_KEY = "pk_test_ZXhjaXRpbmctcXVhZ2dhLTY1LmNsZXJrLmFjY291bnRzLmRldiQ"

function DealershipAIPopup() {
  const { user } = useUser()
  const [currentUrl, setCurrentUrl] = useState("")
  const [aiScore, setAiScore] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Get current tab URL
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.url) {
        setCurrentUrl(tabs[0].url)
      }
    })
  }, [])

  const analyzeCurrentPage = async () => {
    setLoading(true)
    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 2000))
      setAiScore(Math.floor(Math.random() * 30) + 70) // 70-100
    } catch (error) {
      console.error("Analysis failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const getDomainFromUrl = (url: string) => {
    try {
      return new URL(url).hostname
    } catch {
      return "Invalid URL"
    }
  }

  return (
    <div className="w-80 h-96 bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-blue-600" />
          <h1 className="text-lg font-bold text-gray-900">DealershipAI</h1>
        </div>
        <UserButton />
      </div>

      <div className="space-y-4">
        {/* Current Site Info */}
        <div className="bg-white rounded-lg p-3 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Current Site</h3>
          <p className="text-xs text-gray-600 truncate">
            {getDomainFromUrl(currentUrl)}
          </p>
        </div>

        {/* AI Score Display */}
        {aiScore && (
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">AI Visibility Score</span>
              <span className="text-2xl font-bold text-blue-600">{aiScore}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${aiScore}%` }}
              />
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={analyzeCurrentPage}
            disabled={loading}
            className="flex items-center justify-center gap-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? (
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
            <span className="text-sm font-medium">
              {loading ? "Analyzing..." : "Analyze Page"}
            </span>
          </button>

          <button className="flex items-center justify-center gap-2 p-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <Target className="h-4 w-4" />
            <span className="text-sm font-medium">Competitors</span>
          </button>
        </div>

        {/* Quick Wins */}
        {aiScore && aiScore < 80 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <h4 className="text-sm font-semibold text-yellow-800 mb-2">Quick Wins Available</h4>
            <ul className="text-xs text-yellow-700 space-y-1">
              <li>• Add schema markup for vehicles</li>
              <li>• Optimize meta descriptions</li>
              <li>• Improve page loading speed</li>
            </ul>
          </div>
        )}

        {/* Upgrade Prompt */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-semibold text-purple-800">Pro Features</span>
          </div>
          <p className="text-xs text-purple-700 mb-2">
            Unlock competitive analysis, automated fixes, and real-time monitoring.
          </p>
          <button className="w-full bg-purple-600 text-white text-xs py-2 px-3 rounded hover:bg-purple-700 transition-colors">
            Upgrade to Pro
          </button>
        </div>
      </div>
    </div>
  )
}

function IndexPopup() {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <SignedIn>
        <DealershipAIPopup />
      </SignedIn>
      <SignedOut>
        <div className="w-80 h-96 bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex flex-col items-center justify-center">
          <div className="text-center mb-6">
            <Brain className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">DealershipAI</h1>
            <p className="text-sm text-gray-600">
              Analyze your dealership's AI visibility and competitive position
            </p>
          </div>
          
          <SignInButton mode="modal">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
              Sign In to Continue
            </button>
          </SignInButton>
          
          <p className="text-xs text-gray-500 mt-4 text-center">
            Get instant AI visibility scores and competitive insights
          </p>
        </div>
      </SignedOut>
    </ClerkProvider>
  )
}

export default IndexPopup