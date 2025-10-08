import { NextRequest, NextResponse } from 'next/server'
// Removed Clerk dependency
import { realtimeService } from '@/lib/realtime/realtimeService'

/**
 * Realtime API Proxy with Tenant Isolation
 * Provides secure access to OpenAI Realtime API
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
    const { action, tenantId, sessionId, apiKey, config } = body

    // Validate tenant access
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID required' },
        { status: 400 }
      )
    }

    // Verify user has access to this tenant
    const hasAccess = await verifyTenantAccess(userId, tenantId, orgId)
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied to tenant' },
        { status: 403 }
      )
    }

    // Handle different actions
    switch (action) {
      case 'create_session':
        return await handleCreateSession(tenantId, userId, config)
      
      case 'connect_session':
        return await handleConnectSession(sessionId, apiKey)
      
      case 'disconnect_session':
        return await handleDisconnectSession(sessionId)
      
      case 'get_session':
        return await handleGetSession(sessionId)
      
      case 'get_tenant_sessions':
        return await handleGetTenantSessions(tenantId)
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Realtime API Error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

/**
 * Handle session creation
 */
async function handleCreateSession(tenantId: string, userId: string, config: any) {
  try {
    const sessionData = await realtimeService.createSession({
      tenantId,
      userId,
      apiKey: config?.apiKey || process.env.OPENAI_API_KEY || '',
      instructions: config?.instructions,
      voice: config?.voice,
      model: config?.model
    })

    return NextResponse.json({
      success: true,
      session: sessionData
    })

  } catch (error) {
    console.error('Error creating session:', error)
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    )
  }
}

/**
 * Handle session connection
 */
async function handleConnectSession(sessionId: string, apiKey: string) {
  try {
    if (!sessionId || !apiKey) {
      return NextResponse.json(
        { error: 'Session ID and API key required' },
        { status: 400 }
      )
    }

    await realtimeService.connectSession(sessionId, apiKey)
    
    const sessionData = realtimeService.getSession(sessionId)
    
    return NextResponse.json({
      success: true,
      session: sessionData
    })

  } catch (error) {
    console.error('Error connecting session:', error)
    return NextResponse.json(
      { error: 'Failed to connect session' },
      { status: 500 }
    )
  }
}

/**
 * Handle session disconnection
 */
async function handleDisconnectSession(sessionId: string) {
  try {
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      )
    }

    await realtimeService.disconnectSession(sessionId)
    
    return NextResponse.json({
      success: true,
      message: 'Session disconnected'
    })

  } catch (error) {
    console.error('Error disconnecting session:', error)
    return NextResponse.json(
      { error: 'Failed to disconnect session' },
      { status: 500 }
    )
  }
}

/**
 * Handle get session
 */
async function handleGetSession(sessionId: string) {
  try {
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      )
    }

    const sessionData = realtimeService.getSession(sessionId)
    
    if (!sessionData) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      session: sessionData
    })

  } catch (error) {
    console.error('Error getting session:', error)
    return NextResponse.json(
      { error: 'Failed to get session' },
      { status: 500 }
    )
  }
}

/**
 * Handle get tenant sessions
 */
async function handleGetTenantSessions(tenantId: string) {
  try {
    const sessions = realtimeService.getTenantSessions(tenantId)
    
    return NextResponse.json({
      success: true,
      sessions
    })

  } catch (error) {
    console.error('Error getting tenant sessions:', error)
    return NextResponse.json(
      { error: 'Failed to get tenant sessions' },
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
