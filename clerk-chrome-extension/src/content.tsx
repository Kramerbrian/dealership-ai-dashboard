import type { PlasmoCSConfig } from "plasmo"
import { Brain, Target, TrendingUp } from "lucide-react"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: false
}

// Only run on dealership-related domains
const DEALERSHIP_DOMAINS = [
  'dealership',
  'auto',
  'car',
  'vehicle',
  'motors',
  'honda',
  'toyota',
  'ford',
  'chevrolet',
  'bmw',
  'mercedes',
  'audi',
  'nissan',
  'hyundai',
  'kia',
  'mazda',
  'subaru',
  'volkswagen',
  'acura',
  'lexus',
  'infiniti',
  'cadillac',
  'lincoln',
  'buick',
  'gmc',
  'chrysler',
  'dodge',
  'jeep',
  'ram'
]

function isDealershipSite(url: string): boolean {
  try {
    const domain = new URL(url).hostname.toLowerCase()
    return DEALERSHIP_DOMAINS.some(keyword => domain.includes(keyword))
  } catch {
    return false
  }
}

function createAIBadge() {
  const badge = document.createElement('div')
  badge.id = 'dealership-ai-badge'
  badge.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px 16px;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.2);
    ">
      <div style="display: flex; align-items: center; gap: 8px;">
        <div style="
          width: 24px;
          height: 24px;
          background: rgba(255,255,255,0.2);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          🧠
        </div>
        <div>
          <div style="font-size: 12px; opacity: 0.9;">AI Visibility Score</div>
          <div style="font-size: 18px; font-weight: 700;">87</div>
        </div>
      </div>
    </div>
  `
  
  badge.addEventListener('click', () => {
    // Open popup or show detailed analysis
    chrome.runtime.sendMessage({ action: 'openPopup' })
  })
  
  return badge
}

function createQuickWinsPanel() {
  const panel = document.createElement('div')
  panel.id = 'dealership-ai-panel'
  panel.innerHTML = `
    <div style="
      position: fixed;
      top: 80px;
      right: 20px;
      z-index: 10000;
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
      padding: 16px;
      width: 280px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      border: 1px solid rgba(0,0,0,0.1);
    ">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
        <div style="
          width: 20px;
          height: 20px;
          background: #3b82f6;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 12px;
        ">⚡</div>
        <h3 style="margin: 0; font-size: 14px; font-weight: 600; color: #1f2937;">Quick Wins</h3>
      </div>
      
      <div style="space-y: 8px;">
        <div style="
          padding: 8px 12px;
          background: #fef3c7;
          border-radius: 6px;
          border-left: 3px solid #f59e0b;
        ">
          <div style="font-size: 12px; font-weight: 500; color: #92400e;">Add Schema Markup</div>
          <div style="font-size: 11px; color: #a16207; margin-top: 2px;">+15 AI visibility points</div>
        </div>
        
        <div style="
          padding: 8px 12px;
          background: #dbeafe;
          border-radius: 6px;
          border-left: 3px solid #3b82f6;
        ">
          <div style="font-size: 12px; font-weight: 500; color: #1e40af;">Optimize Meta Tags</div>
          <div style="font-size: 11px; color: #1d4ed8; margin-top: 2px;">+8 AI visibility points</div>
        </div>
        
        <div style="
          padding: 8px 12px;
          background: #dcfce7;
          border-radius: 6px;
          border-left: 3px solid #10b981;
        ">
          <div style="font-size: 12px; font-weight: 500; color: #065f46;">Improve Page Speed</div>
          <div style="font-size: 11px; color: #047857; margin-top: 2px;">+12 AI visibility points</div>
        </div>
      </div>
      
      <button style="
        width: 100%;
        background: #3b82f6;
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 500;
        margin-top: 12px;
        cursor: pointer;
        transition: background 0.2s;
      " onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'">
        Apply Quick Fixes
      </button>
    </div>
  `
  
  return panel
}

function injectAIFeatures() {
  // Remove existing badges
  const existingBadge = document.getElementById('dealership-ai-badge')
  const existingPanel = document.getElementById('dealership-ai-panel')
  
  if (existingBadge) existingBadge.remove()
  if (existingPanel) existingPanel.remove()
  
  // Add AI badge
  const badge = createAIBadge()
  document.body.appendChild(badge)
  
  // Add quick wins panel (only if score is low)
  const panel = createQuickWinsPanel()
  document.body.appendChild(panel)
  
  // Add click handler to badge
  badge.addEventListener('click', () => {
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none'
  })
}

function analyzePage() {
  // Analyze current page for AI visibility factors
  const analysis = {
    hasSchema: document.querySelector('script[type="application/ld+json"]') !== null,
    hasMetaDescription: document.querySelector('meta[name="description"]') !== null,
    hasOpenGraph: document.querySelector('meta[property="og:title"]') !== null,
    hasTwitterCard: document.querySelector('meta[name="twitter:card"]') !== null,
    hasStructuredData: document.querySelector('[itemscope]') !== null,
    pageTitle: document.title,
    metaDescription: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
    images: document.querySelectorAll('img').length,
    links: document.querySelectorAll('a').length,
    headings: document.querySelectorAll('h1, h2, h3, h4, h5, h6').length
  }
  
  console.log('DealershipAI Analysis:', analysis)
  return analysis
}

// Main content script logic
function main() {
  const url = window.location.href
  
  if (!isDealershipSite(url)) {
    return // Don't inject on non-dealership sites
  }
  
  // Wait for page to load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(injectAIFeatures, 1000)
    })
  } else {
    setTimeout(injectAIFeatures, 1000)
  }
  
  // Analyze page
  setTimeout(analyzePage, 2000)
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyzePage') {
    const analysis = analyzePage()
    sendResponse(analysis)
  }
})

// Initialize
main()