// @ts-nocheck
import { NodeSDK } from '@opentelemetry/sdk-node';
import { Resource } from '@opentelemetry/resources';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';

if (process.env.NODE_ENV !== 'production') diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ERROR);

const exporter = new OTLPTraceExporter({ url: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT });
const resource = new Resource({ 'service.name': process.env.OTEL_SERVICE_NAME || 'dealershipai-app' });

const sdk = new NodeSDK({
  resource,
  traceExporter: exporter,
  instrumentations: [ getNodeAutoInstrumentations({ '@opentelemetry/instrumentation-fs': { enabled:false } }) ]
});

if (!(global as any).__otel_started) {
  (sdk.start() as any).catch(()=>{});
  (global as any).__otel_started = true;
}

process.once('beforeExit', () => { sdk.shutdown().catch(()=>{}); });

