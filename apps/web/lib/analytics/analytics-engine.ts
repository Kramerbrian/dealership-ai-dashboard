/**
 * Advanced Analytics Engine
 * Core analytics processing and data aggregation system
 */

import { CacheManager } from '@/lib/cache'
import { CACHE_KEYS, CACHE_TTL } from '@/lib/cache'

export interface AnalyticsEvent {
  id: string
  userId: string
  eventType: string
  eventName: string
  properties: Record<string, any>
  timestamp: Date
  sessionId: string
  page: string
  userAgent: string
  ip?: string
  referrer?: string
}

export interface AnalyticsMetrics {
  totalEvents: number
  uniqueUsers: number
  uniqueSessions: number
  averageSessionDuration: number
  bounceRate: number
  conversionRate: number
  topPages: Array<{ page: string; views: number; uniqueViews: number }>
  topEvents: Array<{ eventName: string; count: number }>
  userJourney: Array<{ step: string; users: number; dropoff: number }>
  deviceBreakdown: Array<{ device: string; percentage: number }>
  trafficSources: Array<{ source: string; users: number; percentage: number }>
  geographicData: Array<{ country: string; users: number; percentage: number }>
  timeSeriesData: Array<{ date: string; events: number; users: number }>
}

export interface ReportConfig {
  dateRange: {
    start: Date
    end: Date
  }
  metrics: string[]
  dimensions: string[]
  filters?: Record<string, any>
  groupBy?: string
  limit?: number
}

export interface CustomReport {
  id: string
  name: string
  description: string
  config: ReportConfig
  userId: string
  createdAt: Date
  updatedAt: Date
  isPublic: boolean
  tags: string[]
}

export class AnalyticsEngine {
  private cache: CacheManager
  private events: AnalyticsEvent[] = []

  constructor() {
    this.cache = new CacheManager()
  }

  /**
   * Track an analytics event
   */
  async trackEvent(event: Omit<AnalyticsEvent, 'id' | 'timestamp'>): Promise<void> {
    const analyticsEvent: AnalyticsEvent = {
      ...event,
      id: this.generateId(),
      timestamp: new Date(),
    }

    // Store in memory for real-time processing
    this.events.push(analyticsEvent)

    // Store in cache for persistence
    const cacheKey = `${CACHE_KEYS.ANALYTICS_EVENTS}:${analyticsEvent.id}`
    await this.cache.set(cacheKey, analyticsEvent, CACHE_TTL.ANALYTICS_EVENTS)

    // Process real-time metrics
    await this.updateRealTimeMetrics(analyticsEvent)
  }

  /**
   * Get analytics metrics for a given time range
   */
  async getMetrics(config: ReportConfig): Promise<AnalyticsMetrics> {
    const cacheKey = `${CACHE_KEYS.ANALYTICS_METRICS}:${this.generateCacheKey(config)}`
    
    // Try to get from cache first
    const cached = await this.cache.get(cacheKey)
    if (cached) {
      return cached
    }

    // Calculate metrics
    const metrics = await this.calculateMetrics(config)
    
    // Cache the results
    await this.cache.set(cacheKey, metrics, CACHE_TTL.ANALYTICS_METRICS)
    
    return metrics
  }

  /**
   * Get real-time analytics data
   */
  async getRealTimeMetrics(): Promise<Partial<AnalyticsMetrics>> {
    const cacheKey = CACHE_KEYS.ANALYTICS_REALTIME
    const cached = await this.cache.get(cacheKey)
    
    if (cached) {
      return cached
    }

    // Calculate real-time metrics from recent events
    const recentEvents = this.events.filter(
      event => Date.now() - event.timestamp.getTime() < 5 * 60 * 1000 // Last 5 minutes
    )

    const realTimeMetrics = {
      totalEvents: recentEvents.length,
      uniqueUsers: new Set(recentEvents.map(e => e.userId)).size,
      uniqueSessions: new Set(recentEvents.map(e => e.sessionId)).size,
      topEvents: this.getTopEvents(recentEvents),
    }

    await this.cache.set(cacheKey, realTimeMetrics, 60) // 1 minute cache
    return realTimeMetrics
  }

  /**
   * Create a custom report
   */
  async createCustomReport(report: Omit<CustomReport, 'id' | 'createdAt' | 'updatedAt'>): Promise<CustomReport> {
    const customReport: CustomReport = {
      ...report,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const cacheKey = `${CACHE_KEYS.CUSTOM_REPORTS}:${customReport.id}`
    await this.cache.set(cacheKey, customReport, CACHE_TTL.CUSTOM_REPORTS)

    return customReport
  }

  /**
   * Get custom reports for a user
   */
  async getUserCustomReports(userId: string): Promise<CustomReport[]> {
    const cacheKey = `${CACHE_KEYS.USER_CUSTOM_REPORTS}:${userId}`
    const cached = await this.cache.get(cacheKey)
    
    if (cached) {
      return cached
    }

    // In a real implementation, this would query the database
    const reports: CustomReport[] = []
    await this.cache.set(cacheKey, reports, CACHE_TTL.USER_CUSTOM_REPORTS)
    
    return reports
  }

  /**
   * Generate a funnel analysis report
   */
  async generateFunnelReport(
    steps: string[],
    config: ReportConfig
  ): Promise<{
    steps: Array<{
      step: string
      users: number
      conversionRate: number
      dropoffRate: number
    }>
    overallConversion: number
  }> {
    const events = await this.getEventsInRange(config)
    
    const funnelData = steps.map((step, index) => {
      const stepEvents = events.filter(e => e.eventName === step)
      const users = new Set(stepEvents.map(e => e.userId)).size
      
      const previousStepUsers = index > 0 
        ? new Set(events.filter(e => e.eventName === steps[index - 1]).map(e => e.userId)).size
        : users

      const conversionRate = previousStepUsers > 0 ? (users / previousStepUsers) * 100 : 100
      const dropoffRate = 100 - conversionRate

      return {
        step,
        users,
        conversionRate,
        dropoffRate,
      }
    })

    const overallConversion = funnelData.length > 0 
      ? (funnelData[funnelData.length - 1].users / funnelData[0].users) * 100
      : 0

    return {
      steps: funnelData,
      overallConversion,
    }
  }

  /**
   * Generate cohort analysis
   */
  async generateCohortAnalysis(
    cohortPeriod: 'day' | 'week' | 'month',
    config: ReportConfig
  ): Promise<{
    cohorts: Array<{
      cohort: string
      size: number
      retention: number[]
    }>
  }> {
    const events = await this.getEventsInRange(config)
    const userFirstSeen = new Map<string, Date>()
    
    // Find first event for each user
    events.forEach(event => {
      const existing = userFirstSeen.get(event.userId)
      if (!existing || event.timestamp < existing) {
        userFirstSeen.set(event.userId, event.timestamp)
      }
    })

    // Group users by cohort
    const cohorts = new Map<string, Set<string>>()
    userFirstSeen.forEach((firstSeen, userId) => {
      const cohortKey = this.formatCohortKey(firstSeen, cohortPeriod)
      if (!cohorts.has(cohortKey)) {
        cohorts.set(cohortKey, new Set())
      }
      cohorts.get(cohortKey)!.add(userId)
    })

    // Calculate retention for each cohort
    const cohortData = Array.from(cohorts.entries()).map(([cohort, users]) => {
      const retention = this.calculateRetention(Array.from(users), events, cohortPeriod)
      return {
        cohort,
        size: users.size,
        retention,
      }
    })

    return { cohorts: cohortData }
  }

  /**
   * Generate predictive analytics
   */
  async generatePredictiveAnalytics(
    metric: string,
    config: ReportConfig
  ): Promise<{
    current: number
    predicted: number
    trend: 'up' | 'down' | 'stable'
    confidence: number
    forecast: Array<{ date: string; value: number }>
  }> {
    const historicalData = await this.getHistoricalData(metric, config)
    
    // Simple linear regression for prediction
    const { slope, intercept, r2 } = this.calculateLinearRegression(historicalData)
    
    const current = historicalData[historicalData.length - 1]?.value || 0
    const predicted = slope * (historicalData.length + 7) + intercept // 7 days ahead
    
    const trend = slope > 0.1 ? 'up' : slope < -0.1 ? 'down' : 'stable'
    const confidence = Math.max(0, Math.min(100, r2 * 100))

    // Generate 30-day forecast
    const forecast = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      value: slope * (historicalData.length + i + 1) + intercept,
    }))

    return {
      current,
      predicted,
      trend,
      confidence,
      forecast,
    }
  }

  // Private helper methods

  private async calculateMetrics(config: ReportConfig): Promise<AnalyticsMetrics> {
    const events = await this.getEventsInRange(config)
    
    const uniqueUsers = new Set(events.map(e => e.userId))
    const uniqueSessions = new Set(events.map(e => e.sessionId))
    
    const sessionDurations = this.calculateSessionDurations(events)
    const averageSessionDuration = sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length || 0
    
    const bounceRate = this.calculateBounceRate(events)
    const conversionRate = this.calculateConversionRate(events)
    
    const topPages = this.getTopPages(events)
    const topEvents = this.getTopEvents(events)
    const userJourney = this.getUserJourney(events)
    const deviceBreakdown = this.getDeviceBreakdown(events)
    const trafficSources = this.getTrafficSources(events)
    const geographicData = this.getGeographicData(events)
    const timeSeriesData = this.getTimeSeriesData(events, config.dateRange)

    return {
      totalEvents: events.length,
      uniqueUsers: uniqueUsers.size,
      uniqueSessions: uniqueSessions.size,
      averageSessionDuration,
      bounceRate,
      conversionRate,
      topPages,
      topEvents,
      userJourney,
      deviceBreakdown,
      trafficSources,
      geographicData,
      timeSeriesData,
    }
  }

  private async getEventsInRange(config: ReportConfig): Promise<AnalyticsEvent[]> {
    // In a real implementation, this would query the database
    // For now, return filtered events from memory
    return this.events.filter(event => {
      const eventDate = event.timestamp
      return eventDate >= config.dateRange.start && eventDate <= config.dateRange.end
    })
  }

  private async updateRealTimeMetrics(event: AnalyticsEvent): Promise<void> {
    const cacheKey = CACHE_KEYS.ANALYTICS_REALTIME
    const existing = await this.cache.get(cacheKey) || {}
    
    const updated = {
      ...existing,
      totalEvents: (existing.totalEvents || 0) + 1,
      lastEvent: event,
    }
    
    await this.cache.set(cacheKey, updated, 60)
  }

  private getTopEvents(events: AnalyticsEvent[]): Array<{ eventName: string; count: number }> {
    const eventCounts = new Map<string, number>()
    
    events.forEach(event => {
      const count = eventCounts.get(event.eventName) || 0
      eventCounts.set(event.eventName, count + 1)
    })
    
    return Array.from(eventCounts.entries())
      .map(([eventName, count]) => ({ eventName, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }

  private getTopPages(events: AnalyticsEvent[]): Array<{ page: string; views: number; uniqueViews: number }> {
    const pageViews = new Map<string, { total: number; unique: Set<string> }>()
    
    events.forEach(event => {
      if (event.eventType === 'page_view') {
        const existing = pageViews.get(event.page) || { total: 0, unique: new Set() }
        existing.total++
        existing.unique.add(event.userId)
        pageViews.set(event.page, existing)
      }
    })
    
    return Array.from(pageViews.entries())
      .map(([page, data]) => ({
        page,
        views: data.total,
        uniqueViews: data.unique.size,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)
  }

  private calculateSessionDurations(events: AnalyticsEvent[]): number[] {
    const sessionDurations = new Map<string, { start: Date; end: Date }>()
    
    events.forEach(event => {
      const existing = sessionDurations.get(event.sessionId)
      if (!existing) {
        sessionDurations.set(event.sessionId, { start: event.timestamp, end: event.timestamp })
      } else {
        if (event.timestamp < existing.start) existing.start = event.timestamp
        if (event.timestamp > existing.end) existing.end = event.timestamp
      }
    })
    
    return Array.from(sessionDurations.values())
      .map(session => session.end.getTime() - session.start.getTime())
      .filter(duration => duration > 0)
  }

  private calculateBounceRate(events: AnalyticsEvent[]): number {
    const sessions = new Map<string, number>()
    
    events.forEach(event => {
      const count = sessions.get(event.sessionId) || 0
      sessions.set(event.sessionId, count + 1)
    })
    
    const singlePageSessions = Array.from(sessions.values()).filter(count => count === 1).length
    const totalSessions = sessions.size
    
    return totalSessions > 0 ? (singlePageSessions / totalSessions) * 100 : 0
  }

  private calculateConversionRate(events: AnalyticsEvent[]): number {
    const conversionEvents = events.filter(e => e.eventName === 'conversion').length
    const totalEvents = events.length
    
    return totalEvents > 0 ? (conversionEvents / totalEvents) * 100 : 0
  }

  private getUserJourney(events: AnalyticsEvent[]): Array<{ step: string; users: number; dropoff: number }> {
    // Simplified user journey analysis
    const steps = ['landing', 'browsing', 'interest', 'consideration', 'conversion']
    const stepUsers = new Map<string, Set<string>>()
    
    steps.forEach(step => {
      stepUsers.set(step, new Set())
    })
    
    events.forEach(event => {
      if (event.eventName === 'page_view') {
        if (event.page.includes('landing')) stepUsers.get('landing')?.add(event.userId)
        if (event.page.includes('browse')) stepUsers.get('browsing')?.add(event.userId)
        if (event.page.includes('product')) stepUsers.get('interest')?.add(event.userId)
        if (event.page.includes('compare')) stepUsers.get('consideration')?.add(event.userId)
        if (event.eventName === 'conversion') stepUsers.get('conversion')?.add(event.userId)
      }
    })
    
    return steps.map((step, index) => {
      const users = stepUsers.get(step)?.size || 0
      const previousUsers = index > 0 ? stepUsers.get(steps[index - 1])?.size || 0 : users
      const dropoff = previousUsers > 0 ? ((previousUsers - users) / previousUsers) * 100 : 0
      
      return { step, users, dropoff }
    })
  }

  private getDeviceBreakdown(events: AnalyticsEvent[]): Array<{ device: string; percentage: number }> {
    const deviceCounts = new Map<string, number>()
    
    events.forEach(event => {
      const userAgent = event.userAgent.toLowerCase()
      let device = 'desktop'
      
      if (userAgent.includes('mobile')) device = 'mobile'
      else if (userAgent.includes('tablet')) device = 'tablet'
      
      const count = deviceCounts.get(device) || 0
      deviceCounts.set(device, count + 1)
    })
    
    const total = Array.from(deviceCounts.values()).reduce((a, b) => a + b, 0)
    
    return Array.from(deviceCounts.entries())
      .map(([device, count]) => ({
        device,
        percentage: total > 0 ? (count / total) * 100 : 0,
      }))
      .sort((a, b) => b.percentage - a.percentage)
  }

  private getTrafficSources(events: AnalyticsEvent[]): Array<{ source: string; users: number; percentage: number }> {
    const sourceCounts = new Map<string, Set<string>>()
    
    events.forEach(event => {
      const source = event.referrer ? this.parseReferrer(event.referrer) : 'direct'
      if (!sourceCounts.has(source)) {
        sourceCounts.set(source, new Set())
      }
      sourceCounts.get(source)!.add(event.userId)
    })
    
    const total = Array.from(sourceCounts.values()).reduce((sum, users) => sum + users.size, 0)
    
    return Array.from(sourceCounts.entries())
      .map(([source, users]) => ({
        source,
        users: users.size,
        percentage: total > 0 ? (users.size / total) * 100 : 0,
      }))
      .sort((a, b) => b.users - a.users)
  }

  private getGeographicData(events: AnalyticsEvent[]): Array<{ country: string; users: number; percentage: number }> {
    // Simplified geographic data - in real implementation, would use IP geolocation
    const countryCounts = new Map<string, Set<string>>()
    
    events.forEach(event => {
      const country = this.getCountryFromIP(event.ip) || 'Unknown'
      if (!countryCounts.has(country)) {
        countryCounts.set(country, new Set())
      }
      countryCounts.get(country)!.add(event.userId)
    })
    
    const total = Array.from(countryCounts.values()).reduce((sum, users) => sum + users.size, 0)
    
    return Array.from(countryCounts.entries())
      .map(([country, users]) => ({
        country,
        users: users.size,
        percentage: total > 0 ? (users.size / total) * 100 : 0,
      }))
      .sort((a, b) => b.users - a.users)
      .slice(0, 10)
  }

  private getTimeSeriesData(events: AnalyticsEvent[], dateRange: { start: Date; end: Date }): Array<{ date: string; events: number; users: number }> {
    const dailyData = new Map<string, { events: number; users: Set<string> }>()
    
    events.forEach(event => {
      const date = event.timestamp.toISOString().split('T')[0]
      const existing = dailyData.get(date) || { events: 0, users: new Set() }
      existing.events++
      existing.users.add(event.userId)
      dailyData.set(date, existing)
    })
    
    return Array.from(dailyData.entries())
      .map(([date, data]) => ({
        date,
        events: data.events,
        users: data.users.size,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  private parseReferrer(referrer: string): string {
    try {
      const url = new URL(referrer)
      const hostname = url.hostname.toLowerCase()
      
      if (hostname.includes('google')) return 'Google'
      if (hostname.includes('facebook')) return 'Facebook'
      if (hostname.includes('twitter')) return 'Twitter'
      if (hostname.includes('linkedin')) return 'LinkedIn'
      if (hostname.includes('youtube')) return 'YouTube'
      
      return hostname
    } catch {
      return 'direct'
    }
  }

  private getCountryFromIP(ip?: string): string | null {
    // Simplified - in real implementation, would use IP geolocation service
    if (!ip) return null
    
    // Mock country mapping based on IP patterns
    if (ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
      return 'Local'
    }
    
    return 'United States' // Default for demo
  }

  private formatCohortKey(date: Date, period: 'day' | 'week' | 'month'): string {
    switch (period) {
      case 'day':
        return date.toISOString().split('T')[0]
      case 'week':
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        return weekStart.toISOString().split('T')[0]
      case 'month':
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      default:
        return date.toISOString().split('T')[0]
    }
  }

  private calculateRetention(
    users: string[],
    events: AnalyticsEvent[],
    period: 'day' | 'week' | 'month'
  ): number[] {
    const retention = []
    const maxPeriods = period === 'day' ? 30 : period === 'week' ? 12 : 12
    
    for (let i = 0; i < maxPeriods; i++) {
      const periodStart = new Date()
      periodStart.setDate(periodStart.getDate() - (i + 1) * (period === 'day' ? 1 : period === 'week' ? 7 : 30))
      const periodEnd = new Date(periodStart)
      periodEnd.setDate(periodEnd.getDate() + (period === 'day' ? 1 : period === 'week' ? 7 : 30))
      
      const activeUsers = new Set(
        events
          .filter(e => 
            users.includes(e.userId) &&
            e.timestamp >= periodStart &&
            e.timestamp < periodEnd
          )
          .map(e => e.userId)
      )
      
      retention.push(users.length > 0 ? (activeUsers.size / users.length) * 100 : 0)
    }
    
    return retention
  }

  private async getHistoricalData(metric: string, config: ReportConfig): Promise<Array<{ date: string; value: number }>> {
    // Simplified historical data generation
    const data = []
    const start = new Date(config.dateRange.start)
    const end = new Date(config.dateRange.end)
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      data.push({
        date: d.toISOString().split('T')[0],
        value: Math.random() * 100 + 50, // Mock data
      })
    }
    
    return data
  }

  private calculateLinearRegression(data: Array<{ date: string; value: number }>): {
    slope: number
    intercept: number
    r2: number
  } {
    const n = data.length
    if (n < 2) return { slope: 0, intercept: 0, r2: 0 }
    
    const x = data.map((_, i) => i)
    const y = data.map(d => d.value)
    
    const sumX = x.reduce((a, b) => a + b, 0)
    const sumY = y.reduce((a, b) => a + b, 0)
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0)
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n
    
    // Calculate R²
    const yMean = sumY / n
    const ssRes = y.reduce((sum, yi, i) => sum + Math.pow(yi - (slope * x[i] + intercept), 2), 0)
    const ssTot = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0)
    const r2 = 1 - (ssRes / ssTot)
    
    return { slope, intercept, r2: Math.max(0, r2) }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }

  private generateCacheKey(config: ReportConfig): string {
    return `${config.dateRange.start.getTime()}-${config.dateRange.end.getTime()}-${config.metrics.join(',')}`
  }
}

export const analyticsEngine = new AnalyticsEngine()
