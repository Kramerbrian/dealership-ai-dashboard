"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Linkedin, 
  Music, 
  Mic, 
  Search, 
  TrendingUp, 
  Users,
  MessageSquare,
  Video,
  Globe,
  Smartphone,
  Headphones,
  Zap,
  BarChart3,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Instagram,
  Twitter,
  Youtube,
  Facebook,
  Reddit,
  Pinterest,
  Tiktok,
  Twitch,
  Discord,
  Snapchat,
  Spotify,
  Apple,
  Google,
  Amazon,
  Microsoft,
  Slack,
  Telegram,
  WhatsApp,
  WeChat,
  Line,
  Viber,
  Signal,
  Clubhouse,
  BeReal,
  Mastodon,
  Threads,
  Bluesky,
  Substack,
  Medium,
  Quora,
  StackOverflow,
  GitHub,
  GitLab,
  Bitbucket,
  Dribbble,
  Behance,
  Figma,
  Notion,
  Airtable,
  Trello,
  Asana,
  Monday,
  ClickUp,
  Jira,
  Confluence,
  Slack,
  Teams,
  Zoom,
  Webex,
  Meet,
  Calendly,
  Acuity,
  SimplyBook,
  Square,
  Stripe,
  PayPal,
  Venmo,
  CashApp,
  Zelle,
  ApplePay,
  GooglePay,
  SamsungPay,
  AmazonPay,
  Shopify,
  WooCommerce,
  Magento,
  BigCommerce,
  Squarespace,
  Wix,
  Webflow,
  Framer,
  Bubble,
  Zapier,
  IFTTT,
  Make,
  Pabbly,
  Integromat,
  Automate,
  Pipedream,
  n8n,
  HuggingFace,
  OpenAI,
  Anthropic,
  Cohere,
  Replicate,
  RunPod,
  Modal,
  Banana,
  BananaDev,
  BananaAI,
  BananaML,
  BananaData,
  BananaAnalytics,
  BananaInsights,
  BananaIntelligence,
  BananaAI,
  BananaML,
  BananaData,
  BananaAnalytics,
  BananaInsights,
  BananaIntelligence
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface AISource {
  id: string;
  name: string;
  platform: string;
  category: 'social' | 'search' | 'voice' | 'video' | 'audio' | 'messaging' | 'professional' | 'ecommerce' | 'ai' | 'analytics';
  icon: React.ReactNode;
  description: string;
  status: 'active' | 'inactive' | 'error' | 'pending' | 'maintenance';
  lastUpdate: string;
  metrics: {
    visibility: number;
    engagement: number;
    reach: number;
    sentiment: number;
    conversion: number;
    authority: number;
    influence: number;
    growth: number;
  };
  trends: {
    visibility: number;
    engagement: number;
    reach: number;
    sentiment: number;
    conversion: number;
  };
  insights: string[];
  competitors: {
    name: string;
    visibility: number;
    engagement: number;
  }[];
  recommendations: string[];
  cost: {
    monthly: number;
    cpm: number;
    cpc: number;
  };
  demographics: {
    age: { [key: string]: number };
    gender: { [key: string]: number };
    location: { [key: string]: number };
    interests: string[];
  };
}

interface AICoverageMetrics {
  totalSources: number;
  activeSources: number;
  averageVisibility: number;
  totalReach: number;
  engagementRate: number;
  sentimentScore: number;
  coverageScore: number;
  conversionRate: number;
  authorityScore: number;
  influenceScore: number;
  growthRate: number;
  costEfficiency: number;
  competitorGap: number;
  marketShare: number;
  aiReadiness: number;
}

export default function ExtendedAICoverage() {
  const [sources, setSources] = useState<AISource[]>([]);
  const [metrics, setMetrics] = useState<AICoverageMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'analytics'>('grid');

  useEffect(() => {
    loadAISources();
  }, []);

  const loadAISources = async () => {
    setLoading(true);
    try {
      // Extended AI sources with comprehensive metrics
      const extendedSources: AISource[] = [
        // Social Media Platforms
        {
          id: 'linkedin',
          name: 'LinkedIn Business',
          platform: 'LinkedIn',
          category: 'professional',
          icon: <Linkedin className="h-5 w-5" />,
          description: 'Professional networking and B2B visibility',
          status: 'active',
          lastUpdate: '2024-12-15T10:30:00Z',
          metrics: {
            visibility: 78,
            engagement: 65,
            reach: 1240,
            sentiment: 82,
            conversion: 12,
            authority: 85,
            influence: 72,
            growth: 15
          },
          trends: { visibility: 12, engagement: 8, reach: 156, sentiment: 5, conversion: 3 },
          insights: [
            'LinkedIn posts about electric vehicles are performing 40% better',
            'Your company page views increased 25% this month',
            'Industry-specific content gets 3x more engagement'
          ],
          competitors: [
            { name: 'Competitor A', visibility: 82, engagement: 70 },
            { name: 'Competitor B', visibility: 75, engagement: 68 }
          ],
          recommendations: [
            'Post 3x per week for optimal engagement',
            'Use LinkedIn Analytics to track performance',
            'Engage with industry leaders\' content'
          ],
          cost: { monthly: 299, cpm: 12.50, cpc: 2.30 },
          demographics: {
            age: { '25-34': 35, '35-44': 40, '45-54': 20, '55+': 5 },
            gender: { male: 55, female: 45 },
            location: { 'North America': 60, 'Europe': 25, 'Asia': 15 },
            interests: ['Business', 'Technology', 'Automotive', 'Sales']
          }
        },
        {
          id: 'tiktok',
          name: 'TikTok Business',
          platform: 'TikTok',
          category: 'video',
          icon: <Tiktok className="h-5 w-5" />,
          description: 'Short-form video content and viral marketing',
          status: 'active',
          lastUpdate: '2024-12-15T09:15:00Z',
          metrics: {
            visibility: 92,
            engagement: 89,
            reach: 5670,
            sentiment: 76,
            conversion: 8,
            authority: 45,
            influence: 88,
            growth: 45
          },
          trends: { visibility: 18, engagement: 22, reach: 890, sentiment: -2, conversion: 2 },
          insights: [
            'Car walkaround videos are trending with 2M+ views',
            'Behind-the-scenes content has 85% higher engagement',
            'User-generated content performs 60% better than branded content'
          ],
          competitors: [
            { name: 'Competitor A', visibility: 88, engagement: 85 },
            { name: 'Competitor B', visibility: 95, engagement: 92 }
          ],
          recommendations: [
            'Create 15-30 second car showcase videos',
            'Use trending hashtags and sounds',
            'Collaborate with automotive influencers'
          ],
          cost: { monthly: 500, cpm: 8.50, cpc: 1.80 },
          demographics: {
            age: { '18-24': 45, '25-34': 35, '35-44': 15, '45+': 5 },
            gender: { male: 48, female: 52 },
            location: { 'North America': 40, 'Europe': 30, 'Asia': 30 },
            interests: ['Entertainment', 'Music', 'Dance', 'Comedy', 'Cars']
          }
        },
        {
          id: 'instagram',
          name: 'Instagram Business',
          platform: 'Instagram',
          category: 'social',
          icon: <Instagram className="h-5 w-5" />,
          description: 'Visual storytelling and influencer marketing',
          status: 'active',
          lastUpdate: '2024-12-15T08:45:00Z',
          metrics: {
            visibility: 84,
            engagement: 91,
            reach: 4560,
            sentiment: 85,
            conversion: 15,
            authority: 70,
            influence: 85,
            growth: 22
          },
          trends: { visibility: 15, engagement: 19, reach: 567, sentiment: 8, conversion: 5 },
          insights: [
            'Stories with car features get 3x more engagement',
            'Reels about customer testimonials are highly effective',
            'Instagram Shopping integration increased conversions 25%'
          ],
          competitors: [
            { name: 'Competitor A', visibility: 80, engagement: 88 },
            { name: 'Competitor B', visibility: 87, engagement: 90 }
          ],
          recommendations: [
            'Post daily stories showcasing inventory',
            'Use car-specific hashtags and location tags',
            'Leverage Instagram Shopping for direct sales'
          ],
          cost: { monthly: 400, cpm: 15.20, cpc: 3.10 },
          demographics: {
            age: { '18-24': 30, '25-34': 40, '35-44': 25, '45+': 5 },
            gender: { male: 45, female: 55 },
            location: { 'North America': 50, 'Europe': 30, 'Asia': 20 },
            interests: ['Lifestyle', 'Fashion', 'Travel', 'Food', 'Cars']
          }
        },
        // Voice & Search Platforms
        {
          id: 'voice-assistants',
          name: 'Voice Assistants',
          platform: 'Google Assistant, Alexa, Siri',
          category: 'voice',
          icon: <Mic className="h-5 w-5" />,
          description: 'Voice search optimization and smart speaker presence',
          status: 'active',
          lastUpdate: '2024-12-15T08:30:00Z',
          metrics: {
            visibility: 45,
            engagement: 38,
            reach: 320,
            sentiment: 71,
            conversion: 25,
            authority: 60,
            influence: 35,
            growth: 8
          },
          trends: { visibility: 5, engagement: 3, reach: 45, sentiment: 2, conversion: 4 },
          insights: [
            'Voice searches for "car dealership near me" increased 35%',
            'Local business queries are up 28% on voice devices',
            'Optimize for conversational keywords for better voice visibility'
          ],
          competitors: [
            { name: 'Competitor A', visibility: 50, engagement: 42 },
            { name: 'Competitor B', visibility: 38, engagement: 35 }
          ],
          recommendations: [
            'Optimize for "near me" voice searches',
            'Create FAQ content for voice queries',
            'Claim and optimize Google My Business listing'
          ],
          cost: { monthly: 150, cpm: 25.00, cpc: 5.50 },
          demographics: {
            age: { '25-34': 25, '35-44': 35, '45-54': 30, '55+': 10 },
            gender: { male: 60, female: 40 },
            location: { 'North America': 70, 'Europe': 20, 'Asia': 10 },
            interests: ['Technology', 'Convenience', 'Local Business', 'Automotive']
          }
        },
        {
          id: 'google-search',
          name: 'Google Search',
          platform: 'Google',
          category: 'search',
          icon: <Search className="h-5 w-5" />,
          description: 'Organic search visibility and SEO performance',
          status: 'active',
          lastUpdate: '2024-12-15T08:00:00Z',
          metrics: {
            visibility: 72,
            engagement: 68,
            reach: 8900,
            sentiment: 78,
            conversion: 18,
            authority: 90,
            influence: 75,
            growth: 12
          },
          trends: { visibility: 8, engagement: 5, reach: 1200, sentiment: 3, conversion: 2 },
          insights: [
            'Local SEO keywords driving 40% of traffic',
            'Featured snippets increased click-through rate by 35%',
            'Mobile search queries up 25% this quarter'
          ],
          competitors: [
            { name: 'Competitor A', visibility: 75, engagement: 70 },
            { name: 'Competitor B', visibility: 68, engagement: 65 }
          ],
          recommendations: [
            'Focus on local SEO optimization',
            'Create content targeting long-tail keywords',
            'Improve page loading speed for better rankings'
          ],
          cost: { monthly: 800, cpm: 2.50, cpc: 1.20 },
          demographics: {
            age: { '18-24': 20, '25-34': 30, '35-44': 30, '45+': 20 },
            gender: { male: 55, female: 45 },
            location: { 'North America': 60, 'Europe': 25, 'Asia': 15 },
            interests: ['Automotive', 'Local Business', 'Shopping', 'Reviews']
          }
        },
        // AI & Analytics Platforms
        {
          id: 'openai-chatgpt',
          name: 'OpenAI ChatGPT',
          platform: 'OpenAI',
          category: 'ai',
          icon: <Brain className="h-5 w-5" />,
          description: 'AI-powered customer interactions and content generation',
          status: 'active',
          lastUpdate: '2024-12-15T07:45:00Z',
          metrics: {
            visibility: 35,
            engagement: 42,
            reach: 180,
            sentiment: 88,
            conversion: 35,
            authority: 95,
            influence: 60,
            growth: 65
          },
          trends: { visibility: 15, engagement: 18, reach: 45, sentiment: 12, conversion: 8 },
          insights: [
            'AI chat interactions increased customer satisfaction by 40%',
            'Automated responses handle 70% of common inquiries',
            'AI-generated content performs 25% better than human-written'
          ],
          competitors: [
            { name: 'Competitor A', visibility: 30, engagement: 38 },
            { name: 'Competitor B', visibility: 40, engagement: 45 }
          ],
          recommendations: [
            'Implement AI chatbot for 24/7 customer support',
            'Use AI for personalized email campaigns',
            'Generate SEO-optimized content with AI assistance'
          ],
          cost: { monthly: 200, cpm: 50.00, cpc: 12.00 },
          demographics: {
            age: { '25-34': 40, '35-44': 35, '45-54': 20, '55+': 5 },
            gender: { male: 65, female: 35 },
            location: { 'North America': 80, 'Europe': 15, 'Asia': 5 },
            interests: ['Technology', 'AI', 'Automation', 'Efficiency']
          }
        },
        // E-commerce Platforms
        {
          id: 'shopify',
          name: 'Shopify Store',
          platform: 'Shopify',
          category: 'ecommerce',
          icon: <ShoppingCart className="h-5 w-5" />,
          description: 'E-commerce platform for online vehicle sales',
          status: 'active',
          lastUpdate: '2024-12-15T07:30:00Z',
          metrics: {
            visibility: 58,
            engagement: 45,
            reach: 1200,
            sentiment: 82,
            conversion: 28,
            authority: 70,
            influence: 55,
            growth: 18
          },
          trends: { visibility: 8, engagement: 5, reach: 150, sentiment: 5, conversion: 3 },
          insights: [
            'Online vehicle configurator increased engagement by 60%',
            'Virtual showroom tours drive 40% more qualified leads',
            'Mobile commerce accounts for 65% of online traffic'
          ],
          competitors: [
            { name: 'Competitor A', visibility: 55, engagement: 42 },
            { name: 'Competitor B', visibility: 62, engagement: 48 }
          ],
          recommendations: [
            'Implement virtual vehicle tours',
            'Add online financing calculator',
            'Optimize for mobile commerce experience'
          ],
          cost: { monthly: 299, cpm: 8.50, cpc: 2.80 },
          demographics: {
            age: { '25-34': 35, '35-44': 40, '45-54': 20, '55+': 5 },
            gender: { male: 60, female: 40 },
            location: { 'North America': 70, 'Europe': 20, 'Asia': 10 },
            interests: ['Online Shopping', 'Automotive', 'Technology', 'Convenience']
          }
        },
        // Additional AI Sources
        {
          id: 'anthropic-claude',
          name: 'Anthropic Claude',
          platform: 'Anthropic',
          category: 'ai',
          icon: <Brain className="h-5 w-5" />,
          description: 'Advanced AI assistant for complex reasoning tasks',
          status: 'pending',
          lastUpdate: '2024-12-10T14:20:00Z',
          metrics: {
            visibility: 25,
            engagement: 35,
            reach: 95,
            sentiment: 92,
            conversion: 20,
            authority: 90,
            influence: 45,
            growth: 40
          },
          trends: { visibility: 5, engagement: 8, reach: 20, sentiment: 8, conversion: 3 },
          insights: [
            'Claude excels at complex automotive queries',
            'Better performance on technical specifications',
            'Higher customer satisfaction for detailed questions'
          ],
          competitors: [
            { name: 'Competitor A', visibility: 22, engagement: 32 },
            { name: 'Competitor B', visibility: 28, engagement: 38 }
          ],
          recommendations: [
            'Integrate Claude for technical support',
            'Use for complex customer inquiries',
            'Implement for internal knowledge management'
          ],
          cost: { monthly: 150, cpm: 60.00, cpc: 15.00 },
          demographics: {
            age: { '25-34': 45, '35-44': 35, '45-54': 15, '55+': 5 },
            gender: { male: 70, female: 30 },
            location: { 'North America': 85, 'Europe': 10, 'Asia': 5 },
            interests: ['AI', 'Technology', 'Research', 'Problem Solving']
          }
        },
        {
          id: 'huggingface',
          name: 'Hugging Face',
          platform: 'Hugging Face',
          category: 'ai',
          icon: <Brain className="h-5 w-5" />,
          description: 'Open-source AI models and datasets',
          status: 'inactive',
          lastUpdate: '2024-12-01T12:00:00Z',
          metrics: {
            visibility: 15,
            engagement: 25,
            reach: 80,
            sentiment: 75,
            conversion: 10,
            authority: 85,
            influence: 30,
            growth: 5
          },
          trends: { visibility: -2, engagement: 1, reach: 5, sentiment: -1, conversion: 1 },
          insights: [
            'Open-source models provide cost-effective solutions',
            'Community-driven development and support',
            'Custom model training capabilities available'
          ],
          competitors: [
            { name: 'Competitor A', visibility: 18, engagement: 28 },
            { name: 'Competitor B', visibility: 12, engagement: 22 }
          ],
          recommendations: [
            'Explore open-source AI models for specific use cases',
            'Consider custom model training for automotive domain',
            'Leverage community resources and documentation'
          ],
          cost: { monthly: 50, cpm: 25.00, cpc: 8.00 },
          demographics: {
            age: { '25-34': 50, '35-44': 35, '45-54': 10, '55+': 5 },
            gender: { male: 80, female: 20 },
            location: { 'North America': 60, 'Europe': 25, 'Asia': 15 },
            interests: ['Open Source', 'AI', 'Machine Learning', 'Development']
          }
        }
      ];

      const mockMetrics: AICoverageMetrics = {
        totalSources: 8,
        activeSources: 6,
        averageVisibility: 67,
        totalReach: 16450,
        engagementRate: 73,
        sentimentScore: 76,
        coverageScore: 82,
        conversionRate: 19,
        authorityScore: 75,
        influenceScore: 65,
        growthRate: 28,
        costEfficiency: 78,
        competitorGap: 12,
        marketShare: 15,
        aiReadiness: 85
      };

      setSources(extendedSources);
      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Error loading AI sources:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshSource = async (sourceId: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSources(prev => prev.map(source => 
        source.id === sourceId 
          ? { 
              ...source, 
              lastUpdate: new Date().toISOString(),
              status: 'active',
              metrics: {
                ...source.metrics,
                visibility: Math.min(100, source.metrics.visibility + Math.random() * 5),
                engagement: Math.min(100, source.metrics.engagement + Math.random() * 3),
                reach: source.metrics.reach + Math.floor(Math.random() * 50)
              }
            }
          : source
      ));
    } catch (error) {
      console.error('Error refreshing source:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'maintenance': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'inactive': return <AlertTriangle className="h-4 w-4 text-gray-600" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'pending': return <RefreshCw className="h-4 w-4 text-yellow-600" />;
      case 'maintenance': return <RefreshCw className="h-4 w-4 text-blue-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend < 0) return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />;
    return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      social: 'bg-pink-100 text-pink-800',
      search: 'bg-blue-100 text-blue-800',
      voice: 'bg-purple-100 text-purple-800',
      video: 'bg-red-100 text-red-800',
      audio: 'bg-green-100 text-green-800',
      messaging: 'bg-yellow-100 text-yellow-800',
      professional: 'bg-indigo-100 text-indigo-800',
      ecommerce: 'bg-orange-100 text-orange-800',
      ai: 'bg-cyan-100 text-cyan-800',
      analytics: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const filteredSources = sources.filter(source => 
    selectedCategory === 'all' || source.category === selectedCategory
  );

  const selectedSourceData = sources.find(s => s.id === selectedSource);

  const categoryStats = sources.reduce((acc, source) => {
    if (!acc[source.category]) {
      acc[source.category] = { count: 0, avgVisibility: 0, totalReach: 0 };
    }
    acc[source.category].count++;
    acc[source.category].avgVisibility += source.metrics.visibility;
    acc[source.category].totalReach += source.metrics.reach;
    return acc;
  }, {} as any);

  Object.keys(categoryStats).forEach(category => {
    categoryStats[category].avgVisibility = Math.round(categoryStats[category].avgVisibility / categoryStats[category].count);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Extended AI Coverage</h1>
          <p className="text-gray-600">Comprehensive visibility across all AI-powered platforms</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setViewMode('grid')} variant={viewMode === 'grid' ? 'default' : 'outline'}>
            Grid
          </Button>
          <Button onClick={() => setViewMode('list')} variant={viewMode === 'list' ? 'default' : 'outline'}>
            List
          </Button>
          <Button onClick={() => setViewMode('analytics')} variant={viewMode === 'analytics' ? 'default' : 'outline'}>
            Analytics
          </Button>
          <Button onClick={() => setLoading(true)} disabled={loading}>
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh All
          </Button>
        </div>
      </div>

      {/* Enhanced Metrics Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Globe className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{metrics.activeSources}/{metrics.totalSources}</div>
                  <div className="text-sm text-gray-600">Active Sources</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{metrics.averageVisibility}%</div>
                  <div className="text-sm text-gray-600">Avg Visibility</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{formatNumber(metrics.totalReach)}</div>
                  <div className="text-sm text-gray-600">Total Reach</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Zap className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{metrics.coverageScore}%</div>
                  <div className="text-sm text-gray-600">Coverage Score</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{metrics.conversionRate}%</div>
                  <div className="text-sm text-gray-600">Conversion Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-100 rounded-lg">
                  <Brain className="h-5 w-5 text-cyan-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{metrics.aiReadiness}%</div>
                  <div className="text-sm text-gray-600">AI Readiness</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => setSelectedCategory('all')}
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
        >
          All Categories
        </Button>
        {Object.keys(categoryStats).map(category => (
          <Button
            key={category}
            onClick={() => setSelectedCategory(category)}
            variant={selectedCategory === category ? 'default' : 'outline'}
            className="capitalize"
          >
            {category} ({categoryStats[category].count})
          </Button>
        ))}
      </div>

      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSources.map((source) => (
            <Card key={source.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {source.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold">{source.name}</h3>
                      <p className="text-sm text-gray-600">{source.platform}</p>
                      <Badge className={`text-xs ${getCategoryColor(source.category)}`}>
                        {source.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(source.status)}
                    <Badge className={getStatusColor(source.status)}>
                      {source.status}
                    </Badge>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">{source.description}</p>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <div className="text-lg font-bold text-blue-600">{source.metrics.visibility}%</div>
                    <div className="text-xs text-blue-600">Visibility</div>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      {getTrendIcon(source.trends.visibility)}
                      <span className="text-xs">{source.trends.visibility > 0 ? '+' : ''}{source.trends.visibility}%</span>
                    </div>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded">
                    <div className="text-lg font-bold text-green-600">{source.metrics.engagement}%</div>
                    <div className="text-xs text-green-600">Engagement</div>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      {getTrendIcon(source.trends.engagement)}
                      <span className="text-xs">{source.trends.engagement > 0 ? '+' : ''}{source.trends.engagement}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                  <span>Reach: {formatNumber(source.metrics.reach)}</span>
                  <span>Conversion: {source.metrics.conversion}%</span>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setSelectedSource(source.id)}
                  >
                    View Details
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => refreshSource(source.id)}
                    disabled={loading}
                  >
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {viewMode === 'list' && (
        <div className="space-y-4">
          {filteredSources.map((source) => (
            <Card key={source.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {source.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold">{source.name}</h3>
                      <p className="text-sm text-gray-600">{source.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`text-xs ${getCategoryColor(source.category)}`}>
                          {source.category}
                        </Badge>
                        <Badge className={getStatusColor(source.status)}>
                          {source.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setSelectedSource(source.id)}>
                      View Details
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-6 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{source.metrics.visibility}%</div>
                    <div className="text-sm text-gray-600">Visibility</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{source.metrics.engagement}%</div>
                    <div className="text-sm text-gray-600">Engagement</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{formatNumber(source.metrics.reach)}</div>
                    <div className="text-sm text-gray-600">Reach</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{source.metrics.sentiment}%</div>
                    <div className="text-sm text-gray-600">Sentiment</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{source.metrics.conversion}%</div>
                    <div className="text-sm text-gray-600">Conversion</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cyan-600">{source.metrics.authority}</div>
                    <div className="text-sm text-gray-600">Authority</div>
                  </div>
                </div>
                
                {source.insights.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">AI Insights:</h4>
                    <ul className="space-y-1">
                      {source.insights.slice(0, 2).map((insight, index) => (
                        <li key={index} className="text-sm text-blue-800 flex items-start gap-2">
                          <div className="w-1 h-1 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {viewMode === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Coverage Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={filteredSources.map(s => ({
                      name: s.name,
                      visibility: s.metrics.visibility,
                      engagement: s.metrics.engagement,
                      reach: s.metrics.reach / 100,
                      sentiment: s.metrics.sentiment
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="visibility" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                      <Area type="monotone" dataKey="engagement" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                      <Area type="monotone" dataKey="sentiment" stackId="3" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={Object.entries(categoryStats).map(([category, stats]) => ({
                          name: category,
                          value: stats.count,
                          avgVisibility: stats.avgVisibility
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {Object.entries(categoryStats).map((_, index) => (
                          <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 50%)`} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Competitive Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredSources.map(source => (
                  <div key={source.id} className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-3">{source.name}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h5 className="text-sm font-medium text-gray-600 mb-2">Your Performance</h5>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-sm">Visibility</span>
                            <span className="text-sm font-medium">{source.metrics.visibility}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Engagement</span>
                            <span className="text-sm font-medium">{source.metrics.engagement}%</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-gray-600 mb-2">Competitors</h5>
                        <div className="space-y-1">
                          {source.competitors.map((competitor, index) => (
                            <div key={index} className="flex justify-between">
                              <span className="text-sm">{competitor.name}</span>
                              <span className="text-sm font-medium">{competitor.visibility}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-gray-600 mb-2">Recommendations</h5>
                        <ul className="space-y-1">
                          {source.recommendations.slice(0, 2).map((rec, index) => (
                            <li key={index} className="text-sm text-gray-700 flex items-start gap-1">
                              <div className="w-1 h-1 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Source Detail Modal */}
      {selectedSourceData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">{selectedSourceData.name}</h3>
              <Button variant="outline" onClick={() => setSelectedSource(null)}>
                Close
              </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600">{selectedSourceData.metrics.visibility}%</div>
                    <div className="text-sm text-blue-600">Visibility Score</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">{selectedSourceData.metrics.engagement}%</div>
                    <div className="text-sm text-green-600">Engagement Rate</div>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">AI-Generated Insights:</h4>
                  <ul className="space-y-2">
                    {selectedSourceData.insights.map((insight, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-medium mb-2">Demographics</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium">Age Groups:</span>
                      <div className="flex gap-2 mt-1">
                        {Object.entries(selectedSourceData.demographics.age).map(([age, percent]) => (
                          <span key={age} className="text-xs bg-purple-100 px-2 py-1 rounded">
                            {age}: {percent}%
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Gender:</span>
                      <div className="flex gap-2 mt-1">
                        {Object.entries(selectedSourceData.demographics.gender).map(([gender, percent]) => (
                          <span key={gender} className="text-xs bg-purple-100 px-2 py-1 rounded">
                            {gender}: {percent}%
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h4 className="font-medium mb-2">Cost Analysis</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm">Monthly Cost:</span>
                      <span className="text-sm font-medium">${selectedSourceData.cost.monthly}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">CPM:</span>
                      <span className="text-sm font-medium">${selectedSourceData.cost.cpm}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">CPC:</span>
                      <span className="text-sm font-medium">${selectedSourceData.cost.cpc}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Add missing ShoppingCart icon component
const ShoppingCart = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 11-4 0v-6m4 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
  </svg>
);