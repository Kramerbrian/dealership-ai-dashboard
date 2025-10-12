/**
 * DealershipAI v2.0 - Authentication API
 * Handles user login and JWT token generation
 */

import { NextRequest, NextResponse } from 'next/server';
import { SecurityLogger } from '@/lib/security-logger';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        dealerships: true
      }
    });

    if (!user) {
      await SecurityLogger.logAuthEvent('unknown', 'login', {
        email,
        success: false,
        reason: 'user_not_found'
      });

      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // In a real implementation, you would verify the password hash here
    // For now, we'll simulate password verification
    const isValidPassword = true; // Replace with actual password verification

    if (!isValidPassword) {
      await SecurityLogger.logAuthEvent(user.id, 'login', {
        email,
        success: false,
        reason: 'invalid_password'
      });

      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        plan: user.plan 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Log successful login
    await SecurityLogger.logAuthEvent(user.id, 'login', {
      email,
      success: true,
      userAgent: request.headers.get('user-agent'),
      ipAddress: request.ip || request.headers.get('x-forwarded-for')
    });

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        dealerships: user.dealerships.map(d => ({
          id: d.id,
          name: d.name,
          domain: d.domain
        }))
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    
    await SecurityLogger.logEvent({
      eventType: 'auth.error',
      actorId: 'system',
      payload: {
        endpoint: '/api/auth/login',
        error: error.message,
        timestamp: new Date().toISOString()
      }
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      // Get user data
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: {
          dealerships: true
        }
      });

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          plan: user.plan,
          dealerships: user.dealerships.map(d => ({
            id: d.id,
            name: d.name,
            domain: d.domain
          }))
        }
      });

    } catch (jwtError) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}