/**
 * Learning Center Component
 * Educational content and resources for AI visibility
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  BookOpen, 
  Play, 
  FileText, 
  Video, 
  Search, 
  Clock, 
  Star,
  TrendingUp,
  Target,
  Brain,
  Zap,
  Users,
  Award,
  ChevronRight
} from 'lucide-react';

interface LearningContent {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'article' | 'tutorial';
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  rating: number;
  completed: boolean;
  thumbnail?: string;
}

const LEARNING_CONTENT: LearningContent[] = [
  {
    id: '1',
    title: 'AI Visibility Fundamentals',
    description: 'Learn the basics of AI-powered visibility analytics and how they impact your dealership.',
    type: 'video',
    duration: '15 min',
    difficulty: 'beginner',
    category: 'AI Basics',
    rating: 4.8,
    completed: false,
  },
  {
    id: '2',
    title: 'Schema Markup Mastery',
    description: 'Complete guide to implementing structured data for better search visibility.',
    type: 'tutorial',
    duration: '25 min',
    difficulty: 'intermediate',
    category: 'SEO',
    rating: 4.9,
    completed: true,
  },
  {
    id: '3',
    title: 'Reputation Management with AI',
    description: 'How to use AI to monitor and respond to online reviews effectively.',
    type: 'article',
    duration: '10 min',
    difficulty: 'beginner',
    category: 'Reputation',
    rating: 4.7,
    completed: false,
  },
  {
    id: '4',
    title: 'Predictive Analytics Deep Dive',
    description: 'Understanding and leveraging predictive insights for business growth.',
    type: 'video',
    duration: '30 min',
    difficulty: 'advanced',
    category: 'Analytics',
    rating: 4.9,
    completed: false,
  },
  {
    id: '5',
    title: 'Local SEO Optimization',
    description: 'Maximize your local search presence with proven strategies.',
    type: 'tutorial',
    duration: '20 min',
    difficulty: 'intermediate',
    category: 'SEO',
    rating: 4.6,
    completed: true,
  },
  {
    id: '6',
    title: 'What-If Scenario Planning',
    description: 'Learn to use the simulator to test different strategies and their impact.',
    type: 'video',
    duration: '18 min',
    difficulty: 'intermediate',
    category: 'Strategy',
    rating: 4.8,
    completed: false,
  },
];

const CATEGORIES = [
  { id: 'all', name: 'All Topics', icon: <BookOpen className="h-4 w-4" /> },
  { id: 'ai-basics', name: 'AI Basics', icon: <Brain className="h-4 w-4" /> },
  { id: 'seo', name: 'SEO', icon: <TrendingUp className="h-4 w-4" /> },
  { id: 'reputation', name: 'Reputation', icon: <Star className="h-4 w-4" /> },
  { id: 'analytics', name: 'Analytics', icon: <Target className="h-4 w-4" /> },
  { id: 'strategy', name: 'Strategy', icon: <Zap className="h-4 w-4" /> },
];

export default function LearningCenter() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContent, setSelectedContent] = useState<LearningContent | null>(null);

  const filteredContent = LEARNING_CONTENT.filter(content => {
    const matchesCategory = selectedCategory === 'all' || 
      content.category.toLowerCase().replace(' ', '-') === selectedCategory;
    const matchesSearch = content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      content.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Play className="h-4 w-4" />;
      case 'article': return <FileText className="h-4 w-4" />;
      case 'tutorial': return <BookOpen className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const completedCount = LEARNING_CONTENT.filter(c => c.completed).length;
  const totalCount = LEARNING_CONTENT.length;
  const progressPercentage = (completedCount / totalCount) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Learning Center</h1>
          <p className="text-gray-600">Master AI-powered dealership visibility</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{completedCount}/{totalCount}</div>
          <div className="text-sm text-gray-600">Lessons Completed</div>
        </div>
      </div>

      {/* Progress Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5" />
            <span>Your Learning Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-gray-600">{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{completedCount}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{totalCount - completedCount}</div>
                <div className="text-sm text-gray-600">Remaining</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {LEARNING_CONTENT.reduce((sum, c) => sum + c.rating, 0) / LEARNING_CONTENT.length}
                </div>
                <div className="text-sm text-gray-600">Avg Rating</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search learning content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList>
            {CATEGORIES.map((category) => (
              <TabsTrigger key={category.id} value={category.id} className="flex items-center space-x-2">
                {category.icon}
                <span className="hidden sm:inline">{category.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContent.map((content) => (
          <Card 
            key={content.id} 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedContent(content)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  {getTypeIcon(content.type)}
                  <Badge variant="outline" className={getDifficultyColor(content.difficulty)}>
                    {content.difficulty}
                  </Badge>
                </div>
                {content.completed && (
                  <Badge variant="default" className="bg-green-600">
                    <Star className="h-3 w-3 mr-1" />
                    Completed
                  </Badge>
                )}
              </div>
              <CardTitle className="text-lg">{content.title}</CardTitle>
              <CardDescription>{content.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>{content.duration}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span>{content.rating}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{content.category}</Badge>
                  <Button size="sm" variant="outline">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Featured Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Featured This Week</span>
          </CardTitle>
          <CardDescription>
            Don't miss these trending topics in AI visibility
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">AI Visibility Trends 2024</h4>
              <p className="text-sm text-gray-600">
                Discover the latest trends in AI-powered visibility analytics and how they're reshaping the automotive industry.
              </p>
              <Button size="sm">
                <Play className="h-4 w-4 mr-2" />
                Watch Now
              </Button>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium">Case Study: 300% Visibility Increase</h4>
              <p className="text-sm text-gray-600">
                Learn how Naples Ford increased their AI visibility score by 300% in just 90 days using our platform.
              </p>
              <Button size="sm" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Read Case Study
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Detail Modal */}
      {selectedContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  {getTypeIcon(selectedContent.type)}
                  <Badge variant="outline" className={getDifficultyColor(selectedContent.difficulty)}>
                    {selectedContent.difficulty}
                  </Badge>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedContent(null)}>
                  ×
                </Button>
              </div>
              <CardTitle className="text-xl">{selectedContent.title}</CardTitle>
              <CardDescription>{selectedContent.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>{selectedContent.duration}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span>{selectedContent.rating}</span>
                  </div>
                </div>
                <Badge variant="secondary">{selectedContent.category}</Badge>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">What you'll learn:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Key concepts and best practices</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Real-world examples and case studies</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Actionable strategies you can implement</span>
                  </li>
                </ul>
              </div>

              <div className="flex space-x-2">
                <Button className="flex-1">
                  {selectedContent.type === 'video' ? (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Start Video
                    </>
                  ) : (
                    <>
                      <BookOpen className="h-4 w-4 mr-2" />
                      Start Reading
                    </>
                  )}
                </Button>
                <Button variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
