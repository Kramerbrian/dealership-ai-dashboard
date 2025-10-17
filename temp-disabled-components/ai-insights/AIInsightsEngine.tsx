"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Target,
  Zap,
  BarChart3,
  Users,
  DollarSign,
  Clock,
  Star,
  ArrowRight,
  RefreshCw,
  Filter,
  Search,
  Download,
  Share,
  Bookmark,
  Flag,
  MessageSquare,
  Eye,
  MousePointer,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Award,
  Trophy,
  Crown,
  Sparkles,
  Rocket,
  Megaphone,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Headphones,
  Mic,
  Video,
  Camera,
  Image,
  FileText,
  Link,
  Hash,
  AtSign,
  Plus,
  Minus,
  X,
  Check,
  AlertCircle,
  Info,
  HelpCircle,
  Settings,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Copy,
  Edit,
  Trash2,
  Save,
  Upload,
  Download as DownloadIcon,
  Send,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock as ClockIcon,
  Timer,
  Stopwatch,
  Play,
  Pause,
  Square,
  RotateCcw,
  RotateCw,
  Maximize,
  Minimize,
  Move,
  Grip,
  Lock,
  Unlock,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Key,
  User,
  UserCheck,
  UserX,
  Users2,
  UserPlus,
  UserMinus,
  Crown as CrownIcon,
  Star as StarIcon,
  Heart as HeartIcon,
  ThumbsUp as ThumbsUpIcon,
  ThumbsDown as ThumbsDownIcon,
  Award as AwardIcon,
  Trophy as TrophyIcon,
  Sparkles as SparklesIcon,
  Rocket as RocketIcon,
  Megaphone as MegaphoneIcon,
  Globe as GlobeIcon,
  Smartphone as SmartphoneIcon,
  Monitor as MonitorIcon,
  Tablet as TabletIcon,
  Headphones as HeadphonesIcon,
  Mic as MicIcon,
  Video as VideoIcon,
  Camera as CameraIcon,
  Image as ImageIcon,
  FileText as FileTextIcon,
  Link as LinkIcon,
  Hash as HashIcon,
  AtSign as AtSignIcon,
  Plus as PlusIcon,
  Minus as MinusIcon,
  X as XIcon,
  Check as CheckIcon,
  AlertCircle as AlertCircleIcon,
  Info as InfoIcon,
  HelpCircle as HelpCircleIcon,
  Settings as SettingsIcon,
  MoreHorizontal as MoreHorizontalIcon,
  ChevronDown as ChevronDownIcon,
  ChevronUp as ChevronUpIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ExternalLink as ExternalLinkIcon,
  Copy as CopyIcon,
  Edit as EditIcon,
  Trash2 as Trash2Icon,
  Save as SaveIcon,
  Upload as UploadIcon,
  Send as SendIcon,
  Mail as MailIcon,
  Phone as PhoneIcon,
  MapPin as MapPinIcon,
  Calendar as CalendarIcon,
  Timer as TimerIcon,
  Stopwatch as StopwatchIcon,
  Play as PlayIcon,
  Pause as PauseIcon,
  Square as SquareIcon,
  RotateCcw as RotateCcwIcon,
  RotateCw as RotateCwIcon,
  Maximize as MaximizeIcon,
  Minimize as MinimizeIcon,
  Move as MoveIcon,
  Grip as GripIcon,
  Lock as LockIcon,
  Unlock as UnlockIcon,
  Shield as ShieldIcon,
  ShieldCheck as ShieldCheckIcon,
  ShieldAlert as ShieldAlertIcon,
  Key as KeyIcon
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import DocumentUploader from './DocumentUploader';
import { aiFallbackService } from '@/src/lib/ai-fallback';

interface AIInsight {
  id: string;
  type: 'opportunity' | 'threat' | 'trend' | 'recommendation' | 'alert' | 'achievement';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: number; // 1-100
  confidence: number; // 1-100
  source: string;
  category: string;
  tags: string[];
  timestamp: string;
  actionRequired: boolean;
  actionText?: string;
  actionUrl?: string;
  metrics: {
    before: number;
    after: number;
    change: number;
    changeType: 'increase' | 'decrease' | 'neutral';
  };
  relatedInsights: string[];
  aiGenerated: boolean;
  verified: boolean;
  cost: number;
  effort: 'low' | 'medium' | 'high';
  timeframe: 'immediate' | 'short' | 'medium' | 'long';
}

interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  impact: number;
  effort: 'low' | 'medium' | 'high';
  cost: number;
  timeframe: 'immediate' | 'short' | 'medium' | 'long';
  roi: number;
  successRate: number;
  prerequisites: string[];
  steps: string[];
  expectedOutcome: string;
  metrics: {
    visibility: number;
    engagement: number;
    conversion: number;
    revenue: number;
  };
  aiGenerated: boolean;
  verified: boolean;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assignedTo?: string;
  dueDate?: string;
  progress: number;
}

interface AIInsightsMetrics {
  totalInsights: number;
  highPriorityInsights: number;
  actionableInsights: number;
  aiGeneratedInsights: number;
  verifiedInsights: number;
  averageImpact: number;
  averageConfidence: number;
  totalRecommendations: number;
  activeRecommendations: number;
  completedRecommendations: number;
  averageROI: number;
  successRate: number;
}

export default function AIInsightsEngine() {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [metrics, setMetrics] = useState<AIInsightsMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    setLoading(true);
    try {
      // Try to load real insights first, fallback to mock if API is unavailable
      let insights: AIInsight[] = [];
      let recommendations: AIRecommendation[] = [];
      
      try {
        // Try to fetch from API
        const response = await fetch('/api/ai-insights');
        if (response.ok) {
          const data = await response.json();
          insights = data.insights || [];
          recommendations = data.recommendations || [];
        } else {
          throw new Error('API not available');
        }
      } catch (error) {
        console.warn('API not available, using fallback data');
        // Use fallback service
        insights = await aiFallbackService.generateInsights('default', 'AI Insights Engine');
        recommendations = await aiFallbackService.generateRecommendations('default');
      }

      // If no insights from API, use mock data
      if (insights.length === 0) {
        const mockInsights: AIInsight[] = [
        {
          id: '1',
          type: 'opportunity',
          priority: 'high',
          title: 'LinkedIn Video Content Surge',
          description: 'LinkedIn video posts are performing 40% better than static content. Your dealership could capitalize on this trend by creating more video content showcasing vehicles and customer testimonials.',
          impact: 85,
          confidence: 92,
          source: 'LinkedIn Analytics',
          category: 'content',
          tags: ['linkedin', 'video', 'content', 'engagement'],
          timestamp: '2024-12-15T10:30:00Z',
          actionRequired: true,
          actionText: 'Create LinkedIn video content strategy',
          actionUrl: '/content/strategy',
          metrics: {
            before: 45,
            after: 63,
            change: 18,
            changeType: 'increase'
          },
          relatedInsights: ['2', '3'],
          aiGenerated: true,
          verified: true,
          cost: 500,
          effort: 'medium',
          timeframe: 'short'
        },
        {
          id: '2',
          type: 'threat',
          priority: 'critical',
          title: 'Competitor Gaining Market Share',
          description: 'Local competitor has increased their Google My Business visibility by 25% in the past month, potentially capturing your local search traffic.',
          impact: 75,
          confidence: 88,
          source: 'Competitive Analysis',
          category: 'seo',
          tags: ['competitor', 'seo', 'local', 'google'],
          timestamp: '2024-12-15T09:15:00Z',
          actionRequired: true,
          actionText: 'Review and improve local SEO strategy',
          actionUrl: '/seo/local',
          metrics: {
            before: 80,
            after: 60,
            change: -20,
            changeType: 'decrease'
          },
          relatedInsights: ['1', '4'],
          aiGenerated: true,
          verified: true,
          cost: 1000,
          effort: 'high',
          timeframe: 'immediate'
        },
        {
          id: '3',
          type: 'trend',
          priority: 'medium',
          title: 'Voice Search Optimization Opportunity',
          description: 'Voice searches for "car dealership near me" have increased 35% this quarter. Optimizing for voice search could capture this growing traffic.',
          impact: 60,
          confidence: 78,
          source: 'Voice Search Analytics',
          category: 'seo',
          tags: ['voice', 'seo', 'local', 'search'],
          timestamp: '2024-12-15T08:45:00Z',
          actionRequired: false,
          metrics: {
            before: 25,
            after: 35,
            change: 10,
            changeType: 'increase'
          },
          relatedInsights: ['2', '5'],
          aiGenerated: true,
          verified: false,
          cost: 300,
          effort: 'low',
          timeframe: 'medium'
        },
        {
          id: '4',
          type: 'recommendation',
          priority: 'high',
          title: 'TikTok Marketing Campaign',
          description: 'TikTok has shown 92% visibility and 89% engagement rates for automotive content. A targeted campaign could significantly boost brand awareness.',
          impact: 90,
          confidence: 85,
          source: 'TikTok Analytics',
          category: 'marketing',
          tags: ['tiktok', 'marketing', 'video', 'engagement'],
          timestamp: '2024-12-15T07:30:00Z',
          actionRequired: true,
          actionText: 'Launch TikTok marketing campaign',
          actionUrl: '/marketing/tiktok',
          metrics: {
            before: 0,
            after: 92,
            change: 92,
            changeType: 'increase'
          },
          relatedInsights: ['1', '6'],
          aiGenerated: true,
          verified: true,
          cost: 2000,
          effort: 'high',
          timeframe: 'short'
        },
        {
          id: '5',
          type: 'alert',
          priority: 'medium',
          title: 'Website Loading Speed Issue',
          description: 'Your website loading speed has decreased by 15% in the past week, potentially affecting SEO rankings and user experience.',
          impact: 55,
          confidence: 95,
          source: 'Website Performance Monitor',
          category: 'technical',
          tags: ['website', 'performance', 'seo', 'speed'],
          timestamp: '2024-12-15T06:20:00Z',
          actionRequired: true,
          actionText: 'Optimize website performance',
          actionUrl: '/technical/performance',
          metrics: {
            before: 85,
            after: 70,
            change: -15,
            changeType: 'decrease'
          },
          relatedInsights: ['2', '7'],
          aiGenerated: false,
          verified: true,
          cost: 800,
          effort: 'medium',
          timeframe: 'immediate'
        },
        {
          id: '6',
          type: 'achievement',
          priority: 'low',
          title: 'AI Response Rate Milestone',
          description: 'Congratulations! Your AI-powered review response rate has reached 92%, exceeding the industry average of 78%.',
          impact: 70,
          confidence: 100,
          source: 'Reputation Engine',
          category: 'reputation',
          tags: ['ai', 'reputation', 'reviews', 'milestone'],
          timestamp: '2024-12-15T05:45:00Z',
          actionRequired: false,
          metrics: {
            before: 78,
            after: 92,
            change: 14,
            changeType: 'increase'
          },
          relatedInsights: ['8'],
          aiGenerated: true,
          verified: true,
          cost: 0,
          effort: 'low',
          timeframe: 'immediate'
        }
      ];

      const mockRecommendations: AIRecommendation[] = [
        {
          id: '1',
          title: 'Implement AI-Powered Chatbot',
          description: 'Deploy an AI chatbot to handle customer inquiries 24/7, improving response times and customer satisfaction.',
          category: 'customer-service',
          priority: 'high',
          impact: 85,
          effort: 'medium',
          cost: 1500,
          timeframe: 'short',
          roi: 250,
          successRate: 90,
          prerequisites: ['AI platform setup', 'Training data preparation'],
          steps: [
            'Choose AI platform (OpenAI, Anthropic, etc.)',
            'Prepare training data and FAQs',
            'Configure chatbot responses',
            'Test with sample conversations',
            'Deploy to website and social media'
          ],
          expectedOutcome: '40% reduction in response time, 25% increase in customer satisfaction',
          metrics: {
            visibility: 15,
            engagement: 30,
            conversion: 20,
            revenue: 5000
          },
          aiGenerated: true,
          verified: true,
          status: 'pending',
          progress: 0
        },
        {
          id: '2',
          title: 'Optimize for Voice Search',
          description: 'Optimize website content and local listings for voice search queries to capture the growing voice search market.',
          category: 'seo',
          priority: 'medium',
          impact: 70,
          effort: 'low',
          cost: 500,
          timeframe: 'medium',
          roi: 180,
          successRate: 85,
          prerequisites: ['Google My Business optimization', 'Local SEO audit'],
          steps: [
            'Research voice search keywords',
            'Optimize FAQ content for natural language',
            'Update Google My Business listing',
            'Create location-specific content',
            'Monitor voice search performance'
          ],
          expectedOutcome: '35% increase in local search visibility',
          metrics: {
            visibility: 35,
            engagement: 15,
            conversion: 25,
            revenue: 3000
          },
          aiGenerated: true,
          verified: true,
          status: 'in_progress',
          progress: 40
        }
      ];

      const mockMetrics: AIInsightsMetrics = {
        totalInsights: 6,
        highPriorityInsights: 3,
        actionableInsights: 5,
        aiGeneratedInsights: 5,
        verifiedInsights: 5,
        averageImpact: 74,
        averageConfidence: 90,
        totalRecommendations: 2,
        activeRecommendations: 1,
        completedRecommendations: 0,
        averageROI: 215,
        successRate: 88
      };

      setInsights(mockInsights);
      setRecommendations(mockRecommendations);
      setMetrics(mockMetrics);
      }
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <Lightbulb className="h-4 w-4 text-green-600" />;
      case 'threat': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'trend': return <TrendingUp className="h-4 w-4 text-blue-600" />;
      case 'recommendation': return <Target className="h-4 w-4 text-purple-600" />;
      case 'alert': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'achievement': return <Trophy className="h-4 w-4 text-gold-600" />;
      default: return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTimeframeColor = (timeframe: string) => {
    switch (timeframe) {
      case 'immediate': return 'text-red-600';
      case 'short': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'long': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const filteredInsights = insights.filter(insight => {
    const matchesType = filterType === 'all' || insight.type === filterType;
    const matchesPriority = filterPriority === 'all' || insight.priority === filterPriority;
    const matchesSearch = insight.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         insight.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         insight.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesPriority && matchesSearch;
  });

  const selectedInsightData = insights.find(i => i.id === selectedInsight);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading AI insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Insights Engine</h1>
          <p className="text-gray-600">Intelligent insights and recommendations powered by AI</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button variant="outline">
            <Share className="h-4 w-4" />
            Share
          </Button>
          <Button onClick={loadInsights} disabled={loading}>
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Brain className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{metrics.totalInsights}</div>
                  <div className="text-sm text-gray-600">Total Insights</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{metrics.highPriorityInsights}</div>
                  <div className="text-sm text-gray-600">High Priority</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Target className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{metrics.actionableInsights}</div>
                  <div className="text-sm text-gray-600">Actionable</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Zap className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{metrics.averageROI}%</div>
                  <div className="text-sm text-gray-600">Avg ROI</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="insights" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="insights" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search insights..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-3 py-2 border rounded-md text-sm"
                  >
                    <option value="all">All Types</option>
                    <option value="opportunity">Opportunities</option>
                    <option value="threat">Threats</option>
                    <option value="trend">Trends</option>
                    <option value="recommendation">Recommendations</option>
                    <option value="alert">Alerts</option>
                    <option value="achievement">Achievements</option>
                  </select>
                  
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="px-3 py-2 border rounded-md text-sm"
                  >
                    <option value="all">All Priorities</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Insights List */}
          <div className="space-y-4">
            {filteredInsights.map((insight) => (
              <Card key={insight.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(insight.type)}
                      <div>
                        <h3 className="font-semibold">{insight.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getPriorityColor(insight.priority)}>
                            {insight.priority}
                          </Badge>
                          <Badge variant="outline">
                            {insight.category}
                          </Badge>
                          {insight.aiGenerated && (
                            <Badge variant="outline" className="text-blue-600">
                              <Brain className="h-3 w-3 mr-1" />
                              AI Generated
                            </Badge>
                          )}
                          {insight.verified && (
                            <Badge variant="outline" className="text-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(insight.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4">{insight.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <div className="text-lg font-bold text-blue-600">{insight.impact}%</div>
                      <div className="text-xs text-blue-600">Impact</div>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded">
                      <div className="text-lg font-bold text-green-600">{insight.confidence}%</div>
                      <div className="text-xs text-green-600">Confidence</div>
                    </div>
                    <div className="text-center p-2 bg-purple-50 rounded">
                      <div className="text-lg font-bold text-purple-600">${insight.cost}</div>
                      <div className="text-xs text-purple-600">Cost</div>
                    </div>
                    <div className="text-center p-2 bg-orange-50 rounded">
                      <div className="text-lg font-bold text-orange-600 capitalize">{insight.effort}</div>
                      <div className="text-xs text-orange-600">Effort</div>
                    </div>
                  </div>
                  
                  {insight.metrics && (
                    <div className="p-3 bg-gray-50 rounded-lg mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Performance Impact:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">
                            {insight.metrics.before} → {insight.metrics.after}
                          </span>
                          <div className={`flex items-center gap-1 ${
                            insight.metrics.changeType === 'increase' ? 'text-green-600' : 
                            insight.metrics.changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {insight.metrics.changeType === 'increase' ? 
                              <TrendingUp className="h-4 w-4" /> : 
                              insight.metrics.changeType === 'decrease' ? 
                              <TrendingDown className="h-4 w-4" /> : 
                              <div className="h-4 w-4 bg-gray-400 rounded-full" />
                            }
                            <span className="text-sm font-medium">
                              {insight.metrics.change > 0 ? '+' : ''}{insight.metrics.change}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {insight.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex gap-2">
                      {insight.actionRequired && (
                        <Button size="sm" variant="outline">
                          {insight.actionText}
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedInsight(insight.id)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="recommendations" className="space-y-6">
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <Card key={rec.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold">{rec.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={getPriorityColor(rec.priority)}>
                          {rec.priority}
                        </Badge>
                        <Badge variant="outline">
                          {rec.category}
                        </Badge>
                        <Badge variant="outline" className={getEffortColor(rec.effort)}>
                          {rec.effort} effort
                        </Badge>
                        <Badge variant="outline" className={getTimeframeColor(rec.timeframe)}>
                          {rec.timeframe}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">{rec.roi}%</div>
                      <div className="text-sm text-gray-600">ROI</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <div className="text-lg font-bold text-blue-600">{rec.impact}%</div>
                      <div className="text-xs text-blue-600">Impact</div>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded">
                      <div className="text-lg font-bold text-green-600">${rec.cost}</div>
                      <div className="text-xs text-green-600">Cost</div>
                    </div>
                    <div className="text-center p-2 bg-purple-50 rounded">
                      <div className="text-lg font-bold text-purple-600">{rec.successRate}%</div>
                      <div className="text-xs text-purple-600">Success Rate</div>
                    </div>
                    <div className="text-center p-2 bg-orange-50 rounded">
                      <div className="text-lg font-bold text-orange-600">{rec.progress}%</div>
                      <div className="text-xs text-orange-600">Progress</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium mb-2">Expected Outcome:</h4>
                      <p className="text-sm text-gray-700">{rec.expectedOutcome}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Steps:</h4>
                      <ol className="list-decimal list-inside space-y-1">
                        {rec.steps.map((step, index) => (
                          <li key={index} className="text-sm text-gray-700">{step}</li>
                        ))}
                      </ol>
                    </div>
                    
                    {rec.prerequisites.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Prerequisites:</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {rec.prerequisites.map((prereq, index) => (
                            <li key={index} className="text-sm text-gray-700">{prereq}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="flex gap-2">
                      <Button size="sm">
                        <Play className="h-4 w-4 mr-1" />
                        Start
                      </Button>
                      <Button size="sm" variant="outline">
                        <Bookmark className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                    </div>
                    <div className="text-sm text-gray-500">
                      Status: <span className="capitalize">{rec.status}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="documents" className="space-y-6">
          <DocumentUploader 
            tenantId="default" // In production, this would come from user context
            onDocumentAnalyzed={(document) => {
              console.log('Document analyzed:', document);
              // Refresh insights when new document is analyzed
              loadInsights();
            }}
          />
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Insights by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={Object.entries(
                          insights.reduce((acc, insight) => {
                            acc[insight.type] = (acc[insight.type] || 0) + 1;
                            return acc;
                          }, {} as any)
                        ).map(([type, count]) => ({ name: type, value: count }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {Object.entries(
                          insights.reduce((acc, insight) => {
                            acc[insight.type] = (acc[insight.type] || 0) + 1;
                            return acc;
                          }, {} as any)
                        ).map((_, index) => (
                          <Cell key={`cell-${index}`} fill={`hsl(${index * 60}, 70%, 50%)`} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Impact vs Confidence</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart data={insights.map(insight => ({
                      impact: insight.impact,
                      confidence: insight.confidence,
                      type: insight.type,
                      priority: insight.priority
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="impact" name="Impact" />
                      <YAxis dataKey="confidence" name="Confidence" />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                      <Scatter dataKey="confidence" fill="#8884d8" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Insight Detail Modal */}
      {selectedInsightData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">{selectedInsightData.title}</h3>
              <Button variant="outline" onClick={() => setSelectedInsight(null)}>
                Close
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">{selectedInsightData.impact}%</div>
                  <div className="text-sm text-blue-600">Impact Score</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">{selectedInsightData.confidence}%</div>
                  <div className="text-sm text-green-600">Confidence Level</div>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Description:</h4>
                <p className="text-gray-700">{selectedInsightData.description}</p>
              </div>
              
              {selectedInsightData.actionRequired && (
                <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg">
                  <h4 className="font-medium text-yellow-900 mb-2">Action Required:</h4>
                  <p className="text-yellow-800">{selectedInsightData.actionText}</p>
                  {selectedInsightData.actionUrl && (
                    <Button className="mt-2" size="sm">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Take Action
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
