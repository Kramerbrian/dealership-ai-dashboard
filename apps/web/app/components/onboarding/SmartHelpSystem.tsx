'use client';

import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  Search, 
  Lightbulb, 
  BookOpen, 
  Video, 
  MessageCircle,
  ExternalLink,
  X,
  ChevronDown,
  ChevronUp,
  Play,
  Clock,
  Star,
  Zap,
  Target,
  Globe,
  BarChart3,
  MapPin
} from 'lucide-react';

interface HelpItem {
  id: string;
  title: string;
  description: string;
  type: 'guide' | 'video' | 'faq' | 'tip';
  duration?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  content: string;
  relatedSteps?: string[];
  icon?: React.ReactNode;
}

interface SmartHelpSystemProps {
  stepId: string;
  context?: {
    dealershipName?: string;
    currentStep?: string;
    progress?: number;
    integrationData?: Record<string, any>;
  };
  onHelpRequest?: (helpType: string) => void;
}

export default function SmartHelpSystem({ 
  stepId, 
  context, 
  onHelpRequest 
}: SmartHelpSystemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedItem, setSelectedItem] = useState<HelpItem | null>(null);

  const helpItems: HelpItem[] = [
    {
      id: 'website-setup',
      title: 'How to find your website URL',
      description: 'Learn how to locate and format your dealership website URL',
      type: 'guide',
      duration: '2 min read',
      difficulty: 'Beginner',
      category: 'Website Setup',
      content: 'Your website URL is the address where customers can find your dealership online. It usually looks like www.yourdealership.com or https://www.yourdealership.com. You can find this in your browser\'s address bar when you visit your website.',
      relatedSteps: ['required_setup'],
      icon: <Globe className="w-5 h-5" />
    },
    {
      id: 'gbp-setup',
      title: 'Finding your Google Business Profile ID',
      description: 'Step-by-step guide to locate your Google Business Profile ID',
      type: 'guide',
      duration: '3 min read',
      difficulty: 'Beginner',
      category: 'Google Business Profile',
      content: 'To find your Google Business Profile ID: 1) Go to your Google Business Profile dashboard, 2) Click on "Info" in the left menu, 3) Scroll down to "Advanced settings", 4) Your Business Profile ID will be listed there (starts with "ChIJ...").',
      relatedSteps: ['required_setup'],
      icon: <MapPin className="w-5 h-5" />
    },
    {
      id: 'ga4-setup',
      title: 'Connecting Google Analytics 4',
      description: 'Complete guide to setting up GA4 integration',
      type: 'guide',
      duration: '5 min read',
      difficulty: 'Intermediate',
      category: 'Google Analytics',
      content: 'To connect Google Analytics 4: 1) Go to your GA4 property, 2) Click on "Admin" in the bottom left, 3) Under "Property", click "Property Settings", 4) Copy your Property ID (starts with "G-..."). This gives you 87% more accurate traffic insights.',
      relatedSteps: ['google_analytics'],
      icon: <BarChart3 className="w-5 h-5" />
    },
    {
      id: 'quick-tips',
      title: 'Quick Setup Tips',
      description: 'Pro tips to speed up your onboarding process',
      type: 'tip',
      duration: '1 min read',
      difficulty: 'Beginner',
      category: 'General',
      content: '💡 Pro Tips: 1) Have your website URL and Google Business Profile ready before starting, 2) Use the AI assistant for personalized guidance, 3) You can always add more integrations later, 4) Start with just the required fields to get going quickly.',
      relatedSteps: ['welcome', 'required_setup'],
      icon: <Lightbulb className="w-5 h-5" />
    },
    {
      id: 'troubleshooting',
      title: 'Common Setup Issues',
      description: 'Solutions to the most common onboarding problems',
      type: 'faq',
      duration: '3 min read',
      difficulty: 'Beginner',
      category: 'Troubleshooting',
      content: 'Common issues and solutions: 1) "Invalid URL" - Make sure to include www. or https://, 2) "Can\'t find GBP ID" - Check your Google Business Profile is verified, 3) "GA4 not working" - Ensure you have admin access to the property.',
      relatedSteps: ['required_setup', 'google_analytics'],
      icon: <HelpCircle className="w-5 h-5" />
    }
  ];

  const categories = [
    { id: 'all', name: 'All Help', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'Website Setup', name: 'Website', icon: <Globe className="w-4 h-4" /> },
    { id: 'Google Business Profile', name: 'GBP', icon: <MapPin className="w-4 h-4" /> },
    { id: 'Google Analytics', name: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'General', name: 'General', icon: <Lightbulb className="w-4 h-4" /> },
    { id: 'Troubleshooting', name: 'Help', icon: <HelpCircle className="w-4 h-4" /> }
  ];

  const filteredItems = helpItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesStep = !item.relatedSteps || item.relatedSteps.includes(stepId);
    
    return matchesSearch && matchesCategory && matchesStep;
  });

  const getContextualTips = () => {
    const tips = [];
    
    if (stepId === 'required_setup') {
      tips.push({
        icon: <Globe className="w-4 h-4" />,
        text: "You can enter just 'yourdealership.com' - we'll add the www and https automatically"
      });
      tips.push({
        icon: <MapPin className="w-4 h-4" />,
        text: "Your Google Business Profile ID starts with 'ChIJ' and is about 27 characters long"
      });
    }
    
    if (stepId === 'google_analytics') {
      tips.push({
        icon: <BarChart3 className="w-4 h-4" />,
        text: "GA4 Property ID starts with 'G-' followed by 10 characters"
      });
      tips.push({
        icon: <Zap className="w-4 h-4" />,
        text: "This integration gives you 87% more accurate traffic insights"
      });
    }
    
    return tips;
  };

  const contextualTips = getContextualTips();

  const handleHelpRequest = (helpType: string) => {
    onHelpRequest?.(helpType);
    setIsOpen(true);
  };

  if (selectedItem) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-5 z-50">
        <div className="glass rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {selectedItem.icon}
              <h2 className="text-xl font-semibold">{selectedItem.title}</h2>
            </div>
            <button
              onClick={() => setSelectedItem(null)}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-sm text-white/60">
              {selectedItem.duration && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {selectedItem.duration}
                </div>
              )}
              {selectedItem.difficulty && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  {selectedItem.difficulty}
                </div>
              )}
              <div className="flex items-center gap-1">
                {selectedItem.type === 'guide' && <BookOpen className="w-4 h-4" />}
                {selectedItem.type === 'video' && <Video className="w-4 h-4" />}
                {selectedItem.type === 'faq' && <HelpCircle className="w-4 h-4" />}
                {selectedItem.type === 'tip' && <Lightbulb className="w-4 h-4" />}
                {selectedItem.type}
              </div>
            </div>
            
            <div className="prose prose-invert max-w-none">
              <p className="text-white/80 leading-relaxed">{selectedItem.content}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Help Button */}
      <button
        onClick={() => handleHelpRequest('general')}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/80 transition-all shadow-lg flex items-center justify-center z-40"
      >
        <HelpCircle className="w-6 h-6" />
      </button>

      {/* Help Panel */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center p-5 z-50">
          <div className="glass rounded-t-2xl p-6 w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Smart Help Center</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Contextual Tips */}
            {contextualTips.length > 0 && (
              <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <h3 className="font-semibold text-blue-400 mb-3 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  Quick Tips for This Step
                </h3>
                <div className="space-y-2">
                  {contextualTips.map((tip, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      {tip.icon}
                      <span className="text-white/80">{tip.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  placeholder="Search help articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                    selectedCategory === category.id
                      ? 'bg-[var(--brand-primary)] text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {category.icon}
                  {category.name}
                </button>
              ))}
            </div>

            {/* Help Items */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="glass rounded-xl p-4 cursor-pointer hover:bg-white/5 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[var(--brand-primary)]/20 flex items-center justify-center flex-shrink-0">
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{item.title}</h3>
                      <p className="text-sm text-white/70 mb-2">{item.description}</p>
                      <div className="flex items-center gap-4 text-xs text-white/50">
                        {item.duration && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {item.duration}
                          </div>
                        )}
                        {item.difficulty && (
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            {item.difficulty}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          {item.type === 'guide' && <BookOpen className="w-3 h-3" />}
                          {item.type === 'video' && <Video className="w-3 h-3" />}
                          {item.type === 'faq' && <HelpCircle className="w-3 h-3" />}
                          {item.type === 'tip' && <Lightbulb className="w-3 h-3" />}
                          {item.type}
                        </div>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-white/40" />
                  </div>
                </div>
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-8 text-white/60">
                <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No help articles found for your search.</p>
                <p className="text-sm">Try a different search term or category.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}