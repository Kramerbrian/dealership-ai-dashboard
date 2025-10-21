// Minimal mock implementation to unblock builds. Replace with real service on prod.
export const realAIAnalysisService = {
  async performRealAIAnalysis(domain: string): Promise<{
    summary: string;
    details: Record<string, any>;
    totalCost: number;
    totalTokens: number;
  }> {
    return {
      summary: `Mock analysis for ${domain}`,
      details: {
        visibility: 0.78,
        trust: 0.82,
        risk: 0.15,
      },
      totalCost: 0,
      totalTokens: 0,
    };
  },
};
