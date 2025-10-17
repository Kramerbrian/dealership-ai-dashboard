import { logger, dtriLogger, apiLogger, queueLogger } from '@/lib/logger'

// Mock Logtail
jest.mock('@logtail/node', () => ({
  Logtail: jest.fn(() => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }))
}))

describe('Logger', () => {
  beforeEach(() => {
    // Clear console mocks
    jest.clearAllMocks()
  })

  describe('Basic logging', () => {
    it('logs info messages', () => {
      const consoleSpy = jest.spyOn(console, 'info').mockImplementation()
      
      logger.info('Test info message')
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[INFO]: Test info message')
      )
      
      consoleSpy.mockRestore()
    })

    it('logs error messages', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      
      logger.error('Test error message')
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR]: Test error message')
      )
      
      consoleSpy.mockRestore()
    })

    it('logs with metadata', () => {
      const consoleSpy = jest.spyOn(console, 'info').mockImplementation()
      
      logger.info('Test message', { key: 'value', number: 123 })
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Test message')
      )
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('"key":"value"')
      )
      
      consoleSpy.mockRestore()
    })
  })

  describe('DTRI Logger', () => {
    it('logs DTRI refresh completion', () => {
      const consoleSpy = jest.spyOn(console, 'info').mockImplementation()
      
      dtriLogger.refresh('test-dealer', 85.5, { events_processed: 10 })
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('DTRI refresh completed for test-dealer')
      )
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('"dealer":"test-dealer"')
      )
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('"score":85.5')
      )
      
      consoleSpy.mockRestore()
    })

    it('logs DTRI errors', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const error = new Error('Test error')
      
      dtriLogger.error('test-dealer', error, { context: 'test' })
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('DTRI refresh failed for test-dealer')
      )
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('"error":"Test error"')
      )
      
      consoleSpy.mockRestore()
    })

    it('logs queue job status', () => {
      const consoleSpy = jest.spyOn(console, 'info').mockImplementation()
      
      queueLogger.jobStarted('job-123', 'refresh', { dealer: 'test' })
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Queue job started')
      )
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('"jobId":"job-123"')
      )
      
      consoleSpy.mockRestore()
    })
  })

  describe('API Logger', () => {
    it('logs API requests', () => {
      const consoleSpy = jest.spyOn(console, 'info').mockImplementation()
      
      apiLogger.request('GET', '/api/test', 200, 150, { userAgent: 'test' })
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('API GET /api/test')
      )
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('"status":200')
      )
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('"duration":150')
      )
      
      consoleSpy.mockRestore()
    })

    it('logs API errors', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const error = new Error('API Error')
      
      apiLogger.error('POST', '/api/test', error, { userId: '123' })
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('API POST /api/test failed')
      )
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('"error":"API Error"')
      )
      
      consoleSpy.mockRestore()
    })
  })

  describe('Queue Logger', () => {
    it('logs job completion', () => {
      const consoleSpy = jest.spyOn(console, 'info').mockImplementation()
      
      queueLogger.jobCompleted('job-123', 'refresh', 5000, { result: 'success' })
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Queue job completed')
      )
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('"duration":5000')
      )
      
      consoleSpy.mockRestore()
    })

    it('logs job failures', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const error = new Error('Job failed')
      
      queueLogger.jobFailed('job-123', 'refresh', error, { retry: 1 })
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Queue job failed')
      )
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('"error":"Job failed"')
      )
      
      consoleSpy.mockRestore()
    })
  })
})
