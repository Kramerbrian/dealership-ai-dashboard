export async function getCoverage(params: any) {
  return {
    coverage: 0,
    metrics: {}
  };
}

export async function analyzeCoverage(params: any) {
  return {
    analysis: 'stub',
    recommendations: []
  };
}
