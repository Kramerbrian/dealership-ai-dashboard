/**
 * Dashboard Embed Utilities
 * Generates HTML for dashboard embedding
 */

export function generateDashboardHTML(data: any): string {
  return `
    <div class="dashboard-container">
      <h1>DealershipAI Dashboard</h1>
      <div class="metrics-grid">
        <div class="metric-card">
          <h3>AI Visibility Score</h3>
          <div class="score">${data.ai_visibility || 0}</div>
        </div>
        <div class="metric-card">
          <h3>SEO Score</h3>
          <div class="score">${data.seo_score || 0}</div>
        </div>
        <div class="metric-card">
          <h3>Local Score</h3>
          <div class="score">${data.local_score || 0}</div>
        </div>
      </div>
    </div>
  `;
}
