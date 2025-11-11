import { trace, metrics, context, SpanStatusCode } from '@opentelemetry/api';
import { NextRequest, NextResponse } from 'next/server';

const tracer = trace.getTracer('dealershipai-api');
const meter = metrics.getMeter('dealershipai-api');

// Create metrics
const requestCounter = meter.createCounter('api_requests_total', {
  description: 'Total number of API requests',
});

const requestDuration = meter.createHistogram('api_request_duration_ms', {
  description: 'Duration of API requests in milliseconds',
});

const errorCounter = meter.createCounter('api_errors_total', {
  description: 'Total number of API errors',
});

const sloCounter = meter.createCounter('slo_violations_total', {
  description: 'Total number of SLO violations',
});

export function withTelemetry(
  handler: (req: NextRequest, context: any) => Promise<NextResponse>,
  operationName: string
) {
  return async (req: NextRequest, context: any): Promise<NextResponse> => {
    const startTime = Date.now();
    const span = tracer.startSpan(operationName, {
      attributes: {
        'http.method': req.method,
        'http.url': req.url,
        'http.user_agent': req.headers.get('user-agent') || 'unknown',
        'http.request_id': req.headers.get('x-request-id') || 'unknown',
      },
    });

    return context.with(trace.setSpan(context.active(), span), async () => {
      try {
        const response = await handler(req, context);
        
        // Record metrics
        const duration = Date.now() - startTime;
        requestCounter.add(1, {
          method: req.method,
          status: response.status.toString(),
          route: operationName,
        });
        
        requestDuration.record(duration, {
          method: req.method,
          status: response.status.toString(),
          route: operationName,
        });

        // Check SLO violations
        const isRead = req.method === 'GET' || req.method === 'HEAD';
        const target = isRead ? 150 : 400; // ms
        if (duration > target) {
          sloCounter.add(1, {
            operation: operationName,
            method: req.method,
            target: target.toString(),
            actual: duration.toString(),
          });
        }

        // Set span attributes
        span.setAttributes({
          'http.status_code': response.status,
          'http.response_size': response.headers.get('content-length') || '0',
          'api.duration_ms': duration,
          'api.slo_violation': duration > target,
        });

        span.setStatus({ code: SpanStatusCode.OK });
        return response;

      } catch (error) {
        // Record error metrics
        errorCounter.add(1, {
          method: req.method,
          route: operationName,
          error_type: error instanceof Error ? error.constructor.name : 'Unknown',
        });

        // Set span attributes for error
        span.setAttributes({
          'error': true,
          'error.message': error instanceof Error ? error.message : 'Unknown error',
          'error.type': error instanceof Error ? error.constructor.name : 'Unknown',
        });

        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: error instanceof Error ? error.message : 'Unknown error',
        });

        throw error;
      } finally {
        span.end();
      }
    });
  };
}

export function createSpan(name: string, attributes?: Record<string, string | number | boolean>) {
  const span = tracer.startSpan(name, { attributes });
  return {
    span,
    setAttribute: (key: string, value: string | number | boolean) => {
      span.setAttributes({ [key]: value });
    },
    setStatus: (code: SpanStatusCode, message?: string) => {
      span.setStatus({ code, message });
    },
    end: () => span.end(),
  };
}

export function recordMetric(name: string, value: number, attributes?: Record<string, string>) {
  const counter = meter.createCounter(name);
  counter.add(value, attributes);
}

export function recordHistogram(name: string, value: number, attributes?: Record<string, string>) {
  const histogram = meter.createHistogram(name);
  histogram.record(value, attributes);
}
