import { trace } from '@opentelemetry/api';
export const tracer = trace.getTracer('dealershipai-api', '1.0.0');

