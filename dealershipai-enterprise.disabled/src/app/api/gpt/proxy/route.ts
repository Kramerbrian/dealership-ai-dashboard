import { NextRequest, NextResponse } from 'next/server'
// Removed Clerk dependency

/**
 * GPT API Proxy with Tenant JWT Authentication
 * Provides secure access to GPT functionality with tenant isolation
 */

export async function POST(request: NextRequest) {
  try {
    // Get authentication from Clerk
    const { userId, orgId } = auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get request body
    const body = await request.json()
    const { action, parameters, tenantId } = body

    // Validate tenant access
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID required' },
        { status: 400 }
      )
    }

    // Verify user has access to this tenant
    // In a real implementation, you'd check user permissions here
    const hasAccess = await verifyTenantAccess(userId, tenantId, orgId)
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied to tenant' },
        { status: 403 }
      )
    }

    // Generate tenant JWT
    const tenantJWT = await generateTenantJWT(tenantId, userId)

    // Forward request to GPT API with tenant context
    const gptResponse = await forwardToGPT({
      action,
      parameters,
      tenantJWT,
      tenantId
    })

    // Cache response if appropriate
    if (shouldCacheResponse(action, parameters)) {
      await cacheGPTResponse(tenantId, action, parameters, gptResponse)
    }

    return NextResponse.json({
      success: true,
      data: gptResponse,
      tenantId,
      cached: false // Will be true if served from cache
    })

  } catch (error) {
    console.error('GPT Proxy Error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const tenantId = searchParams.get('tenantId')

    if (!action || !tenantId) {
      return NextResponse.json(
        { error: 'Action and tenantId required' },
        { status: 400 }
      )
    }

    // Check cache first
    const cachedResponse = await getCachedGPTResponse(tenantId, action)
    if (cachedResponse) {
      return NextResponse.json({
        success: true,
        data: cachedResponse,
        tenantId,
        cached: true
      })
    }

    return NextResponse.json(
      { error: 'No cached response found' },
      { status: 404 }
    )

  } catch (error) {
    console.error('GPT Cache GET Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Verify user has access to the specified tenant
 */
async function verifyTenantAccess(userId: string, tenantId: string, orgId?: string): Promise<boolean> {
  try {
    // In a real implementation, you'd check the database
    // For now, we'll implement a basic check
    
    // If user is in an organization, check org access
    if (orgId) {
      // Check if org has access to tenant
      return true // Simplified for demo
    }
    
    // Check individual user access to tenant
    return true // Simplified for demo
    
  } catch (error) {
    console.error('Tenant access verification error:', error)
    return false
  }
}

/**
 * Generate tenant-specific JWT
 */
async function generateTenantJWT(tenantId: string, userId: string): Promise<string> {
  try {
    // In a real implementation, you'd use a proper JWT library
    // For now, we'll create a simple token structure
    
    const payload = {
      tenantId,
      userId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour expiry
      permissions: ['read', 'write', 'gpt_access']
    }

    // In production, you'd sign this with a secret key
    const token = Buffer.from(JSON.stringify(payload)).toString('base64')
    
    return `tenant.${token}`
    
  } catch (error) {
    console.error('JWT generation error:', error)
    throw new Error('Failed to generate tenant JWT')
  }
}

/**
 * Forward request to GPT API
 */
async function forwardToGPT(request: {
  action: string
  parameters: any
  tenantJWT: string
  tenantId: string
}): Promise<any> {
  try {
    // In a real implementation, you'd call the actual GPT API
    // For now, we'll simulate a response
    
    const { action, parameters, tenantJWT, tenantId } = request
    
    // Simulate GPT processing time
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Return mock response based on action
    switch (action) {
      case 'analyze_visibility':
        return {
          visibility_score: Math.floor(Math.random() * 40) + 60, // 60-100
          recommendations: [
            'Improve page load speed',
            'Add structured data markup',
            'Optimize for featured snippets'
          ],
          confidence: 0.85
        }
      
      case 'generate_content':
        return {
          content: `Generated content for tenant ${tenantId}`,
          word_count: 500,
          readability_score: 75,
          seo_score: 80
        }
      
      case 'analyze_competitors':
        return {
          competitor_count: 5,
          market_position: 'top_3',
          opportunities: [
            'Local SEO optimization',
            'Review management',
            'Content gap analysis'
          ]
        }
      
      default:
        return {
          message: `Action ${action} completed for tenant ${tenantId}`,
          timestamp: new Date().toISOString()
        }
    }
    
  } catch (error) {
    console.error('GPT API forward error:', error)
    throw new Error('Failed to process GPT request')
  }
}

/**
 * Check if response should be cached
 */
function shouldCacheResponse(action: string, parameters: any): boolean {
  // Cache certain actions for performance
  const cacheableActions = [
    'analyze_visibility',
    'analyze_competitors',
    'generate_insights'
  ]
  
  return cacheableActions.includes(action)
}

/**
 * Cache GPT response
 */
async function cacheGPTResponse(
  tenantId: string, 
  action: string, 
  parameters: any, 
  response: any
): Promise<void> {
  try {
    // In a real implementation, you'd use Redis or similar
    // For now, we'll use a simple in-memory cache
    
    const cacheKey = `gpt:${tenantId}:${action}:${JSON.stringify(parameters)}`
    const cacheData = {
      response,
      timestamp: Date.now(),
      expiry: Date.now() + (60 * 60 * 1000) // 1 hour
    }
    
    // Store in cache (in production, use Redis)
    global.gptCache = global.gptCache || new Map()
    global.gptCache.set(cacheKey, cacheData)
    
  } catch (error) {
    console.error('Cache storage error:', error)
    // Don't throw - caching is not critical
  }
}

/**
 * Get cached GPT response
 */
async function getCachedGPTResponse(tenantId: string, action: string): Promise<any> {
  try {
    // In a real implementation, you'd check Redis
    // For now, we'll check the in-memory cache
    
    if (!global.gptCache) {
      return null
    }
    
    // Find matching cache entry
    for (const [key, data] of global.gptCache.entries()) {
      if (key.startsWith(`gpt:${tenantId}:${action}:`)) {
        // Check if not expired
        if (data.expiry > Date.now()) {
          return data.response
        } else {
          // Remove expired entry
          global.gptCache.delete(key)
        }
      }
    }
    
    return null
    
  } catch (error) {
    console.error('Cache retrieval error:', error)
    return null
  }
}
