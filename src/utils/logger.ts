const isProd = typeof process !== 'undefined' && process.env.NODE_ENV === 'production'

export const logger = {
  debug: (...a: any[]) => { if (!isProd) console.debug(...a) },
  info:  (...a: any[]) => { if (!isProd) console.info(...a) },
  warn:  (...a: any[]) => console.warn(...a),
  error: (...a: any[]) => console.error(...a),
}
