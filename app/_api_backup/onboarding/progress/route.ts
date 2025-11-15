import { NextRequest, NextResponse } from 'next/server';

interface OnboardingProgress {
  method: 'guided' | 'agent';
  currentStep: number;
  completedSteps: string[];
  integrationData: Record<string, any>;
  userPreferences: Record<string, any>;
  lastSaved: number;
  userId?: string;
  sessionId?: string;
}

// In-memory storage for demo purposes
// In production, this would be stored in a database
const progressStorage = new Map<string, OnboardingProgress>();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const method = searchParams.get('method') || undefined as any as 'guided' | 'agent';
    const userId = searchParams.get('userId') || undefined;
    const sessionId = searchParams.get('sessionId') || undefined;

    if (!method) {
      return NextResponse.json(
        { error: 'Method parameter is required' },
        { status: 400 }
      );
    }

    // Generate a unique key for this user/session
    const key = userId ? `user_${userId}_${method}` : `session_${sessionId}_${method}`;
    const progress = progressStorage.get(key);

    if (!progress) {
      return NextResponse.json(
        { error: 'No progress found' },
        { status: 404 }
      );
    }

    return NextResponse.json(progress);
  } catch (error) {
    console.error('Error fetching onboarding progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: OnboardingProgress = await request.json();
    const { method, userId, sessionId } = body;

    if (!method) {
      return NextResponse.json(
        { error: 'Method is required' },
        { status: 400 }
      );
    }

    // Generate a unique key for this user/session
    const key = userId ? `user_${userId}_${method}` : `session_${sessionId}_${method}`;
    
    // Store the progress
    progressStorage.set(key, {
      ...body,
      lastSaved: Date.now()
    });

    // In production, you would also:
    // 1. Store in database
    // 2. Send to analytics
    // 3. Update user profile
    // 4. Trigger notifications if needed

    return NextResponse.json({ 
      success: true, 
      message: 'Progress saved successfully' 
    });
  } catch (error) {
    console.error('Error saving onboarding progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { method, userId, sessionId } = body;

    if (!method) {
      return NextResponse.json(
        { error: 'Method is required' },
        { status: 400 }
      );
    }

    // Generate a unique key for this user/session
    const key = userId ? `user_${userId}_${method}` : `session_${sessionId}_${method}`;
    
    // Remove the progress
    progressStorage.delete(key);

    return NextResponse.json({ 
      success: true, 
      message: 'Progress cleared successfully' 
    });
  } catch (error) {
    console.error('Error clearing onboarding progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
