/**
 * Server-Timing utility for performance monitoring
 * Helps track API response times and identify bottlenecks
 */

export class ServerTiming {
  private timings: Map<string, number> = new Map()
  private startTimes: Map<string, number> = new Map()

  /**
   * Start timing a named operation
   */
  start(name: string): void {
    this.startTimes.set(name, performance.now())
  }

  /**
   * End timing and record the duration
   */
  end(name: string): number {
    const startTime = this.startTimes.get(name)
    if (!startTime) {
      console.warn(`ServerTiming: No start time found for "${name}"`)
      return 0
    }

    const duration = performance.now() - startTime
    this.timings.set(name, duration)
    this.startTimes.delete(name)
    return duration
  }

  /**
   * Add a timing directly (useful for external measurements)
   */
  add(name: string, duration: number): void {
    this.timings.set(name, duration)
  }

  /**
   * Get the Server-Timing header value
   */
  getHeaderValue(): string {
    const entries = Array.from(this.timings.entries())
      .map(([name, duration]) => `${name};dur=${duration.toFixed(1)}`)
      .join(', ')
    
    return entries
  }

  /**
   * Add Server-Timing headers to a Response
   */
  addToResponse(response: Response): Response {
    const headerValue = this.getHeaderValue()
    if (headerValue) {
      response.headers.set('Server-Timing', headerValue)
    }
    return response
  }

  /**
   * Get all timings as an object (useful for logging)
   */
  getTimings(): Record<string, number> {
    return Object.fromEntries(this.timings.entries())
  }

  /**
   * Clear all timings
   */
  clear(): void {
    this.timings.clear()
    this.startTimes.clear()
  }
}

/**
 * Middleware helper that automatically tracks request duration
 */
export function withServerTiming(
  handler: (req: Request) => Promise<Response>
) {
  return async (req: Request): Promise<Response> => {
    const timing = new ServerTiming()
    timing.start('total')

    try {
      const response = await handler(req)
      timing.end('total')
      return timing.addToResponse(response)
    } catch (error) {
      timing.end('total')
      const errorResponse = new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
      return timing.addToResponse(errorResponse)
    }
  }
}

/**
 * Decorator for tracking function execution time
 */
export function trackTiming(timing: ServerTiming, name: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      timing.start(name)
      try {
        const result = await originalMethod.apply(this, args)
        timing.end(name)
        return result
      } catch (error) {
        timing.end(name)
        throw error
      }
    }

    return descriptor
  }
}
