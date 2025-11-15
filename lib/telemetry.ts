import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { config } from './config';

let sdk: NodeSDK | null = null;

export function initializeTelemetry(): void {
  if (!config.otel.enabled || sdk) {
    return;
  }

  try {
    // Create trace exporter
    const traceExporter = new OTLPTraceExporter({
      url: `${config.otel.endpoint}/v1/traces`,
    });

    // Create metric exporter
    const metricExporter = new OTLPMetricExporter({
      url: `${config.otel.endpoint}/v1/metrics`,
    });

    // Create resource
    const resource = new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: config.otel.serviceName,
      [SemanticResourceAttributes.SERVICE_VERSION]: config.otel.serviceVersion,
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: config.env.isProduction ? 'production' : 'development',
    });

    // Create SDK
    sdk = new NodeSDK({
      resource,
      traceExporter,
      metricReader: new PeriodicExportingMetricReader({
        exporter: metricExporter,
        exportIntervalMillis: 10000, // Export every 10 seconds
      }),
      instrumentations: [
        getNodeAutoInstrumentations({
          // Disable some instrumentations that might be too noisy
          '@opentelemetry/instrumentation-fs': {
            enabled: false,
          },
          '@opentelemetry/instrumentation-dns': {
            enabled: false,
          },
        }),
      ],
    });

    // Start the SDK
    sdk.start();

    console.log('OpenTelemetry initialized successfully');
  } catch (error) {
    console.error('Failed to initialize OpenTelemetry:', error);
  }
}

export function shutdownTelemetry(): Promise<void> {
  if (sdk) {
    return sdk.shutdown();
  }
  return Promise.resolve();
}

// Initialize telemetry on module load
if (config.otel.enabled) {
  initializeTelemetry();
}

// Graceful shutdown
process.on('SIGINT', () => {
  shutdownTelemetry().then(() => process.exit(0));
});

process.on('SIGTERM', () => {
  shutdownTelemetry().then(() => process.exit(0));
});
