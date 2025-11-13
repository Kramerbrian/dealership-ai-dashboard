"use client";

import React, { useState, useEffect } from "react";

interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: 'immediate' | 'short_term' | 'strategic';
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  roi: number;
  confidence: number;
  actions: string[];
  expectedOutcome: string;
  timeframe: string;
  priority: number;
}

interface Competitor {
  id: string;
  name: string;
  domain: string;
  currentScore: number;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  marketShare: number;
  growthRate: number;
}

interface Alert {
  id: string;
  type: 'performance' | 'competitor' | 'opportunity' | 'threat' | 'system';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: {
    revenue: number;
    customers: number;
    reputation: number;
  };
  urgency: 'immediate' | 'urgent' | 'important' | 'normal';
  confidence: number;
  priority: number;
  category: string;
}

export default function CompetitiveAdvantageDashboard() {
  const [activeTab, setActiveTab] = useState<'recommendations' | 'competitors' | 'alerts' | 'predictions'>('recommendations');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [recRes, compRes, alertRes] = await Promise.all([
        fetch('/api/ai/recommendations'),
        fetch('/api/competitors/intelligence'),
        fetch('/api/alerts/prioritization')
      ]);

      const [recData, compData, alertData] = await Promise.all([
        recRes.json(),
        compRes.json(),
        alertRes.json()
      ]);

      setRecommendations(recData.recommendations || []);
      setCompetitors(compData.competitors || []);
      setAlerts(alertData.alerts || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-800 bg-red-200 border-red-300';
      case 'high': return 'text-orange-800 bg-orange-200 border-orange-300';
      case 'medium': return 'text-yellow-800 bg-yellow-200 border-yellow-300';
      case 'low': return 'text-blue-800 bg-blue-200 border-blue-300';
      default: return 'text-gray-800 bg-gray-200 border-gray-300';
    }
  };

  const getThreatColor = (threat: string) => {
    switch (threat) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return React.createElement("div", {
      className: "flex items-center justify-center h-64"
    }, [
      React.createElement("div", {
        key: "loading",
        className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
      })
    ]);
  }

  return React.createElement("div", {
    className: "space-y-6"
  }, [
    // Header
    React.createElement("div", {
      key: "header",
      className: "flex items-center justify-between"
    }, [
      React.createElement("div", {
        key: "title-section"
      }, [
        React.createElement("h2", {
          key: "title",
          className: "text-2xl font-bold text-gray-900"
        }, "Competitive Advantage Center"),
        React.createElement("p", {
          key: "subtitle",
          className: "text-gray-600 mt-1"
        }, "AI-powered insights to dominate your market")
      ]),
      React.createElement("button", {
        key: "refresh",
        onClick: fetchAllData,
        className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      }, "🔄 Refresh Data")
    ]),

    // Tabs
    React.createElement("div", {
      key: "tabs",
      className: "flex space-x-1 bg-gray-100 rounded-lg p-1"
    }, [
      { id: 'recommendations', label: 'AI Recommendations', icon: '🧠' },
      { id: 'competitors', label: 'Competitor Intel', icon: '🏆' },
      { id: 'alerts', label: 'Smart Alerts', icon: '⚠️' },
      { id: 'predictions', label: 'Predictions', icon: '🔮' }
    ].map(tab => 
      React.createElement("button", {
        key: tab.id,
        onClick: () => setActiveTab(tab.id as any),
        className: `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          activeTab === tab.id 
            ? "bg-white text-gray-900 shadow-sm" 
            : "text-gray-600 hover:text-gray-900"
        }`
      }, `${tab.icon} ${tab.label}`)
    )),

    // Content
    activeTab === 'recommendations' && React.createElement("div", {
      key: "recommendations-content",
      className: "space-y-4"
    }, [
      React.createElement("div", {
        key: "summary",
        className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
      }, [
        React.createElement("div", {
          key: "immediate",
          className: "bg-red-50 border border-red-200 rounded-lg p-4"
        }, [
          React.createElement("h3", {
            key: "title",
            className: "text-lg font-semibold text-red-800"
          }, "Immediate Actions"),
          React.createElement("p", {
            key: "count",
            className: "text-2xl font-bold text-red-600"
          }, recommendations.filter(r => r.category === 'immediate').length),
          React.createElement("p", {
            key: "desc",
            className: "text-sm text-red-600"
          }, "Can be done today")
        ]),
        React.createElement("div", {
          key: "short-term",
          className: "bg-yellow-50 border border-yellow-200 rounded-lg p-4"
        }, [
          React.createElement("h3", {
            key: "title",
            className: "text-lg font-semibold text-yellow-800"
          }, "Short-term Goals"),
          React.createElement("p", {
            key: "count",
            className: "text-2xl font-bold text-yellow-600"
          }, recommendations.filter(r => r.category === 'short_term').length),
          React.createElement("p", {
            key: "desc",
            className: "text-sm text-yellow-600"
          }, "1-4 weeks")
        ]),
        React.createElement("div", {
          key: "strategic",
          className: "bg-green-50 border border-green-200 rounded-lg p-4"
        }, [
          React.createElement("h3", {
            key: "title",
            className: "text-lg font-semibold text-green-800"
          }, "Strategic Initiatives"),
          React.createElement("p", {
            key: "count",
            className: "text-2xl font-bold text-green-600"
          }, recommendations.filter(r => r.category === 'strategic').length),
          React.createElement("p", {
            key: "desc",
            className: "text-sm text-green-600"
          }, "1-3 months")
        ])
      ]),
      
      React.createElement("div", {
        key: "recommendations-list",
        className: "space-y-4"
      }, recommendations.map(rec => 
        React.createElement("div", {
          key: rec.id,
          className: "bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
        }, [
          React.createElement("div", {
            key: "header",
            className: "flex items-start justify-between mb-4"
          }, [
            React.createElement("div", {
              key: "title-section",
              className: "flex-1"
            }, [
              React.createElement("h3", {
                key: "title",
                className: "text-lg font-semibold text-gray-900"
              }, rec.title),
              React.createElement("p", {
                key: "description",
                className: "text-gray-600 mt-1"
              }, rec.description)
            ]),
            React.createElement("div", {
              key: "badges",
              className: "flex gap-2"
            }, [
              React.createElement("span", {
                key: "impact",
                className: `px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(rec.impact)}`
              }, rec.impact.toUpperCase()),
              React.createElement("span", {
                key: "roi",
                className: "px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
              }, `${rec.roi}x ROI`)
            ])
          ]),
          React.createElement("div", {
            key: "details",
            className: "grid grid-cols-1 md:grid-cols-2 gap-4"
          }, [
            React.createElement("div", {
              key: "left"
            }, [
              React.createElement("p", {
                key: "timeframe",
                className: "text-sm text-gray-600"
              }, `⏱️ ${rec.timeframe}`),
              React.createElement("p", {
                key: "confidence",
                className: "text-sm text-gray-600"
              }, `🎯 ${Math.round(rec.confidence * 100)}% confidence`),
              React.createElement("p", {
                key: "outcome",
                className: "text-sm text-gray-600"
              }, `📈 ${rec.expectedOutcome}`)
            ]),
            React.createElement("div", {
              key: "right"
            }, [
              React.createElement("h4", {
                key: "actions-title",
                className: "font-medium text-gray-900 mb-2"
              }, "Key Actions:"),
              React.createElement("ul", {
                key: "actions-list",
                className: "text-sm text-gray-600 space-y-1"
              }, rec.actions.slice(0, 3).map((action, i) => 
                React.createElement("li", {
                  key: i,
                  className: "flex items-start gap-2"
                }, [
                  React.createElement("span", {
                    key: "bullet",
                    className: "text-blue-500 mt-1"
                  }, "•"),
                  action
                ])
              ))
            ])
          ])
        ])
      ))
    ]),

    activeTab === 'competitors' && React.createElement("div", {
      key: "competitors-content",
      className: "space-y-4"
    }, [
      React.createElement("div", {
        key: "competitors-grid",
        className: "grid grid-cols-1 md:grid-cols-2 gap-4"
      }, competitors.map(comp => 
        React.createElement("div", {
          key: comp.id,
          className: "bg-white border border-gray-200 rounded-lg p-6"
        }, [
          React.createElement("div", {
            key: "header",
            className: "flex items-center justify-between mb-4"
          }, [
            React.createElement("div", {
              key: "name-section"
            }, [
              React.createElement("h3", {
                key: "name",
                className: "text-lg font-semibold text-gray-900"
              }, comp.name),
              React.createElement("p", {
                key: "domain",
                className: "text-sm text-gray-500"
              }, comp.domain)
            ]),
            React.createElement("div", {
              key: "score-section",
              className: "text-right"
            }, [
              React.createElement("p", {
                key: "score",
                className: "text-2xl font-bold text-gray-900"
              }, comp.currentScore),
              React.createElement("p", {
                key: "trend",
                className: `text-sm ${comp.trend === 'up' ? 'text-red-600' : comp.trend === 'down' ? 'text-green-600' : 'text-gray-600'}`
              }, `${comp.trend === 'up' ? '↗' : comp.trend === 'down' ? '↘' : '→'} ${Math.abs(comp.trendValue)}%`)
            ])
          ]),
          React.createElement("div", {
            key: "details",
            className: "space-y-3"
          }, [
            React.createElement("div", {
              key: "threat",
              className: "flex items-center gap-2"
            }, [
              React.createElement("span", {
                key: "label",
                className: "text-sm text-gray-600"
              }, "Threat Level:"),
              React.createElement("span", {
                key: "value",
                className: `text-sm font-medium ${getThreatColor(comp.threatLevel)}`
              }, comp.threatLevel.toUpperCase())
            ]),
            React.createElement("div", {
              key: "market-share",
              className: "flex items-center gap-2"
            }, [
              React.createElement("span", {
                key: "label",
                className: "text-sm text-gray-600"
              }, "Market Share:"),
              React.createElement("span", {
                key: "value",
                className: "text-sm font-medium text-gray-900"
              }, `${comp.marketShare}%`)
            ]),
            React.createElement("div", {
              key: "strengths",
              className: "mt-3"
            }, [
              React.createElement("h4", {
                key: "title",
                className: "font-medium text-gray-900 mb-1"
              }, "Strengths:"),
              React.createElement("ul", {
                key: "list",
                className: "text-sm text-gray-600 space-y-1"
              }, comp.strengths.slice(0, 2).map((strength, i) => 
                React.createElement("li", {
                  key: i,
                  className: "flex items-start gap-2"
                }, [
                  React.createElement("span", {
                    key: "bullet",
                    className: "text-green-500 mt-1"
                  }, "•"),
                  strength
                ])
              ))
            ])
          ])
        ])
      ))
    ]),

    activeTab === 'alerts' && React.createElement("div", {
      key: "alerts-content",
      className: "space-y-4"
    }, [
      React.createElement("div", {
        key: "alerts-list",
        className: "space-y-3"
      }, alerts.map(alert => 
        React.createElement("div", {
          key: alert.id,
          className: `border rounded-lg p-4 ${getSeverityColor(alert.severity)}`
        }, [
          React.createElement("div", {
            key: "header",
            className: "flex items-start justify-between mb-2"
          }, [
            React.createElement("div", {
              key: "title-section",
              className: "flex-1"
            }, [
              React.createElement("h3", {
                key: "title",
                className: "font-semibold"
              }, alert.title),
              React.createElement("p", {
                key: "description",
                className: "text-sm mt-1 opacity-90"
              }, alert.description)
            ]),
            React.createElement("div", {
              key: "badges",
              className: "flex gap-2"
            }, [
              React.createElement("span", {
                key: "severity",
                className: "px-2 py-1 rounded-full text-xs font-medium bg-white bg-opacity-50"
              }, alert.severity.toUpperCase()),
              React.createElement("span", {
                key: "priority",
                className: "px-2 py-1 rounded-full text-xs font-medium bg-white bg-opacity-50"
              }, `P${alert.priority}`)
            ])
          ]),
          React.createElement("div", {
            key: "impact",
            className: "grid grid-cols-3 gap-4 text-sm"
          }, [
            React.createElement("div", {
              key: "revenue",
              className: "text-center"
            }, [
              React.createElement("p", {
                key: "value",
                className: "font-semibold"
              }, `$${alert.impact.revenue.toLocaleString()}`),
              React.createElement("p", {
                key: "label",
                className: "opacity-75"
              }, "Revenue Impact")
            ]),
            React.createElement("div", {
              key: "customers",
              className: "text-center"
            }, [
              React.createElement("p", {
                key: "value",
                className: "font-semibold"
              }, alert.impact.customers),
              React.createElement("p", {
                key: "label",
                className: "opacity-75"
              }, "Customers")
            ]),
            React.createElement("div", {
              key: "reputation",
              className: "text-center"
            }, [
              React.createElement("p", {
                key: "value",
                className: "font-semibold"
              }, alert.impact.reputation),
              React.createElement("p", {
                key: "label",
                className: "opacity-75"
              }, "Reputation")
            ])
          ])
        ])
      ))
    ]),

    activeTab === 'predictions' && React.createElement("div", {
      key: "predictions-content",
      className: "space-y-4"
    }, [
      React.createElement("div", {
        key: "predictions-placeholder",
        className: "bg-white border border-gray-200 rounded-lg p-8 text-center"
      }, [
        React.createElement("h3", {
          key: "title",
          className: "text-lg font-semibold text-gray-900 mb-2"
        }, "🔮 Predictive Optimization"),
        React.createElement("p", {
          key: "description",
          className: "text-gray-600"
        }, "Advanced AI predictions and optimization recommendations coming soon..."),
        React.createElement("button", {
          key: "button",
          className: "mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        }, "View Predictions")
      ])
    ])
  ]);
}
