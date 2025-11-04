'use client';

import React, { useState } from 'react';
import { X, ChevronRight, TrendingUp, AlertCircle, Info, DollarSign, Users, Wrench, ShoppingCart, Megaphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface KPI {
  id: string;
  title: string;
  value: string;
  trend?: string;
  roiUpside?: string;
  priority: 'high' | 'medium' | 'low';
  insights: {
    title: string;
    description: string;
    actionItems: string[];
    impact: string;
    timeline: string;
  };
}

interface ManagerSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  positiveKPI: KPI;
  opportunityKPIs: KPI[];
}

const managerSections: ManagerSection[] = [
  {
    id: 'general-sales',
    title: 'General Sales Manager',
    icon: <Users className="w-5 h-5" />,
    positiveKPI: {
      id: 'gs-pos-1',
      title: 'Sales Conversion Rate',
      value: '18.2%',
      trend: '+2.4%',
      priority: 'high',
      insights: {
        title: 'Strong Sales Conversion Performance',
        description: 'Your sales team is converting at 18.2%, which is 2.4% above industry average. This strong performance indicates effective sales processes and customer engagement.',
        actionItems: [
          'Continue current sales training programs',
          'Replicate top performer strategies',
          'Maintain quality lead sources'
        ],
        impact: 'Maintains current revenue trajectory',
        timeline: 'Ongoing'
      }
    },
    opportunityKPIs: [
      {
        id: 'gs-opp-1',
        title: 'Lead Response Time',
        value: '4.2 hours',
        trend: 'Target: <2 hours',
        roiUpside: '$45K/month',
        priority: 'high',
        insights: {
          title: 'Fast Response = Higher Conversion',
          description: 'Current average response time is 4.2 hours. Research shows responding within 2 hours increases conversion by 300%. Your dealership could capture an additional $45K/month in revenue.',
          actionItems: [
            'Implement automated lead response system',
            'Set up instant SMS notifications for sales team',
            'Create response time dashboard for managers',
            'Offer bonuses for sub-2-hour responses'
          ],
          impact: '$540K annual revenue increase',
          timeline: '2-4 weeks implementation'
        }
      },
      {
        id: 'gs-opp-2',
        title: 'Trade-In Appraisal Rate',
        value: '62%',
        trend: 'Industry: 75%',
        roiUpside: '$28K/month',
        priority: 'medium',
        insights: {
          title: 'Missing Trade-In Opportunities',
          description: 'You\'re appraising 62% of customers, but industry best practices show 75%+ appraisal rates. Each missed appraisal is a potential sale worth $2,800 on average.',
          actionItems: [
            'Train sales team to ask about trade-ins on every interaction',
            'Implement trade-in value calculator on website',
            'Create trade-in promotion campaigns',
            'Track and reward high appraisal rates'
          ],
          impact: '$336K annual revenue increase',
          timeline: '3-6 weeks to see results'
        }
      }
    ]
  },
  {
    id: 'new-car',
    title: 'New Car Manager (includes New F&I)',
    icon: <ShoppingCart className="w-5 h-5" />,
    positiveKPI: {
      id: 'nc-pos-1',
      title: 'New Vehicle Inventory Turn',
      value: '42 days',
      trend: 'Industry: 55 days',
      priority: 'high',
      insights: {
        title: 'Excellent Inventory Management',
        description: 'Your 42-day turn rate is significantly better than the 55-day industry average. This indicates strong inventory selection and pricing strategies.',
        actionItems: [
          'Continue current inventory optimization',
          'Maintain strong relationships with manufacturers',
          'Keep current pricing strategy'
        ],
        impact: 'Reduced floorplan costs',
        timeline: 'Ongoing'
      }
    },
    opportunityKPIs: [
      {
        id: 'nc-opp-1',
        title: 'F&I Penetration Rate',
        value: '68%',
        trend: 'Top performers: 85%+',
        roiUpside: '$52K/month',
        priority: 'high',
        insights: {
          title: 'F&I Revenue Opportunity',
          description: 'Current F&I penetration is 68%. Top performers achieve 85%+. Increasing to 80% would add $52K/month in F&I revenue through extended warranties, GAP insurance, and service contracts.',
          actionItems: [
            'Implement F&I menu presentation system',
            'Train F&I managers on value-based selling',
            'Create F&I product comparison tools',
            'Set F&I penetration goals by vehicle type'
          ],
          impact: '$624K annual F&I revenue increase',
          timeline: '4-8 weeks training + implementation'
        }
      },
      {
        id: 'nc-opp-2',
        title: 'Online Lead Conversion',
        value: '12%',
        trend: 'Industry: 18%',
        roiUpside: '$38K/month',
        priority: 'medium',
        insights: {
          title: 'Underperforming Online Sales',
          description: 'Your online lead conversion is 12% vs 18% industry average. With 800+ monthly online leads, improving to 18% would add 48 sales/month worth $38K.',
          actionItems: [
            'Improve online chat response quality',
            'Implement video walkarounds for online leads',
            'Create personalized online sales process',
            'Track and optimize online lead journey'
          ],
          impact: '$456K annual revenue increase',
          timeline: '6-10 weeks to optimize'
        }
      }
    ]
  },
  {
    id: 'used-car',
    title: 'Used Car Manager (includes Used F&I)',
    icon: <Wrench className="w-5 h-5" />,
    positiveKPI: {
      id: 'uc-pos-1',
      title: 'Used Vehicle Gross Profit',
      value: '$2,850',
      trend: '+$180',
      priority: 'high',
      insights: {
        title: 'Strong Used Vehicle Profitability',
        description: 'Average gross profit of $2,850 per used vehicle is $180 above target. This indicates effective pricing and negotiation strategies.',
        actionItems: [
          'Continue current pricing strategies',
          'Maintain focus on quality inventory',
          'Keep reconditioning costs optimized'
        ],
        impact: 'Maintains strong profit margins',
        timeline: 'Ongoing'
      }
    },
    opportunityKPIs: [
      {
        id: 'uc-opp-1',
        title: 'Reconditioning Efficiency',
        value: '8.5 days',
        trend: 'Best practice: 5 days',
        roiUpside: '$24K/month',
        priority: 'high',
        insights: {
          title: 'Faster Turn = More Sales',
          description: 'Current reconditioning time is 8.5 days. Reducing to 5 days would increase inventory velocity by 40%, allowing more sales with same inventory investment.',
          actionItems: [
            'Streamline reconditioning workflow',
            'Add dedicated reconditioning coordinator',
            'Implement real-time tracking system',
            'Create reconditioning performance metrics'
          ],
          impact: '$288K annual revenue increase',
          timeline: '4-6 weeks to optimize'
        }
      },
      {
        id: 'uc-opp-2',
        title: 'Used F&I Product Attach',
        value: '2.1 products',
        trend: 'Target: 3.2 products',
        roiUpside: '$18K/month',
        priority: 'medium',
        insights: {
          title: 'F&I Product Upsell Opportunity',
          description: 'Current average is 2.1 F&I products per used vehicle sale. Increasing to 3.2 would add $450 per vehicle in F&I revenue.',
          actionItems: [
            'Train F&I team on used vehicle product bundles',
            'Create value-focused product presentations',
            'Develop used vehicle-specific F&I menus',
            'Track product attachment rates'
          ],
          impact: '$216K annual F&I revenue increase',
          timeline: '3-5 weeks training'
        }
      }
    ]
  },
  {
    id: 'service',
    title: 'Service Director/Manager',
    icon: <Wrench className="w-5 h-5" />,
    positiveKPI: {
      id: 'svc-pos-1',
      title: 'Customer Retention Rate',
      value: '72%',
      trend: '+5%',
      priority: 'high',
      insights: {
        title: 'Excellent Service Retention',
        description: '72% retention rate is 5% above industry average. This indicates strong customer satisfaction and service quality.',
        actionItems: [
          'Continue current service excellence programs',
          'Maintain focus on customer communication',
          'Keep service advisor training programs'
        ],
        impact: 'Strong customer lifetime value',
        timeline: 'Ongoing'
      }
    },
    opportunityKPIs: [
      {
        id: 'svc-opp-1',
        title: 'Service Revenue per R.O.',
        value: '$342',
        trend: 'Target: $425',
        roiUpside: '$32K/month',
        priority: 'high',
        insights: {
          title: 'Service Revenue Upsell Opportunity',
          description: 'Current revenue per repair order is $342. Increasing to $425 through effective upselling would add $32K/month in service revenue.',
          actionItems: [
            'Implement service advisor sales training',
            'Create visual inspection presentation tools',
            'Develop customer education materials',
            'Track and reward high R.O. values'
          ],
          impact: '$384K annual service revenue increase',
          timeline: '4-6 weeks training + implementation'
        }
      },
      {
        id: 'svc-opp-2',
        title: 'Same-Day Service Appointments',
        value: '38%',
        trend: 'Target: 60%',
        roiUpside: '$22K/month',
        priority: 'medium',
        insights: {
          title: 'Capture More Service Demand',
          description: 'Only 38% of customers get same-day appointments. Increasing to 60% would capture more walk-in demand and reduce lost revenue.',
          actionItems: [
            'Implement dynamic scheduling system',
            'Create flexible technician scheduling',
            'Develop rapid service lane processes',
            'Track appointment fill rates'
          ],
          impact: '$264K annual revenue increase',
          timeline: '5-8 weeks to optimize'
        }
      }
    ]
  },
  {
    id: 'parts',
    title: 'Parts Manager',
    icon: <ShoppingCart className="w-5 h-5" />,
    positiveKPI: {
      id: 'parts-pos-1',
      title: 'Parts Inventory Turn',
      value: '6.2x',
      trend: '+0.8x',
      priority: 'high',
      insights: {
        title: 'Efficient Parts Inventory Management',
        description: '6.2x annual inventory turn is strong, indicating good inventory mix and turnover. This reduces carrying costs and improves cash flow.',
        actionItems: [
          'Continue current inventory optimization',
          'Maintain focus on fast-moving parts',
          'Keep parts ordering processes efficient'
        ],
        impact: 'Optimal cash flow management',
        timeline: 'Ongoing'
      }
    },
    opportunityKPIs: [
      {
        id: 'parts-opp-1',
        title: 'Parts Counter Sales Revenue',
        value: '$45K/month',
        trend: 'Opportunity: +$28K/month',
        roiUpside: '$28K/month',
        priority: 'high',
        insights: {
          title: 'Grow Counter Sales Revenue',
          description: 'Current counter sales are $45K/month. Implementing better counter sales processes and customer engagement could increase by $28K/month.',
          actionItems: [
            'Train parts counter staff on upselling',
            'Create parts counter display promotions',
            'Implement customer loyalty programs',
            'Develop counter sales scripts'
          ],
          impact: '$336K annual revenue increase',
          timeline: '3-5 weeks training'
        }
      },
      {
        id: 'parts-opp-2',
        title: 'Parts Fill Rate',
        value: '78%',
        trend: 'Target: 92%',
        roiUpside: '$15K/month',
        priority: 'medium',
        insights: {
          title: 'Improve Parts Availability',
          description: 'Current fill rate is 78%. Increasing to 92% would reduce service delays and capture more parts sales from walk-in customers.',
          actionItems: [
            'Analyze parts demand patterns',
            'Optimize parts inventory levels',
            'Implement parts forecasting system',
            'Create parts supplier relationships'
          ],
          impact: '$180K annual revenue increase',
          timeline: '6-10 weeks to optimize'
        }
      }
    ]
  },
  {
    id: 'marketing',
    title: 'Marketing / eCommerce Director',
    icon: <Megaphone className="w-5 h-5" />,
    positiveKPI: {
      id: 'mkt-pos-1',
      title: 'Digital Marketing ROI',
      value: '8.2:1',
      trend: '+1.3:1',
      priority: 'high',
      insights: {
        title: 'Strong Marketing Performance',
        description: 'Marketing ROI of 8.2:1 is excellent, indicating efficient spend and strong lead generation. This is above industry average of 6.9:1.',
        actionItems: [
          'Continue current digital marketing strategies',
          'Maintain focus on high-ROI channels',
          'Keep optimizing ad spend allocation'
        ],
        impact: 'Efficient marketing spend',
        timeline: 'Ongoing'
      }
    },
    opportunityKPIs: [
      {
        id: 'mkt-opp-1',
        title: 'Website Conversion Rate',
        value: '2.8%',
        trend: 'Industry: 4.2%',
        roiUpside: '$42K/month',
        priority: 'high',
        insights: {
          title: 'Website Optimization Opportunity',
          description: 'Current website conversion is 2.8% vs 4.2% industry average. With 15,000 monthly visitors, improving to 4.2% would add 210 leads/month worth $42K.',
          actionItems: [
            'Optimize website landing pages',
            'Implement A/B testing program',
            'Improve mobile user experience',
            'Add conversion tracking and analytics'
          ],
          impact: '$504K annual revenue increase',
          timeline: '6-10 weeks to optimize'
        }
      },
      {
        id: 'mkt-opp-2',
        title: 'Email Marketing Engagement',
        value: '12%',
        trend: 'Target: 28%',
        roiUpside: '$25K/month',
        priority: 'medium',
        insights: {
          title: 'Email Marketing Revenue Opportunity',
          description: 'Current email engagement is 12%. Increasing to 28% through better segmentation and personalization would drive more service appointments and sales.',
          actionItems: [
            'Implement email segmentation strategy',
            'Create personalized email campaigns',
            'Develop automated email sequences',
            'Track email engagement metrics'
          ],
          impact: '$300K annual revenue increase',
          timeline: '4-8 weeks implementation'
        }
      }
    ]
  }
];

interface KPIDrawerProps {
  kpi: KPI;
  isOpen: boolean;
  onClose: () => void;
}

const KPIDrawer: React.FC<KPIDrawerProps> = ({ kpi, isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{kpi.insights.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{kpi.title}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-gray-700">{kpi.insights.description}</p>
              </div>

              {kpi.roiUpside && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-900">Revenue Opportunity</span>
                  </div>
                  <p className="text-2xl font-bold text-green-700">{kpi.roiUpside}/month</p>
                  <p className="text-sm text-green-600 mt-1">{kpi.insights.impact}</p>
                </div>
              )}

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Action Items</h4>
                <ul className="space-y-2">
                  {kpi.insights.actionItems.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <ChevronRight className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Expected Impact</p>
                  <p className="font-semibold text-gray-900">{kpi.insights.impact}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Timeline</p>
                  <p className="font-semibold text-gray-900">{kpi.insights.timeline}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

interface DAICognitiveDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DAICognitiveDashboardModal: React.FC<DAICognitiveDashboardModalProps> = ({ isOpen, onClose }) => {
  const [selectedKPI, setSelectedKPI] = useState<KPI | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={onClose}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-4 md:inset-8 lg:inset-12 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">dAI Cognitive Dashboard</h2>
                  <p className="text-blue-100 mt-1">Executive insights for Dealer Principals & GMs</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-blue-600 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-7xl mx-auto space-y-6">
                  {managerSections.map((section) => (
                    <motion.div
                      key={section.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
                    >
                      {/* Section Header */}
                      <button
                        onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                        className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                            {section.icon}
                          </div>
                          <div className="text-left">
                            <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                            <p className="text-sm text-gray-500 mt-1">
                              {expandedSection === section.id ? 'Click to collapse' : 'Click to expand'}
                            </p>
                          </div>
                        </div>
                        <ChevronRight
                          className={`w-5 h-5 text-gray-400 transition-transform ${
                            expandedSection === section.id ? 'rotate-90' : ''
                          }`}
                        />
                      </button>

                      {/* Section Content */}
                      <AnimatePresence>
                        {expandedSection === section.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 pb-6 space-y-4 border-t border-gray-200 pt-6">
                              {/* Positive KPI */}
                              <div>
                                <div className="flex items-center gap-2 mb-3">
                                  <TrendingUp className="w-4 h-4 text-green-600" />
                                  <span className="text-sm font-semibold text-green-700">Recognition</span>
                                </div>
                                <div
                                  onClick={() => setSelectedKPI(section.positiveKPI)}
                                  className="bg-green-50 border border-green-200 rounded-lg p-4 cursor-pointer hover:bg-green-100 transition-colors"
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h4 className="font-semibold text-gray-900">{section.positiveKPI.title}</h4>
                                      <p className="text-2xl font-bold text-green-700 mt-1">{section.positiveKPI.value}</p>
                                      {section.positiveKPI.trend && (
                                        <p className="text-sm text-green-600 mt-1">{section.positiveKPI.trend}</p>
                                      )}
                                    </div>
                                    <Info className="w-5 h-5 text-green-600" />
                                  </div>
                                </div>
                              </div>

                              {/* Opportunity KPIs */}
                              <div>
                                <div className="flex items-center gap-2 mb-3">
                                  <AlertCircle className="w-4 h-4 text-orange-600" />
                                  <span className="text-sm font-semibold text-orange-700">Opportunities</span>
                                </div>
                                <div className="space-y-3">
                                  {section.opportunityKPIs.map((kpi) => (
                                    <div
                                      key={kpi.id}
                                      onClick={() => setSelectedKPI(kpi)}
                                      className="bg-orange-50 border border-orange-200 rounded-lg p-4 cursor-pointer hover:bg-orange-100 transition-colors"
                                    >
                                      <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-semibold text-gray-900">{kpi.title}</h4>
                                            {kpi.priority === 'high' && (
                                              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded">
                                                HIGH PRIORITY
                                              </span>
                                            )}
                                          </div>
                                          <p className="text-xl font-bold text-orange-700">{kpi.value}</p>
                                          {kpi.trend && (
                                            <p className="text-sm text-gray-600 mt-1">{kpi.trend}</p>
                                          )}
                                          {kpi.roiUpside && (
                                            <p className="text-sm font-semibold text-green-700 mt-2">
                                              Revenue Opportunity: {kpi.roiUpside}/month
                                            </p>
                                          )}
                                        </div>
                                        <Info className="w-5 h-5 text-orange-600 mt-1" />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* KPI Drawer */}
      {selectedKPI && (
        <KPIDrawer
          kpi={selectedKPI}
          isOpen={!!selectedKPI}
          onClose={() => setSelectedKPI(null)}
        />
      )}
    </>
  );
};

export default DAICognitiveDashboardModal;

