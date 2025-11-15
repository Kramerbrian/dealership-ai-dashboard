/**
 * Coach Policies - Cooldown and Rate Limiting
 * 
 * Prevents Coach from becoming annoying (Clippy syndrome)
 */

interface UserActivity {
  userId: string;
  persona: string;
  lastCoachTime: number;
  coachCountToday: number;
  lastResetDate: string; // YYYY-MM-DD
}

// In-memory cache (in production, use Redis or database)
const activityCache = new Map<string, UserActivity>();

const COOLDOWN_MINUTES = 5; // Max 1 popup per 5 minutes
const MAX_PER_DAY = 3; // Max 3 coach popups per day per persona
const MAX_PER_DAY_CRITICAL = 5; // Critical can bypass slightly

/**
 * Check if user is in cooldown period
 */
export function checkCooldown(
  userId: string,
  persona: string
): { allowed: boolean; recentActivity: number } {
  const key = `${userId}:${persona}`;
  const now = Date.now();
  const today = new Date().toISOString().split("T")[0];

  let activity = activityCache.get(key);

  // Reset daily counter if needed
  if (!activity || activity.lastResetDate !== today) {
    activity = {
      userId,
      persona,
      lastCoachTime: 0,
      coachCountToday: 0,
      lastResetDate: today,
    };
    activityCache.set(key, activity);
  }

  // Check cooldown (time-based)
  const minutesSinceLastCoach = (now - activity.lastCoachTime) / (1000 * 60);
  if (minutesSinceLastCoach < COOLDOWN_MINUTES) {
    return {
      allowed: false,
      recentActivity: activity.coachCountToday,
    };
  }

  // Check daily limit
  if (activity.coachCountToday >= MAX_PER_DAY) {
    return {
      allowed: false,
      recentActivity: activity.coachCountToday,
    };
  }

  return {
    allowed: true,
    recentActivity: activity.coachCountToday,
  };
}

/**
 * Record that Coach was shown to user
 */
export function recordCoachActivity(
  userId: string,
  persona: string,
  suggestionId: string
): void {
  const key = `${userId}:${persona}`;
  const today = new Date().toISOString().split("T")[0];

  let activity = activityCache.get(key);
  if (!activity || activity.lastResetDate !== today) {
    activity = {
      userId,
      persona,
      lastCoachTime: 0,
      coachCountToday: 0,
      lastResetDate: today,
    };
  }

  activity.lastCoachTime = Date.now();
  activity.coachCountToday += 1;
  activityCache.set(key, activity);
}

/**
 * Clear cooldown (for testing or admin override)
 */
export function clearCooldown(userId: string, persona: string): void {
  const key = `${userId}:${persona}`;
  activityCache.delete(key);
}

