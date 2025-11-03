/**
 * OpenTelemetry Configuration for Sentry
 * Configures distributed tracing and logging
 */

import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { LoggerProvider, BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { Resource } from '@opentelemetry/resources';
import { SEMRESATTRS_SERVICE_NAME, SEMRESATTRS_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';

// Sentry OTLP endpoints
const SENTRY_TRACES_ENDPOINT = process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT;
const SENTRY_LOGS_ENDPOINT = process.env.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT;
const SENTRY_TRACES_HEADERS = process.env.OTEL_EXPORTER_OTLP_TRACES_HEADERS;
const SENTRY_LOGS_HEADERS = process.env.OTEL_EXPORTER_OTLP_LOGS_HEADERS;

// Parse headers (format: "key1=value1 key2=value2")
function parseHeaders(headerString?: string): Record<string, string> {
  if (!headerString) return {};
  
  const headers: Record<string, string> = {};
  headerString.split(' ').forEach((pair) => {
    const [key, ...values] = pair.split('=');
    if (key && values.length > 0) {
      headers[key] = values.join('=');
    }
  });
  
  return headers;
}

// Initialize OpenTelemetry SDK only if endpoints are configured
let otelSDK: NodeSDK | null = null;
let loggerProvider: LoggerProvider | null = null;

export function initializeOpenTelemetry() {
  // Only initialize if Sentry endpoints are configured
  if (!SENTRY_TRACES_ENDPOINT && !SENTRY_LOGS_ENDPOINT) {
    console.log('[OpenTelemetry] Sentry endpoints not configured, skipping initialization');
    return;
  }

  try {
    // Configure trace exporter if traces endpoint is provided
    let traceExporter;
    if (SENTRY_TRACES_ENDPOINT) {
      traceExporter = new OTLPTraceExporter({
        url: SENTRY_TRACES_ENDPOINT,
        headers: parseHeaders(SENTRY_TRACES_HEADERS),
        compression: 'gzip',
      });
    }

    // Initialize Node SDK
    if (traceExporter) {
      otelSDK = new NodeSDK({
        traceExporter,
        resource: new Resource({
          [SEMRESATTRS_SERVICE_NAME]: 'dealership-ai-dashboard',
          [SEMRESATTRS_SERVICE_VERSION]: process.env.npm_package_version || '1.0.0',
        }),
      });

      otelSDK.start();
      console.log('[OpenTelemetry] Trace exporter initialized');
    }

    // Configure log exporter if logs endpoint is provided
    if (SENTRY_LOGS_ENDPOINT) {
      const logExporter = new OTLPLogExporter({
        url: SENTRY_LOGS_ENDPOINT,
        headers: parseHeaders(SENTRY_LOGS_HEADERS),
        compression: 'gzip',
      });

      loggerProvider = new LoggerProvider({
        resource: new Resource({
          [SEMRESATTRS_SERVICE_NAME]: 'dealership-ai-dashboard',
          [SEMRESATTRS_SERVICE_VERSION]: process.env.npm_package_version || '1.0.0',
        }),
      });

      loggerProvider.addLogRecordProcessor(new BatchLogRecordProcessor(logExporter));
      console.log('[OpenTelemetry] Log exporter initialized');
    }
  } catch (error) {
    console.error('[OpenTelemetry] Initialization error:', error);
  }
}

export function shutdownOpenTelemetry() {
  return Promise.all([
    otelSDK?.shutdown(),
    loggerProvider?.shutdown(),
  ].filter(Boolean));
}

// Auto-initialize in non-test environments
if (process.env.NODE_ENV !== 'test' && typeof window === 'undefined') {
  initializeOpenTelemetry();
}
