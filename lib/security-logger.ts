/**
 * Security logging utilities
 */

export interface SecurityEvent {
  type: 'auth' | 'access' | 'violation' | 'error'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  metadata?: Record<string, any>
  timestamp?: Date
  userId?: string
  tenantId?: string
  ip?: string
  userAgent?: string
}

export class SecurityLogger {
  private events: SecurityEvent[] = []

  log(event: SecurityEvent): void {
    const fullEvent = {
      ...event,
      timestamp: event.timestamp || new Date()
    }
    
    this.events.push(fullEvent)
    
    // In production, this would send to a security monitoring service
    console.log('[SECURITY]', fullEvent)
  }

  getEvents(filter?: Partial<SecurityEvent>): SecurityEvent[] {
    if (!filter) return [...this.events]
    
    return this.events.filter(event => {
      return Object.entries(filter).every(([key, value]) => {
        return event[key as keyof SecurityEvent] === value
      })
    })
  }

  clear(): void {
    this.events = []
  }
}

export const securityLogger = new SecurityLogger()