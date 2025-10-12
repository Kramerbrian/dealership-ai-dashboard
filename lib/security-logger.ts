/**
 * Security Logger - Mock implementation for deployment
 */

export class SecurityLogger {
  static async logAuthAttempt(userId: string, success: boolean, ip?: string) {
    console.log(`Auth attempt: ${userId}, success: ${success}, ip: ${ip}`);
  }

  static async logApiAccess(endpoint: string, userId: string, tier: string) {
    console.log(`API access: ${endpoint}, user: ${userId}, tier: ${tier}`);
  }

  static async logSecurityEvent(event: string, details: any) {
    console.log(`Security event: ${event}`, details);
  }

  static async logError(error: Error, context: string) {
    console.error(`Error in ${context}:`, error);
  }
}
