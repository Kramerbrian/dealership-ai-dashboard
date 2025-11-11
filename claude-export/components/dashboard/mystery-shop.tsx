import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TierGate } from '@/components/TierGate'
import { 
  ShoppingCart, 
  Calendar, 
  Clock, 
  Star, 
  MessageSquare,
  Phone,
  Mail,
  Globe,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Users,
  Target
} from 'lucide-react'

interface MysteryShopTest {
  id: string
  type: 'email' | 'phone' | 'chat' | 'website'
  date: string
  score: number
  status: 'completed' | 'scheduled' | 'in_progress'
  duration: number
  results: {
    response_time: number
    quality_score: number
    follow_up: boolean
    conversion: boolean
  }
  notes: string
  recommendations: string[]
}

const mysteryShops: MysteryShopTest[] = [
  {
    id: '1',
    type: 'email',
    date: '2024-01-15',
    score: 88,
    status: 'completed',
    duration: 2,
    results: {
      response_time: 15,
      quality_score: 85,
      follow_up: true,
      conversion: true
    },
    notes: 'Excellent response time and helpful information. Follow-up was prompt.',
    recommendations: ['Continue current email template', 'Add more personalization']
  },
  {
    id: '2',
    type: 'phone',
    date: '2024-01-10',
    score: 75,
    status: 'completed',
    duration: 5,
    results: {
      response_time: 2,
      quality_score: 70,
      follow_up: false,
      conversion: false
    },
    notes: 'Quick pickup but rushed conversation. No follow-up provided.',
    recommendations: ['Improve phone script', 'Implement follow-up process']
  },
  {
    id: '3',
    type: 'chat',
    date: '2024-01-08',
    score: 92,
    status: 'completed',
    duration: 3,
    results: {
      response_time: 1,
      quality_score: 95,
      follow_up: true,
      conversion: true
    },
    notes: 'Outstanding chat experience. Immediate response and very helpful.',
    recommendations: ['Use as training example', 'Expand chat availability']
  }
]

export function MysteryShop() {
  const [selectedTest, setSelectedTest] = useState<MysteryShopTest | null>(null)
  const [showScheduleModal, setShowScheduleModal] = useState(false)

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-5 w-5" />
      case 'phone': return <Phone className="h-5 w-5" />
      case 'chat': return <MessageSquare className="h-5 w-5" />
      case 'website': return <Globe className="h-5 w-5" />
      default: return <ShoppingCart className="h-5 w-5" />
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 80) return 'text-blue-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const averageScore = mysteryShops.reduce((sum, test) => sum + test.score, 0) / mysteryShops.length
  const totalTests = mysteryShops.length
  const completedTests = mysteryShops.filter(test => test.status === 'completed').length

  return (
    <TierGate requiredTier="ENTERPRISE" feature="Mystery Shop Automation">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Mystery Shop Automation</h2>
          <p className="text-gray-600">AI-powered customer experience testing and optimization</p>
        </div>

        {/* Performance Overview */}
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-6 w-6 text-purple-600" />
              <span>Performance Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">{Math.round(averageScore)}</div>
                <div className="text-sm text-gray-600">Average Score</div>
                <div className="text-xs text-green-600">+5 from last month</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{completedTests}</div>
                <div className="text-sm text-gray-600">Tests Completed</div>
                <div className="text-xs text-gray-500">This month</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">85%</div>
                <div className="text-sm text-gray-600">Conversion Rate</div>
                <div className="text-xs text-green-600">+12% from last month</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">2.1m</div>
                <div className="text-sm text-gray-600">Avg Response Time</div>
                <div className="text-xs text-green-600">-0.3m from last month</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule New Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-6 w-6 text-blue-600" />
              <span>Schedule New Test</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button 
                className="h-20 flex flex-col items-center justify-center space-y-2"
                onClick={() => setShowScheduleModal(true)}
              >
                <Mail className="h-6 w-6" />
                <span className="text-sm">Email Inquiry</span>
              </Button>
              <Button 
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2"
                onClick={() => setShowScheduleModal(true)}
              >
                <Phone className="h-6 w-6" />
                <span className="text-sm">Phone Call</span>
              </Button>
              <Button 
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2"
                onClick={() => setShowScheduleModal(true)}
              >
                <MessageSquare className="h-6 w-6" />
                <span className="text-sm">Live Chat</span>
              </Button>
              <Button 
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2"
                onClick={() => setShowScheduleModal(true)}
              >
                <Globe className="h-6 w-6" />
                <span className="text-sm">Website UX</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Test History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-6 w-6 text-gray-600" />
              <span>Test History</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mysteryShops.map((test) => (
                <div 
                  key={test.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => setSelectedTest(test)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(test.type)}
                      <span className="font-medium capitalize">{test.type} Test</span>
                    </div>
                    <div className="text-sm text-gray-600">{test.date}</div>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(test.status)}`}>
                      {test.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(test.score)}`}>
                        {test.score}
                      </div>
                      <div className="text-xs text-gray-500">Score</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-lg font-semibold">{test.duration}m</div>
                      <div className="text-xs text-gray-500">Duration</div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {test.results.conversion ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      )}
                      <span className="text-sm">
                        {test.results.conversion ? 'Converted' : 'No Conversion'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Test Detail Modal */}
        {selectedTest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">
                  {selectedTest.type.charAt(0).toUpperCase() + selectedTest.type.slice(1)} Test Results
                </h3>
                <Button 
                  variant="ghost" 
                  onClick={() => setSelectedTest(null)}
                >
                  ×
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Test Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="font-medium">Date:</span>
                        <span>{selectedTest.date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Duration:</span>
                        <span>{selectedTest.duration} minutes</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Response Time:</span>
                        <span>{selectedTest.results.response_time} minutes</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Quality Score:</span>
                        <span>{selectedTest.results.quality_score}/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Follow-up:</span>
                        <span className={selectedTest.results.follow_up ? 'text-green-600' : 'text-red-600'}>
                          {selectedTest.results.follow_up ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Conversion:</span>
                        <span className={selectedTest.results.conversion ? 'text-green-600' : 'text-red-600'}>
                          {selectedTest.results.conversion ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedTest.recommendations.map((rec, idx) => (
                        <div key={idx} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          <span className="text-sm">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">{selectedTest.notes}</p>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6 flex justify-end">
                <Button onClick={() => setSelectedTest(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Schedule Modal */}
        {showScheduleModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Schedule Mystery Shop Test</h3>
                <Button 
                  variant="ghost" 
                  onClick={() => setShowScheduleModal(false)}
                >
                  ×
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Test Type
                  </label>
                  <select className="w-full p-2 border border-gray-300 rounded-lg">
                    <option>Email Inquiry</option>
                    <option>Phone Call</option>
                    <option>Live Chat</option>
                    <option>Website UX</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Schedule Date
                  </label>
                  <input 
                    type="datetime-local" 
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Test Scenario
                  </label>
                  <select className="w-full p-2 border border-gray-300 rounded-lg">
                    <option>New Car Inquiry</option>
                    <option>Service Appointment</option>
                    <option>Trade-in Evaluation</option>
                    <option>Financing Question</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowScheduleModal(false)}
                >
                  Cancel
                </Button>
                <Button onClick={() => setShowScheduleModal(false)}>
                  Schedule Test
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </TierGate>
  )
}
