/**
 * DealershipAI v2.0 - User Registration API
 * Handles new user registration and account creation
 */

import { NextRequest, NextResponse } from 'next/server';
import { SecurityLogger } from '@/lib/security-logger';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, dealershipName, dealershipDomain } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      await SecurityLogger.logAuthEvent('unknown', 'register', {
        email,
        success: false,
        reason: 'user_already_exists'
      });

      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 409 }
      );
    }

    // Create new user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        plan: 'FREE' // Start with free tier
      }
    });

    // Create dealership if provided
    let dealership = null;
    if (dealershipName && dealershipDomain) {
      // Check if dealership domain already exists
      const existingDealership = await prisma.dealership.findUnique({
        where: { domain: dealershipDomain }
      });

      if (existingDealership) {
        // Update the user to be associated with existing dealership
        await prisma.dealership.update({
          where: { id: existingDealership.id },
          data: { userId: user.id }
        });
        dealership = existingDealership;
      } else {
        // Create new dealership
        dealership = await prisma.dealership.create({
          data: {
            name: dealershipName,
            domain: dealershipDomain,
            city: 'Unknown', // Will be updated later
            state: 'Unknown',
            userId: user.id
          }
        });
      }
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

    // Log successful registration
    await SecurityLogger.logAuthEvent(user.id, 'register', {
      email,
      success: true,
      dealershipCreated: !!dealership,
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
        dealerships: dealership ? [{
          id: dealership.id,
          name: dealership.name,
          domain: dealership.domain
        }] : []
      },
      message: 'Account created successfully'
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    await SecurityLogger.logEvent({
      eventType: 'auth.error',
      actorId: 'system',
      payload: {
        endpoint: '/api/auth/register',
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