export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }

  // Edge Runtime instrumentation temporarily disabled
  // Was causing MIDDLEWARE_INVOCATION_FAILED errors
  // TODO: Re-enable when Sentry Edge Runtime is properly configured
  // if (process.env.NEXT_RUNTIME === 'edge') {
  //   await import('./sentry.edge.config');
  // }
}
