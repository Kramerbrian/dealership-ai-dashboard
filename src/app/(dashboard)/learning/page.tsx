"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Play, 
  Clock, 
  Star, 
  Search, 
  Filter,
  Download,
  Share2,
  Bookmark,
  CheckCircle,
  Users,
  TrendingUp,
  Award,
  Video,
  FileText,
  Headphones
} from 'lucide-react';

interface LearningContent {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'article' | 'podcast' | 'course';
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  tags: string[];
  rating: number;
  views: number;
  isCompleted: boolean;
  isBookmarked: boolean;
  thumbnail?: string;
  url?: string;
  author: string;
  publishedDate: string;
  lastUpdated: string;
}

interface LearningProgress {
  totalContent: number;
  completedContent: number;
  totalTimeSpent: number;
  currentStreak: number;
  badges: string[];
  certificates: string[];
}

export default function LearningCenter() {
  const [content, setContent] = useState<LearningContent[]>([]);
  const [progress, setProgress] = useState<LearningProgress | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    // Mock data - in production, this would come from your CMS/API
    const mockContent: LearningContent[] = [
      {
        id: '1',
        title: 'Understanding AIV Scores',
        description: 'Learn how Algorithmic Visibility Index works and how to improve your dealership\'s score.',
        type: 'video',
        duration: '12:30',
        difficulty: 'beginner',
        category: 'AIV Basics',
        tags: ['AIV', 'visibility', 'analytics'],
        rating: 4.8,
        views: 1247,
        isCompleted: true,
        isBookmarked: false,
        author: 'Sarah Johnson',
        publishedDate: '2024-11-15',
        lastUpdated: '2024-12-01'
      },
      {
        id: '2',
        title: 'Advanced SEO Strategies for Dealerships',
        description: 'Master local SEO techniques specifically designed for automotive dealerships.',
        type: 'course',
        duration: '2:15:00',
        difficulty: 'advanced',
        category: 'SEO',
        tags: ['SEO', 'local search', 'automotive'],
        rating: 4.9,
        views: 892,
        isCompleted: false,
        isBookmarked: true,
        author: 'Mike Chen',
        publishedDate: '2024-11-20',
        lastUpdated: '2024-12-05'
      },
      {
        id: '3',
        title: 'Reputation Management Best Practices',
        description: 'How to monitor, respond to, and improve your online reputation across all platforms.',
        type: 'article',
        duration: '8:45',
        difficulty: 'intermediate',
        category: 'Reputation',
        tags: ['reviews', 'reputation', 'customer service'],
        rating: 4.7,
        views: 1563,
        isCompleted: false,
        isBookmarked: false,
        author: 'Emily Rodriguez',
        publishedDate: '2024-11-25',
        lastUpdated: '2024-12-10'
      },
      {
        id: '4',
        title: 'AI-Powered Marketing Automation',
        description: 'Leverage artificial intelligence to automate your marketing campaigns and improve ROI.',
        type: 'podcast',
        duration: '45:20',
        difficulty: 'intermediate',
        category: 'Marketing',
        tags: ['AI', 'automation', 'marketing', 'ROI'],
        rating: 4.6,
        views: 743,
        isCompleted: true,
        isBookmarked: true,
        author: 'David Wilson',
        publishedDate: '2024-12-01',
        lastUpdated: '2024-12-08'
      },
      {
        id: '5',
        title: 'What-If Simulator Deep Dive',
        description: 'Master the what-if simulator to make data-driven business decisions.',
        type: 'video',
        duration: '18:15',
        difficulty: 'intermediate',
        category: 'Analytics',
        tags: ['simulator', 'analytics', 'planning'],
        rating: 4.8,
        views: 634,
        isCompleted: false,
        isBookmarked: false,
        author: 'Lisa Park',
        publishedDate: '2024-12-05',
        lastUpdated: '2024-12-12'
      },
      {
        id: '6',
        title: 'Team Collaboration in DealershipAI',
        description: 'Learn how to effectively collaborate with your team using DealershipAI\'s built-in tools.',
        type: 'course',
        duration: '1:30:00',
        difficulty: 'beginner',
        category: 'Team Management',
        tags: ['collaboration', 'team', 'workflow'],
        rating: 4.5,
        views: 421,
        isCompleted: false,
        isBookmarked: false,
        author: 'Alex Thompson',
        publishedDate: '2024-12-08',
        lastUpdated: '2024-12-15'
      }
    ];

    const mockProgress: LearningProgress = {
      totalContent: 6,
      completedContent: 2,
      totalTimeSpent: 156, // minutes
      currentStreak: 7,
      badges: ['First Steps', 'Video Watcher', 'Consistent Learner'],
      certificates: ['AIV Fundamentals', 'SEO Basics']
    };

    setContent(mockContent);
    setProgress(mockProgress);
  }, []);

  const filteredContent = content.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || item.difficulty === selectedDifficulty;
    const matchesType = selectedType === 'all' || item.type === selectedType;

    return matchesSearch && matchesCategory && matchesDifficulty && matchesType;
  });

  const categories = ['all', ...Array.from(new Set(content.map(item => item.category)))];
  const difficulties = ['all', 'beginner', 'intermediate', 'advanced'];
  const types = ['all', 'video', 'article', 'podcast', 'course'];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'article': return <FileText className="h-4 w-4" />;
      case 'podcast': return <Headphones className="h-4 w-4" />;
      case 'course': return <BookOpen className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleBookmark = (id: string) => {
    setContent(prev => prev.map(item => 
      item.id === id ? { ...item, isBookmarked: !item.isBookmarked } : item
    ));
  };

  const markAsCompleted = (id: string) => {
    setContent(prev => prev.map(item => 
      item.id === id ? { ...item, isCompleted: !item.isCompleted } : item
    ));
    
    if (progress) {
      setProgress(prev => ({
        ...prev!,
        completedContent: prev!.completedContent + 1
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Learning Center</h1>
          <p className="text-gray-600">Master DealershipAI with our comprehensive learning resources</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4" />
            Download All
          </Button>
          <Button>
            <Share2 className="h-4 w-4" />
            Share Progress
          </Button>
        </div>
      </div>

      {/* Progress Overview */}
      {progress && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{progress.completedContent}/{progress.totalContent}</div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Clock className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{progress.totalTimeSpent}m</div>
                  <div className="text-sm text-gray-600">Time Spent</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{progress.currentStreak}</div>
                  <div className="text-sm text-gray-600">Day Streak</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Award className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{progress.badges.length}</div>
                  <div className="text-sm text-gray-600">Badges Earned</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
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
            
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
              
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty === 'all' ? 'All Levels' : difficulty}
                  </option>
                ))}
              </select>
              
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                {types.map(type => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All Types' : type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContent.map((item) => (
          <Card key={item.id} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getTypeIcon(item.type)}
                  <Badge className={getDifficultyColor(item.difficulty)}>
                    {item.difficulty}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleBookmark(item.id)}
                  >
                    <Bookmark className={`h-4 w-4 ${item.isBookmarked ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                  </Button>
                  {item.isCompleted && (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                </div>
              </div>
              <CardTitle className="text-lg">{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4">{item.description}</p>
              
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {item.duration}
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  {item.rating}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {item.views}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1 mb-4">
                {item.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Button 
                  className="flex-1" 
                  size="sm"
                  onClick={() => markAsCompleted(item.id)}
                >
                  {item.isCompleted ? 'Completed' : 'Start Learning'}
                </Button>
                <Button variant="outline" size="sm">
                  <Play className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="text-xs text-gray-500 mt-2">
                By {item.author} • {item.publishedDate}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Badges and Certificates */}
      {progress && (progress.badges.length > 0 || progress.certificates.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="badges" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="badges">Badges ({progress.badges.length})</TabsTrigger>
                <TabsTrigger value="certificates">Certificates ({progress.certificates.length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="badges" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {progress.badges.map((badge, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <Award className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <div className="font-medium">{badge}</div>
                        <div className="text-sm text-gray-600">Learning Badge</div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="certificates" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {progress.certificates.map((certificate, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{certificate}</div>
                        <div className="text-sm text-gray-600">Completion Certificate</div>
                      </div>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}