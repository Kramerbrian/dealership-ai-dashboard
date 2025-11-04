/**
 * Prometheus Query Utilities
 * Helper functions for querying Prometheus metrics
 */

const PROMETHEUS_URL = process.env.PROMETHEUS_URL || 'http://localhost:9090';

export interface PrometheusQueryResult {
  status: string;
  data: {
    resultType: string;
    result: Array<{
      metric: Record<string, string>;
      value: [number, string];
    }>;
  };
}

/**
 * Query Prometheus for a metric
 * @param query - PromQL query string
 * @returns Query result
 */
export async function queryPrometheus(query: string): Promise<PrometheusQueryResult | null> {
  try {
    const encodedQuery = encodeURIComponent(query);
    const url = `${PROMETHEUS_URL}/api/v1/query?query=${encodedQuery}`;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      // Add timeout for external requests
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      console.error(`Prometheus query failed: ${response.statusText}`);
      return null;
    }

    const data = await response.json() as PrometheusQueryResult;
    return data;
  } catch (error) {
    console.error('Error querying Prometheus:', error);
    return null;
  }
}

/**
 * Get GNN precision for a dealer
 * @param dealerId - Dealer identifier
 * @returns Precision value (0-1) or null
 */
export async function getDealerPrecision(dealerId: string): Promise<number | null> {
  const query = `gnn_precision_by_dealer{dealer="${dealerId}"}`;
  const result = await queryPrometheus(query);

  if (!result || result.data.result.length === 0) {
    return null;
  }

  const value = parseFloat(result.data.result[0].value[1]);
  return isNaN(value) ? null : value;
}

/**
 * Get ARR gain for a dealer
 * @param dealerId - Dealer identifier
 * @returns ARR gain value or null
 */
export async function getDealerARRGain(dealerId: string): Promise<number | null> {
  const query = `gnn_arr_gain_by_dealer{dealer="${dealerId}"}`;
  const result = await queryPrometheus(query);

  if (!result || result.data.result.length === 0) {
    return null;
  }

  const value = parseFloat(result.data.result[0].value[1]);
  return isNaN(value) ? null : value;
}

/**
 * Get multiple metrics for a dealer
 * @param dealerId - Dealer identifier
 * @returns Object with precision and ARR gain
 */
export async function getDealerMetrics(dealerId: string): Promise<{
  precision: number | null;
  arrGain: number | null;
}> {
  const [precision, arrGain] = await Promise.all([
    getDealerPrecision(dealerId),
    getDealerARRGain(dealerId),
  ]);

  return { precision, arrGain };
}

