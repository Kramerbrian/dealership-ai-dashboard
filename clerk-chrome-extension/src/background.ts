import { createClerkClient } from '@clerk/chrome-extension/background'

const publishableKey = process.env.PLASMO_PUBLIC_CLERK_PUBLISHABLE_KEY

if (!publishableKey) {
  throw new Error('Please add the PLASMO_PUBLIC_CLERK_PUBLISHABLE_KEY to the .env.development file')
}

// Use `createClerkClient()` to create a new Clerk instance
// and use `getToken()` to get a fresh token for the user
async function getToken() {
  const clerk = await createClerkClient({
    publishableKey,
  })

  // If there is no valid session, then return null. Otherwise proceed.
  if (!clerk.session) {
    return null
  }

  // Return the user's session
  return await clerk.session?.getToken()
}

// Background script for DealershipAI Chrome Extension

// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('DealershipAI Extension installed!')
    
    // Set up default storage
    chrome.storage.sync.set({
      aiScore: 0,
      lastAnalyzed: null,
      quickWins: [],
      userPreferences: {
        showBadge: true,
        autoAnalyze: true,
        notifications: true
      }
    })
  }
})

// Listen for messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request)
  
  switch (request.action) {
    case 'analyzePage':
      handlePageAnalysis(request.data, sender.tab)
      break
      
    case 'openPopup':
      // Open extension popup
      chrome.action.openPopup()
      break
      
    case 'getAIScore':
      getAIScore(sender.tab?.url).then(sendResponse)
      return true // Keep message channel open for async response
      
    case 'updateScore':
      updateAIScore(request.score, request.url)
      break
      
    case 'getAuthToken':
      // Handle authentication token requests
      getToken()
        .then((token) => sendResponse({ token }))
        .catch((error) => {
          console.error('[Background service worker] Error:', JSON.stringify(error))
          sendResponse({ token: null })
        })
      return true // REQUIRED: Indicates that the listener responds asynchronously.
      
    case 'analyzeWithAPI':
      // Analyze page using DealershipAI API
      analyzeWithAPI(request.data, sender.tab)
        .then((result) => sendResponse(result))
        .catch((error) => {
          console.error('API analysis failed:', error)
          sendResponse({ error: error.message })
        })
      return true
      
    default:
      console.log('Unknown action:', request.action)
  }
})

// Handle page analysis with DealershipAI API
async function analyzeWithAPI(data: any, tab: chrome.tabs.Tab) {
  try {
    // Get authentication token
    const token = await getToken()
    if (!token) {
      throw new Error('User not authenticated')
    }

    // Call DealershipAI API
    const response = await fetch('https://api.dealershipai.com/analyze', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        domain: new URL(tab?.url || '').hostname,
        pageData: data
      })
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    const result = await response.json()
    
    // Store results locally
    await chrome.storage.sync.set({
      aiScore: result.scores?.overall || 0,
      lastAnalyzed: new Date().toISOString(),
      currentUrl: tab?.url,
      apiResults: result
    })
    
    return result
  } catch (error) {
    console.error('API analysis error:', error)
    throw error
  }
}

// Handle page analysis
async function handlePageAnalysis(data: any, tab: chrome.tabs.Tab) {
  try {
    // Try API first, fallback to simulation
    try {
      const result = await analyzeWithAPI(data, tab)
      console.log('Page analyzed via API, AI Score:', result.scores?.overall)
      return
    } catch (apiError) {
      console.log('API analysis failed, using simulation:', apiError)
    }

    // Fallback to simulation
    const aiScore = await simulateAIAnalysis(data)
    
    // Store results
    await chrome.storage.sync.set({
      aiScore,
      lastAnalyzed: new Date().toISOString(),
      currentUrl: tab?.url
    })
    
    // Send score to content script
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, {
        action: 'updateScore',
        score: aiScore
      })
    }
    
    console.log('Page analyzed (simulation), AI Score:', aiScore)
  } catch (error) {
    console.error('Analysis failed:', error)
  }
}

// Simulate AI analysis (replace with real API call)
async function simulateAIAnalysis(data: any): Promise<number> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  let score = 50 // Base score
  
  // Add points based on page analysis
  if (data.hasSchema) score += 15
  if (data.hasMetaDescription) score += 10
  if (data.hasOpenGraph) score += 8
  if (data.hasTwitterCard) score += 5
  if (data.hasStructuredData) score += 12
  
  // Add points for content quality
  if (data.images > 5) score += 5
  if (data.links > 10) score += 3
  if (data.headings > 3) score += 7
  
  // Add some randomness
  score += Math.floor(Math.random() * 20) - 10
  
  return Math.max(0, Math.min(100, score))
}

// Get AI score for a URL
async function getAIScore(url: string): Promise<number> {
  const result = await chrome.storage.sync.get(['aiScore', 'currentUrl'])
  
  if (result.currentUrl === url) {
    return result.aiScore || 0
  }
  
  return 0
}

// Update AI score
async function updateAIScore(score: number, url: string) {
  await chrome.storage.sync.set({
    aiScore: score,
    currentUrl: url,
    lastAnalyzed: new Date().toISOString()
  })
}

// Listen for tab updates to auto-analyze
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Check if it's a dealership site
    const isDealership = isDealershipSite(tab.url)
    
    if (isDealership) {
      // Auto-analyze dealership sites
      chrome.tabs.sendMessage(tabId, {
        action: 'autoAnalyze'
      }).catch(() => {
        // Content script not ready yet
        setTimeout(() => {
          chrome.tabs.sendMessage(tabId, {
            action: 'autoAnalyze'
          }).catch(() => {
            // Ignore if content script not available
          })
        }, 1000)
      })
    }
  }
})

// Check if URL is a dealership site
function isDealershipSite(url: string): boolean {
  const dealershipKeywords = [
    'dealership', 'auto', 'car', 'vehicle', 'motors',
    'honda', 'toyota', 'ford', 'chevrolet', 'bmw',
    'mercedes', 'audi', 'nissan', 'hyundai', 'kia',
    'mazda', 'subaru', 'volkswagen', 'acura', 'lexus'
  ]
  
  try {
    const domain = new URL(url).hostname.toLowerCase()
    return dealershipKeywords.some(keyword => domain.includes(keyword))
  } catch {
    return false
  }
}

// Set up context menu
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'analyzeWithAI',
    title: 'Analyze with DealershipAI',
    contexts: ['page']
  })
})

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'analyzeWithAI' && tab?.id) {
    chrome.tabs.sendMessage(tab.id, {
      action: 'analyzePage'
    })
  }
})

// Set up badge
chrome.action.setBadgeText({ text: 'AI' })
chrome.action.setBadgeBackgroundColor({ color: '#3b82f6' })

console.log('DealershipAI Background Script Loaded!')