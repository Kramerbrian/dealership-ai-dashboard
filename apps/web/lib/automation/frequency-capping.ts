/**
 * Frequency Capping System - Smart Notification Throttling
 * Prevent spam while maintaining engagement
 */

interface FrequencyRule {
  type: string
  maxPerDay: number
  maxPerWeek: number
  maxPerMonth: number
  priority: 'critical' | 'high' | 'medium' | 'low'
  cooldownHours: number
}

interface NotificationEvent {
  id: string
  userId: string
  type: string
  content: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  timestamp: Date
  sent: boolean
}

export class FrequencyCapping {
  private rules: Map<string, FrequencyRule> = new Map()
  private sentNotifications: Map<string, NotificationEvent[]> = new Map()
  private readonly COOLDOWN_BUFFER = 2 // 2 hours buffer

  constructor() {
    this.initializeRules()
  }

  /**
   * Initialize frequency capping rules
   */
  private initializeRules(): void {
    this.rules.set('competitor_alert', {
      type: 'competitor_alert',
      maxPerDay: 999, // No cap for critical alerts
      maxPerWeek: 999,
      maxPerMonth: 999,
      priority: 'critical',
      cooldownHours: 0
    })

    this.rules.set('quick_wins', {
      type: 'quick_wins',
      maxPerDay: 1, // Once per day
      maxPerWeek: 7,
      maxPerMonth: 30,
      priority: 'high',
      cooldownHours: 24
    })

    this.rules.set('milestones', {
      type: 'milestones',
      maxPerDay: 1,
      maxPerWeek: 1, // Once per week
      maxPerMonth: 4,
      priority: 'medium',
      cooldownHours: 168 // 1 week
    })

    this.rules.set('marketing', {
      type: 'marketing',
      maxPerDay: 0,
      maxPerWeek: 2, // Twice per week
      maxPerMonth: 8,
      priority: 'low',
      cooldownHours: 84 // 3.5 days
    })

    this.rules.set('renewal', {
      type: 'renewal',
      maxPerDay: 0,
      maxPerWeek: 0,
      maxPerMonth: 1, // Once per month
      priority: 'high',
      cooldownHours: 720 // 30 days
    })
  }

  /**
   * Check if notification can be sent based on frequency rules
   */
  canSendNotification(userId: string, type: string): {
    allowed: boolean
    reason?: string
    nextAllowedAt?: Date
  } {
    const rule = this.rules.get(type)
    if (!rule) {
      return { allowed: false, reason: 'Unknown notification type' }
    }

    const userNotifications = this.sentNotifications.get(userId) || []
    const now = new Date()

    // Check daily limit
    const todayNotifications = userNotifications.filter(n => 
      n.type === type && 
      this.isSameDay(n.timestamp, now)
    )
    if (todayNotifications.length >= rule.maxPerDay) {
      const nextDay = new Date(now)
      nextDay.setDate(nextDay.getDate() + 1)
      nextDay.setHours(0, 0, 0, 0)
      return { 
        allowed: false, 
        reason: 'Daily limit reached',
        nextAllowedAt: nextDay
      }
    }

    // Check weekly limit
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const weekNotifications = userNotifications.filter(n => 
      n.type === type && 
      n.timestamp >= weekAgo
    )
    if (weekNotifications.length >= rule.maxPerWeek) {
      const nextWeek = new Date(weekAgo.getTime() + 7 * 24 * 60 * 60 * 1000)
      return { 
        allowed: false, 
        reason: 'Weekly limit reached',
        nextAllowedAt: nextWeek
      }
    }

    // Check monthly limit
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const monthNotifications = userNotifications.filter(n => 
      n.type === type && 
      n.timestamp >= monthAgo
    )
    if (monthNotifications.length >= rule.maxPerMonth) {
      const nextMonth = new Date(monthAgo.getTime() + 30 * 24 * 60 * 60 * 1000)
      return { 
        allowed: false, 
        reason: 'Monthly limit reached',
        nextAllowedAt: nextMonth
      }
    }

    // Check cooldown period
    const lastNotification = userNotifications
      .filter(n => n.type === type)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0]

    if (lastNotification) {
      const timeSinceLastNotification = now.getTime() - lastNotification.timestamp.getTime()
      const cooldownMs = rule.cooldownHours * 60 * 60 * 1000

      if (timeSinceLastNotification < cooldownMs) {
        const nextAllowedAt = new Date(lastNotification.timestamp.getTime() + cooldownMs)
        return { 
          allowed: false, 
          reason: 'Cooldown period active',
          nextAllowedAt
        }
      }
    }

    return { allowed: true }
  }

  /**
   * Record a sent notification
   */
  recordNotification(userId: string, notification: NotificationEvent): void {
    if (!this.sentNotifications.has(userId)) {
      this.sentNotifications.set(userId, [])
    }
    
    this.sentNotifications.get(userId)!.push(notification)
    
    // Clean up old notifications (older than 30 days)
    this.cleanupOldNotifications(userId)
  }

  /**
   * Get user notification history
   */
  getUserNotificationHistory(userId: string, type?: string): NotificationEvent[] {
    const userNotifications = this.sentNotifications.get(userId) || []
    
    if (type) {
      return userNotifications.filter(n => n.type === type)
    }
    
    return userNotifications
  }

  /**
   * Get frequency statistics
   */
  getFrequencyStats(userId: string): {
    totalNotifications: number
    byType: Record<string, number>
    averagePerDay: number
    mostActiveType: string
  } {
    const userNotifications = this.sentNotifications.get(userId) || []
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    const recentNotifications = userNotifications.filter(n => n.timestamp >= thirtyDaysAgo)
    
    const byType: Record<string, number> = {}
    let mostActiveType = ''
    let maxCount = 0
    
    recentNotifications.forEach(notification => {
      byType[notification.type] = (byType[notification.type] || 0) + 1
      
      if (byType[notification.type] > maxCount) {
        maxCount = byType[notification.type]
        mostActiveType = notification.type
      }
    })
    
    return {
      totalNotifications: recentNotifications.length,
      byType,
      averagePerDay: recentNotifications.length / 30,
      mostActiveType
    }
  }

  /**
   * Check if two dates are the same day
   */
  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate()
  }

  /**
   * Clean up old notifications
   */
  private cleanupOldNotifications(userId: string): void {
    const userNotifications = this.sentNotifications.get(userId)
    if (!userNotifications) return

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const filtered = userNotifications.filter(n => n.timestamp >= thirtyDaysAgo)
    
    this.sentNotifications.set(userId, filtered)
  }

  /**
   * Update frequency rules
   */
  updateRule(type: string, newRule: Partial<FrequencyRule>): void {
    const existingRule = this.rules.get(type)
    if (existingRule) {
      this.rules.set(type, { ...existingRule, ...newRule })
    }
  }

  /**
   * Get all frequency rules
   */
  getAllRules(): Map<string, FrequencyRule> {
    return new Map(this.rules)
  }
}

// Example usage:
// const frequencyCapping = new FrequencyCapping()
// 
// // Check if we can send a quick wins notification
// const canSend = frequencyCapping.canSendNotification('user123', 'quick_wins')
// if (canSend.allowed) {
//   // Send notification
//   frequencyCapping.recordNotification('user123', {
//     id: 'notif-1',
//     userId: 'user123',
//     type: 'quick_wins',
//     content: 'Quick win: Fix your schema markup',
//     priority: 'high',
//     timestamp: new Date(),
//     sent: true
//   })
// } else {
//   console.log(`Cannot send: ${canSend.reason}`)
//   console.log(`Next allowed at: ${canSend.nextAllowedAt}`)
// }
