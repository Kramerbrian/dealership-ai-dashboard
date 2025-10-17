import { NextRequest, NextResponse } from 'next/server';

export interface User {
  id: string;
  email: string;
  name: string;
  dealership: string;
  city: string;
  state: string;
  phone: string;
  role: string;
  tier: string;
  createdAt: string;
}

export interface AuthResult {
  user: User | null;
  isAuthenticated: boolean;
  error?: string;
}

export async function authenticateUser(request: NextRequest): Promise<AuthResult> {
  try {
    // Check for JWT token in Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { user: null, isAuthenticated: false, error: 'No authorization token provided' };
    }

    const token = authHeader.substring(7);
    
    // In a real implementation, you would verify the JWT token here
    // For now, we'll simulate authentication
    if (token === 'demo-token') {
      const user: User = {
        id: 'demo-user-123',
        email: 'demo@dealershipai.com',
        name: 'Demo User',
        dealership: 'Demo Dealership',
        city: 'Austin',
        state: 'TX',
        phone: '+1-555-0123',
        role: 'owner',
        tier: 'pro',
        createdAt: new Date().toISOString()
      };
      
      return { user, isAuthenticated: true };
    }

    return { user: null, isAuthenticated: false, error: 'Invalid token' };
  } catch (error) {
    console.error('Authentication error:', error);
    return { 
      user: null, 
      isAuthenticated: false, 
      error: 'Authentication failed' 
    };
  }
}

export function requireAuth(handler: (request: NextRequest, user: User) => Promise<Response>) {
  return async (request: NextRequest): Promise<Response> => {
    const { user, isAuthenticated, error } = await authenticateUser(request);
    
    if (!isAuthenticated || !user) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: error || 'Authentication required' 
        }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return handler(request, user);
  };
}
