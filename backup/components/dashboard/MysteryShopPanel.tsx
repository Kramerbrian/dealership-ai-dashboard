/**
 * Mystery Shop Panel Component
 * Enterprise feature for customer experience evaluation
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Phone,
  Mail,
  Globe,
  Building,
  TrendingUp,
  Star,
  Plus,
  Eye,
  Download
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TierGate } from '@/components/ui/tier-gate';
import { MysteryShopTest, MysteryShopReport, MysteryShopEngine } from '@/lib/mystery-shop';

interface MysteryShopPanelProps {
  currentTier: 'FREE' | 'PRO' | 'ENTERPRISE';
  dealershipId: string;
}

const TEST_TYPE_ICONS = {
  phone: Phone,
  email: Mail,
  website: Globe,
  visit: Building
};

const STATUS_COLORS = {
  scheduled: 'text-blue-600',
  in_progress: 'text-yellow-600',
  completed: 'text-green-600',
  cancelled: 'text-red-600'
};

const STATUS_BADGES = {
  scheduled: { label: 'Scheduled', variant: 'secondary' as const },
  in_progress: { label: 'In Progress', variant: 'outline' as const },
  completed: { label: 'Completed', variant: 'default' as const },
  cancelled: { label: 'Cancelled', variant: 'destructive' as const }
};

export function MysteryShopPanel({ currentTier, dealershipId }: MysteryShopPanelProps) {
  const [tests, setTests] = useState<MysteryShopTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState<MysteryShopTest | null>(null);

  useEffect(() => {
    fetchTests();
  }, [dealershipId]);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/mystery-shop/tests?dealershipId=${dealershipId}`);
      const data = await response.json();
      
      if (data.success) {
        setTests(data.data);
      }
    } catch (error) {
      console.error('Error fetching tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleTest = async (testType: string, focusAreas: string[]) => {
    try {
      const response = await fetch('/api/mystery-shop/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealershipId,
          testType,
          focusAreas
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setTests(prev => [...prev, data.test]);
        setShowScheduleModal(false);
      }
    } catch (error) {
      console.error('Error scheduling test:', error);
    }
  };

  const getTestTypeInfo = (testType: string) => {
    return MysteryShopEngine.getTestTypeInfo(testType);
  };

  const getFocusAreaInfo = (focusArea: string) => {
    return MysteryShopEngine.getFocusAreaInfo(focusArea);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading mystery shop data...</p>
        </div>
      </div>
    );
  }

  return (
    <TierGate 
      requiredTier="ENTERPRISE" 
      currentTier={currentTier}
      feature="mystery_shop"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Mystery Shop</h2>
            <p className="text-gray-600">Evaluate your customer experience with professional mystery shopping</p>
          </div>
          <Button 
            onClick={() => setShowScheduleModal(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Schedule Test
          </Button>
        </div>
      </motion.div>

      {/* Test Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Tests</p>
                  <p className="text-2xl font-bold">{tests.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold">
                    {tests.filter(t => t.status === 'completed').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Scheduled</p>
                  <p className="text-2xl font-bold">
                    {tests.filter(t => t.status === 'scheduled').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Star className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Avg Score</p>
                  <p className="text-2xl font-bold">
                    {tests.filter(t => t.results).length > 0 
                      ? Math.round(tests.filter(t => t.results).reduce((sum, t) => sum + (t.results?.overallScore || 0), 0) / tests.filter(t => t.results).length)
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Tests List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Recent Tests</CardTitle>
            <CardDescription>View and manage your mystery shop tests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tests.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No mystery shop tests yet</p>
                  <Button onClick={() => setShowScheduleModal(true)}>
                    Schedule Your First Test
                  </Button>
                </div>
              ) : (
                tests.map((test, index) => {
                  const typeInfo = getTestTypeInfo(test.testType);
                  const Icon = TEST_TYPE_ICONS[test.testType as keyof typeof TEST_TYPE_ICONS];
                  
                  return (
                    <motion.div
                      key={test.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Card className="hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => setSelectedTest(test)}>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="p-3 bg-purple-100 rounded-lg">
                                <Icon className="w-6 h-6 text-purple-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg">{typeInfo.name}</h3>
                                <p className="text-gray-600">{typeInfo.description}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge {...STATUS_BADGES[test.status]}>
                                    {STATUS_BADGES[test.status].label}
                                  </Badge>
                                  <span className="text-sm text-gray-500">
                                    {formatDate(test.scheduledAt)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              {test.results && (
                                <div className="text-right">
                                  <p className="text-2xl font-bold text-green-600">
                                    {test.results.overallScore}
                                  </p>
                                  <p className="text-sm text-gray-600">Score</p>
                                </div>
                              )}
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </Button>
                            </div>
                          </div>
                          
                          {test.focusAreas && (
                            <div className="mt-4 pt-4 border-t">
                              <p className="text-sm text-gray-600 mb-2">Focus Areas:</p>
                              <div className="flex flex-wrap gap-2">
                                {test.focusAreas.map((area, areaIndex) => (
                                  <Badge key={areaIndex} variant="outline" className="text-xs">
                                    {getFocusAreaInfo(area)}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <ScheduleTestModal
          onClose={() => setShowScheduleModal(false)}
          onSchedule={handleScheduleTest}
        />
      )}

      {/* Test Details Modal */}
      {selectedTest && (
        <TestDetailsModal
          test={selectedTest}
          onClose={() => setSelectedTest(null)}
        />
      )}
    </TierGate>
  );
}

// Schedule Test Modal Component
function ScheduleTestModal({ onClose, onSchedule }: { 
  onClose: () => void; 
  onSchedule: (testType: string, focusAreas: string[]) => void;
}) {
  const [testType, setTestType] = useState('phone');
  const [focusAreas, setFocusAreas] = useState<string[]>([]);

  const testTypes = [
    { value: 'phone', label: 'Phone Test', description: 'Test customer service via phone call' },
    { value: 'email', label: 'Email Test', description: 'Test email response quality and speed' },
    { value: 'website', label: 'Website Test', description: 'Test website usability and information' },
    { value: 'visit', label: 'In-Person Visit', description: 'Test in-person customer experience' }
  ];

  const availableFocusAreas = [
    'customer_service',
    'product_knowledge',
    'response_time',
    'professionalism',
    'follow_up',
    'communication',
    'problem_solving',
    'sales_process'
  ];

  const handleSubmit = () => {
    onSchedule(testType, focusAreas);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
      >
        <h3 className="text-lg font-semibold mb-4">Schedule Mystery Shop Test</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Test Type</label>
            <select 
              value={testType} 
              onChange={(e) => setTestType(e.target.value)}
              className="w-full p-2 border rounded-lg"
            >
              {testTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Focus Areas</label>
            <div className="space-y-2">
              {availableFocusAreas.map(area => (
                <label key={area} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={focusAreas.includes(area)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFocusAreas([...focusAreas, area]);
                      } else {
                        setFocusAreas(focusAreas.filter(a => a !== area));
                      }
                    }}
                  />
                  <span className="text-sm">{MysteryShopEngine.getFocusAreaInfo(area)}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="flex-1">
            Schedule Test
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// Test Details Modal Component
function TestDetailsModal({ test, onClose }: { 
  test: MysteryShopTest; 
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Test Details</h3>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
        
        {test.results ? (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {test.results.overallScore}
              </div>
              <p className="text-gray-600">Overall Score</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(test.results.categories).map(([category, score]) => (
                <div key={category} className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{score}</div>
                  <div className="text-sm text-gray-600 capitalize">{category}</div>
                </div>
              ))}
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Feedback</h4>
              <p className="text-gray-700">{test.results.feedback}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Strengths</h4>
                <ul className="space-y-1">
                  {test.results.strengths.map((strength, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Recommendations</h4>
                <ul className="space-y-1">
                  {test.results.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Test results will be available after completion</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
