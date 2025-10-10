"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Star, 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown,
  Send,
  RefreshCw,
  Filter,
  Search,
  Zap,
  Brain,
  Target,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Calendar
} from 'lucide-react';

interface Review {
  id: string;
  platform: string;
  author: string;
  rating: number;
  content: string;
  date: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  needsResponse: boolean;
  response?: string;
  responseDate?: string;
  tone: 'professional' | 'friendly' | 'witty' | 'empathetic';
}

interface ReputationMetrics {
  overallRating: number;
  totalReviews: number;
  responseRate: number;
  averageResponseTime: string;
  sentimentScore: number;
  recentTrend: 'up' | 'down' | 'stable';
  platformBreakdown: {
    google: number;
    yelp: number;
    facebook: number;
    cars: number;
  };
}

export default function ReputationEngine() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [metrics, setMetrics] = useState<ReputationMetrics | null>(null);
  const [selectedTone, setSelectedTone] = useState<'professional' | 'friendly' | 'witty' | 'empathetic'>('professional');
  const [customResponse, setCustomResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSentiment, setFilterSentiment] = useState('all');

  useEffect(() => {
    // Mock data - in production, this would come from your review management API
    const mockReviews: Review[] = [
      {
        id: '1',
        platform: 'Google',
        author: 'Sarah Johnson',
        rating: 5,
        content: 'Excellent service! The team was professional and helped me find the perfect car within my budget. Highly recommend!',
        date: '2024-12-15T10:30:00Z',
        sentiment: 'positive',
        needsResponse: false,
        response: 'Thank you so much for the wonderful review, Sarah! We\'re thrilled you had such a positive experience with us.',
        responseDate: '2024-12-15T11:00:00Z',
        tone: 'friendly'
      },
      {
        id: '2',
        platform: 'Yelp',
        author: 'Mike Chen',
        rating: 4,
        content: 'Good selection of vehicles and fair pricing. The sales process was straightforward, though the financing took longer than expected.',
        date: '2024-12-14T15:20:00Z',
        sentiment: 'positive',
        needsResponse: true,
        tone: 'professional'
      },
      {
        id: '3',
        platform: 'Facebook',
        author: 'Emily Rodriguez',
        rating: 2,
        content: 'Had a frustrating experience with the service department. My car was in for a simple repair but took 3 days longer than promised.',
        date: '2024-12-13T09:15:00Z',
        sentiment: 'negative',
        needsResponse: true,
        tone: 'empathetic'
      },
      {
        id: '4',
        platform: 'Cars.com',
        author: 'David Wilson',
        rating: 5,
        content: 'Outstanding customer service from start to finish. The team went above and beyond to make sure I was completely satisfied.',
        date: '2024-12-12T14:45:00Z',
        sentiment: 'positive',
        needsResponse: false,
        response: 'We truly appreciate your kind words, David! It\'s our pleasure to provide exceptional service.',
        responseDate: '2024-12-12T16:30:00Z',
        tone: 'professional'
      },
      {
        id: '5',
        platform: 'Google',
        author: 'Lisa Park',
        rating: 3,
        content: 'Decent experience overall. The car I bought is good, but the communication during the process could have been better.',
        date: '2024-12-11T11:30:00Z',
        sentiment: 'neutral',
        needsResponse: true,
        tone: 'professional'
      }
    ];

    const mockMetrics: ReputationMetrics = {
      overallRating: 4.2,
      totalReviews: 1247,
      responseRate: 78,
      averageResponseTime: '4.2 hours',
      sentimentScore: 82,
      recentTrend: 'up',
      platformBreakdown: {
        google: 4.3,
        yelp: 4.1,
        facebook: 4.0,
        cars: 4.4
      }
    };

    setReviews(mockReviews);
    setMetrics(mockMetrics);
  }, []);

  const generateAIResponse = async (review: Review) => {
    setLoading(true);
    try {
      // Simulate AI response generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const responses = {
        professional: 'Thank you for your feedback. We appreciate your business and look forward to serving you again.',
        friendly: 'Thanks so much for the great review! We\'re thrilled you had such a positive experience with us.',
        witty: 'Wow, you\'ve made our day! We\'re practically blushing from all the praise. 😊',
        empathetic: 'We truly appreciate you taking the time to share your experience. Your feedback means everything to us.'
      };

      const response = responses[selectedTone];
      
      setReviews(prev => prev.map(r => 
        r.id === review.id 
          ? { ...r, response, responseDate: new Date().toISOString(), needsResponse: false }
          : r
      ));
    } catch (error) {
      console.error('Error generating response:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendResponse = (reviewId: string) => {
    setReviews(prev => prev.map(r => 
      r.id === reviewId 
        ? { 
            ...r, 
            response: customResponse || r.response, 
            responseDate: new Date().toISOString(), 
            needsResponse: false 
          }
        : r
    ));
    setCustomResponse('');
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSentiment = filterSentiment === 'all' || review.sentiment === filterSentiment;
    return matchesSearch && matchesSentiment;
  });

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-100';
      case 'negative': return 'text-red-600 bg-red-100';
      case 'neutral': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getToneIcon = (tone: string) => {
    switch (tone) {
      case 'professional': return <Target className="h-4 w-4" />;
      case 'friendly': return <ThumbsUp className="h-4 w-4" />;
      case 'witty': return <Zap className="h-4 w-4" />;
      case 'empathetic': return <Heart className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reputation Engine</h1>
          <p className="text-gray-600">AI-powered review management and response automation</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4" />
            Sync Reviews
          </Button>
          <Button>
            <Brain className="h-4 w-4" />
            AI Analysis
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Star className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{metrics.overallRating}</div>
                  <div className="text-sm text-gray-600">Overall Rating</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{metrics.totalReviews}</div>
                  <div className="text-sm text-gray-600">Total Reviews</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{metrics.responseRate}%</div>
                  <div className="text-sm text-gray-600">Response Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Clock className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{metrics.averageResponseTime}</div>
                  <div className="text-sm text-gray-600">Avg Response Time</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="reviews" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="responses">Auto-Responses</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="reviews" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search reviews..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <select
                    value={filterSentiment}
                    onChange={(e) => setFilterSentiment(e.target.value)}
                    className="px-3 py-2 border rounded-md text-sm"
                  >
                    <option value="all">All Sentiments</option>
                    <option value="positive">Positive</option>
                    <option value="negative">Negative</option>
                    <option value="neutral">Neutral</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reviews List */}
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{review.author}</h3>
                        <div className="flex items-center gap-2">
                          <div className="flex">{getRatingStars(review.rating)}</div>
                          <span className="text-sm text-gray-500">{review.platform}</span>
                          <Badge className={getSentimentColor(review.sentiment)}>
                            {review.sentiment}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(review.date).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4">{review.content}</p>
                  
                  {review.response ? (
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">Your Response</span>
                        <span className="text-xs text-blue-700">
                          {review.responseDate && new Date(review.responseDate).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-blue-800">{review.response}</p>
                    </div>
                  ) : review.needsResponse ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-800">Needs Response</span>
                      </div>
                      
                      <div className="flex gap-2">
                        <select
                          value={selectedTone}
                          onChange={(e) => setSelectedTone(e.target.value as any)}
                          className="px-3 py-2 border rounded-md text-sm"
                        >
                          <option value="professional">Professional</option>
                          <option value="friendly">Friendly</option>
                          <option value="witty">Witty</option>
                          <option value="empathetic">Empathetic</option>
                        </select>
                        
                        <Button
                          size="sm"
                          onClick={() => generateAIResponse(review)}
                          disabled={loading}
                        >
                          {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
                          Generate AI Response
                        </Button>
                      </div>
                      
                      <Textarea
                        placeholder="Or write a custom response..."
                        value={customResponse}
                        onChange={(e) => setCustomResponse(e.target.value)}
                        rows={3}
                      />
                      
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => sendResponse(review.id)}>
                          <Send className="h-4 w-4" />
                          Send Response
                        </Button>
                        <Button size="sm" variant="outline">
                          Skip
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="responses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Response Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Professional</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    "Thank you for your feedback. We appreciate your business and look forward to serving you again."
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <ThumbsUp className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Friendly</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    "Thanks so much for the great review! We're thrilled you had such a positive experience with us."
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4 text-purple-600" />
                    <span className="font-medium">Witty</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    "Wow, you've made our day! We're practically blushing from all the praise. 😊"
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="h-4 w-4 text-red-600" />
                    <span className="font-medium">Empathetic</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    "We truly appreciate you taking the time to share your experience. Your feedback means everything to us."
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(metrics?.platformBreakdown || {}).map(([platform, rating]) => (
                    <div key={platform} className="flex items-center justify-between">
                      <span className="capitalize">{platform}</span>
                      <div className="flex items-center gap-2">
                        <div className="flex">{getRatingStars(rating)}</div>
                        <span className="text-sm font-medium">{rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Response Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Average Response Time</span>
                    <span className="font-medium">{metrics?.averageResponseTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Response Rate</span>
                    <span className="font-medium">{metrics?.responseRate}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Sentiment Score</span>
                    <span className="font-medium">{metrics?.sentimentScore}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Add missing Heart icon component
const Heart = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
  </svg>
);