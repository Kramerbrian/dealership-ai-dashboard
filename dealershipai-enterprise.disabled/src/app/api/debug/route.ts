import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Test auth
    const user = await getCurrentUser()
    
    // Test database
    const users = await db.user.findMany()
    const tenants = await db.tenant.findMany()
    
    return NextResponse.json({
      success: true,
      auth: {
        user: user ? {
          id: user.id,
          email: user.email,
          role: user.role
        } : null
      },
      database: {
        users: users.length,
        tenants: tenants.length
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
