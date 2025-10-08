import { User } from '@/types/user';

export interface DashboardData {
  overallScore: number;
  aiVisibilityScore: number;
  zeroClickScore: number;
  ugcHealthScore: number;
  geoTrustScore: number;
  sgpIntegrityScore: number;
  dealerships: Array<{
    id: string;
    name: string;
    url: string;
    scores: {
      overall: number;
      ai_visibility: number;
      zero_click: number;
      ugc_health: number;
      geo_trust: number;
      sgp_integrity: number;
    };
    lastAnalyzed: string;
  }>;
  analytics: {
    totalDealerships: number;
    averageScore: number;
    topPerformers: any[];
    recentAnalyses: any[];
  };
}

export function generateDashboardHTML(data: DashboardData, user: User): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DealershipAI Dashboard</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .score-card { transition: transform 0.2s; }
        .score-card:hover { transform: translateY(-2px); }
        .progress-bar { transition: width 0.5s ease-in-out; }
    </style>
</head>
<body class="bg-gray-50">
    <div class="min-h-screen">
        <!-- Header -->
        <div class="bg-white shadow-sm border-b">
            <div class="px-6 py-4">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-2xl font-bold text-gray-900">DealershipAI Analytics</h1>
                        <p class="text-gray-600">Real-time AI visibility tracking</p>
                    </div>
                    <div class="text-right">
                        <p class="text-sm text-gray-500">Last updated</p>
                        <p class="text-sm font-medium text-gray-900" id="lastUpdated">${new Date().toLocaleString()}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Main Content -->
        <div class="p-6">
            <!-- Score Overview -->
            <div class="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                <div class="score-card bg-white p-6 rounded-lg shadow-sm border">
                    <div class="text-center">
                        <div class="text-3xl font-bold text-blue-600 mb-2">${data.overallScore || 0}</div>
                        <div class="text-sm text-gray-600">Overall Score</div>
                        <div class="w-full bg-gray-200 rounded-full h-2 mt-3">
                            <div class="progress-bar bg-blue-600 h-2 rounded-full" style="width: ${data.overallScore || 0}%"></div>
                        </div>
                    </div>
                </div>
                
                <div class="score-card bg-white p-6 rounded-lg shadow-sm border">
                    <div class="text-center">
                        <div class="text-3xl font-bold text-green-600 mb-2">${data.aiVisibilityScore || 0}</div>
                        <div class="text-sm text-gray-600">AI Visibility</div>
                        <div class="w-full bg-gray-200 rounded-full h-2 mt-3">
                            <div class="progress-bar bg-green-600 h-2 rounded-full" style="width: ${data.aiVisibilityScore || 0}%"></div>
                        </div>
                    </div>
                </div>
                
                <div class="score-card bg-white p-6 rounded-lg shadow-sm border">
                    <div class="text-center">
                        <div class="text-3xl font-bold text-purple-600 mb-2">${data.zeroClickScore || 0}</div>
                        <div class="text-sm text-gray-600">Zero-Click</div>
                        <div class="w-full bg-gray-200 rounded-full h-2 mt-3">
                            <div class="progress-bar bg-purple-600 h-2 rounded-full" style="width: ${data.zeroClickScore || 0}%"></div>
                        </div>
                    </div>
                </div>
                
                <div class="score-card bg-white p-6 rounded-lg shadow-sm border">
                    <div class="text-center">
                        <div class="text-3xl font-bold text-yellow-600 mb-2">${data.ugcHealthScore || 0}</div>
                        <div class="text-sm text-gray-600">Review Health</div>
                        <div class="w-full bg-gray-200 rounded-full h-2 mt-3">
                            <div class="progress-bar bg-yellow-600 h-2 rounded-full" style="width: ${data.ugcHealthScore || 0}%"></div>
                        </div>
                    </div>
                </div>
                
                <div class="score-card bg-white p-6 rounded-lg shadow-sm border">
                    <div class="text-center">
                        <div class="text-3xl font-bold text-indigo-600 mb-2">${data.geoTrustScore || 0}</div>
                        <div class="text-sm text-gray-600">Local Trust</div>
                        <div class="w-full bg-gray-200 rounded-full h-2 mt-3">
                            <div class="progress-bar bg-indigo-600 h-2 rounded-full" style="width: ${data.geoTrustScore || 0}%"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Charts Section -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <!-- Score Trend Chart -->
                <div class="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">Score Trends</h3>
                    <canvas id="scoreTrendChart" width="400" height="200"></canvas>
                </div>
                
                <!-- Score Distribution -->
                <div class="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">Score Distribution</h3>
                    <canvas id="scoreDistributionChart" width="400" height="200"></canvas>
                </div>
            </div>

            <!-- Dealerships Table -->
            <div class="bg-white rounded-lg shadow-sm border">
                <div class="px-6 py-4 border-b border-gray-200">
                    <h3 class="text-lg font-semibold text-gray-900">Dealership Performance</h3>
                </div>
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dealership</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Overall</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AI Visibility</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zero-Click</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Review Health</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Analyzed</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200" id="dealershipsTable">
                            ${generateDealershipsTable(data.dealerships)}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Dashboard data
        const dashboardData = ${JSON.stringify(data)};
        const currentUser = ${JSON.stringify({
          name: (user as any).firstName ? (user as any).firstName + ' ' + (user as any).lastName : 'User',
          role: (user as any).role || 'user',
          tenant: (user as any).tenant?.name || 'Default'
        })};

        // Initialize charts
        function initCharts() {
            // Score Trend Chart
            const trendCtx = document.getElementById('scoreTrendChart').getContext('2d');
            new Chart(trendCtx, {
                type: 'line',
                data: {
                    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                    datasets: [{
                        label: 'Overall Score',
                        data: [${data.overallScore - 10}, ${data.overallScore - 5}, ${data.overallScore - 2}, ${data.overallScore}],
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100
                        }
                    }
                }
            });

            // Score Distribution Chart
            const distCtx = document.getElementById('scoreDistributionChart').getContext('2d');
            new Chart(distCtx, {
                type: 'doughnut',
                data: {
                    labels: ['AI Visibility', 'Zero-Click', 'Review Health', 'Local Trust', 'Tech Setup'],
                    datasets: [{
                        data: [${data.aiVisibilityScore}, ${data.zeroClickScore}, ${data.ugcHealthScore}, ${data.geoTrustScore}, ${data.sgpIntegrityScore}],
                        backgroundColor: [
                            'rgb(34, 197, 94)',
                            'rgb(147, 51, 234)',
                            'rgb(234, 179, 8)',
                            'rgb(99, 102, 241)',
                            'rgb(239, 68, 68)'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        }

        // Auto-refresh data every 5 minutes
        function refreshData() {
            // In a real implementation, this would fetch new data from the API
            document.getElementById('lastUpdated').textContent = new Date().toLocaleString();
        }

        // Initialize dashboard
        document.addEventListener('DOMContentLoaded', function() {
            initCharts();
            setInterval(refreshData, 300000); // 5 minutes
        });

        // Add some interactivity
        document.querySelectorAll('.score-card').forEach(card => {
            card.addEventListener('click', function() {
                const score = this.querySelector('.text-3xl').textContent;
                alert('Score: ' + score + '/100');
            });
        });
    </script>
</body>
</html>`;
}

function generateDealershipsTable(dealerships: any[]): string {
  if (!dealerships || dealerships.length === 0) {
    return `
      <tr>
        <td colspan="6" class="px-6 py-4 text-center text-gray-500">
          No dealership data available
        </td>
      </tr>
    `;
  }

  return dealerships.map(dealership => `
    <tr class="hover:bg-gray-50">
      <td class="px-6 py-4 whitespace-nowrap">
        <div class="text-sm font-medium text-gray-900">${dealership.name || 'Unknown'}</div>
        <div class="text-sm text-gray-500">${dealership.url || ''}</div>
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        <div class="text-sm font-medium text-gray-900">${dealership.scores?.overall || 0}/100</div>
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        <div class="text-sm font-medium text-gray-900">${dealership.scores?.ai_visibility || 0}/100</div>
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        <div class="text-sm font-medium text-gray-900">${dealership.scores?.zero_click || 0}/100</div>
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        <div class="text-sm font-medium text-gray-900">${dealership.scores?.ugc_health || 0}/100</div>
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        ${dealership.lastAnalyzed ? new Date(dealership.lastAnalyzed).toLocaleDateString() : 'Never'}
      </td>
    </tr>
  `).join('');
}
