'use client';

import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  X, 
  Play, 
  ExternalLink, 
  MessageCircle,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';

interface HelpContent {
  id: string;
  title: string;
  description: string;
  type: 'text' | 'video' | 'link' | 'contact';
  content: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime?: string;
}

interface SmartHelpSystemProps {
  stepId: string;
  userInput?: string;
  errorType?: string;
  onHelpRequest?: (helpType: string) => void;
}

export default function SmartHelpSystem({ 
  stepId, 
  userInput, 
  errorType, 
  onHelpRequest 
}: SmartHelpSystemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [helpContent, setHelpContent] = useState<HelpContent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showContact, setShowContact] = useState(false);

  useEffect(() => {
    if (errorType || userInput) {
      generateContextualHelp();
    }
  }, [stepId, userInput, errorType]);

  const generateContextualHelp = async () => {
    setIsLoading(true);
    
    try {
      // Analyze user input and error type to generate relevant help
      const helpItems = await getContextualHelp(stepId, userInput, errorType);
      setHelpContent(helpItems);
      
      if (helpItems.length > 0) {
        setIsOpen(true);
      }
    } catch (error) {
      console.error('Failed to generate help content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getContextualHelp = async (stepId: string, userInput?: string, errorType?: string): Promise<HelpContent[]> => {
    // This would typically call an API to generate contextual help
    // For now, we'll use predefined help content based on step and context
    
    const helpMap: Record<string, HelpContent[]> = {
      'required-setup': [
        {
          id: 'website-url-help',
          title: 'Finding Your Website URL',
          description: 'Your website URL is the address where customers can find your dealership online.',
          type: 'text',
          content: 'Enter your full website address including https:// (e.g., https://www.yourdealership.com)',
          priority: 'high'
        },
        {
          id: 'gbp-id-help',
          title: 'Finding Your Google Business Profile ID',
          description: 'Your Google Business Profile ID is a unique identifier for your business listing.',
          type: 'video',
          content: 'https://youtube.com/watch?v=example',
          priority: 'high',
          estimatedTime: '2 minutes'
        }
      ],
      'google-analytics': [
        {
          id: 'ga4-property-id',
          title: 'Finding Your GA4 Property ID',
          description: 'Your Google Analytics 4 Property ID starts with "G-" followed by 10 characters.',
          type: 'text',
          content: 'Go to Google Analytics > Admin > Property Settings. Your Property ID will be displayed at the top.',
          priority: 'high'
        },
        {
          id: 'ga4-setup-guide',
          title: 'GA4 Setup Guide',
          description: 'Complete guide to setting up Google Analytics 4 for your dealership.',
          type: 'link',
          content: 'https://support.google.com/analytics/answer/9304153',
          priority: 'medium'
        }
      ],
      'social-media': [
        {
          id: 'facebook-page-id',
          title: 'Finding Your Facebook Page ID',
          description: 'Your Facebook Page ID is a unique number associated with your business page.',
          type: 'text',
          content: 'Go to your Facebook Page > About > Page Info. The Page ID is listed at the bottom.',
          priority: 'high'
        },
        {
          id: 'instagram-business-id',
          title: 'Finding Your Instagram Business ID',
          description: 'Your Instagram Business ID is required to connect your business account.',
          type: 'text',
          content: 'Go to your Instagram Business account > Settings > Account > Business Information.',
          priority: 'high'
        }
      ]
    };

    // Filter help based on error type
    if (errorType) {
      const errorHelp: Record<string, HelpContent> = {
        'invalid_format': {
          id: 'format-error',
          title: 'Invalid Format Error',
          description: 'The ID you entered doesn\'t match the expected format.',
          type: 'text',
          content: 'Please check the format and try again. Most IDs are case-sensitive.',
          priority: 'high'
        },
        'connection_failed': {
          id: 'connection-error',
          title: 'Connection Failed',
          description: 'We couldn\'t connect to your account. This might be due to permissions or network issues.',
          type: 'text',
          content: 'Please verify your credentials and ensure you have the necessary permissions.',
          priority: 'high'
        },
        'permission_denied': {
          id: 'permission-error',
          title: 'Permission Denied',
          description: 'You don\'t have the necessary permissions to access this account.',
          type: 'text',
          content: 'Please ensure you\'re logged into the correct account and have admin access.',
          priority: 'high'
        }
      };

      if (errorHelp[errorType]) {
        return [errorHelp[errorType], ...(helpMap[stepId] || [])];
      }
    }

    return helpMap[stepId] || [];
  };

  const handleHelpClick = (helpType: string) => {
    onHelpRequest?.(helpType);
  };

  const handleContactSupport = () => {
    setShowContact(true);
    onHelpRequest?.('contact_support');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-blue-400 bg-blue-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Play className="w-4 h-4" />;
      case 'link': return <ExternalLink className="w-4 h-4" />;
      case 'contact': return <MessageCircle className="w-4 h-4" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  if (!isOpen && !isLoading) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-12 h-12 bg-[var(--brand-primary)] text-white rounded-full shadow-lg hover:bg-[var(--brand-primary)]/80 transition-colors z-50"
      >
        <HelpCircle className="w-6 h-6 mx-auto" />
      </button>
    );
  }

  return (
    <>
      {/* Help Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-12 h-12 bg-[var(--brand-primary)] text-white rounded-full shadow-lg hover:bg-[var(--brand-primary)]/80 transition-colors z-50"
      >
        <HelpCircle className="w-6 h-6 mx-auto" />
      </button>

      {/* Help Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--brand-card)] border border-[var(--brand-border)] rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Need Help?</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white/70">Finding the best help for you...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {helpContent.map((help) => (
                  <div
                    key={help.id}
                    className="glass rounded-xl p-4 border border-white/20"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getPriorityColor(help.priority)}`}>
                        {getTypeIcon(help.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{help.title}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(help.priority)}`}>
                            {help.priority}
                          </span>
                        </div>
                        <p className="text-sm text-white/70 mb-3">{help.description}</p>
                        
                        {help.type === 'text' && (
                          <div className="text-sm text-white/90 bg-white/5 rounded-lg p-3">
                            {help.content}
                          </div>
                        )}
                        
                        {help.type === 'video' && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleHelpClick('video_help')}
                              className="flex items-center gap-2 px-3 py-2 bg-[var(--brand-primary)]/20 text-[var(--brand-primary)] rounded-lg hover:bg-[var(--brand-primary)]/30 transition-colors"
                            >
                              <Play className="w-4 h-4" />
                              Watch Video
                              {help.estimatedTime && (
                                <span className="text-xs text-white/60">({help.estimatedTime})</span>
                              )}
                            </button>
                          </div>
                        )}
                        
                        {help.type === 'link' && (
                          <a
                            href={help.content}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => handleHelpClick('external_link')}
                            className="inline-flex items-center gap-2 px-3 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                            View Guide
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Contact Support */}
                <div className="glass rounded-xl p-4 border border-white/20">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--brand-primary)]/20 flex items-center justify-center">
                      <MessageCircle className="w-4 h-4 text-[var(--brand-primary)]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">Still Need Help?</h3>
                      <p className="text-sm text-white/70 mb-4">
                        Our support team is here to help you get set up quickly.
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={handleContactSupport}
                          className="flex items-center gap-2 px-4 py-2 bg-[var(--brand-primary)] text-white rounded-lg hover:bg-[var(--brand-primary)]/80 transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Chat Support
                        </button>
                        <button
                          onClick={() => window.open('mailto:support@dealershipai.com')}
                          className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                        >
                          <Mail className="w-4 h-4" />
                          Email Us
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contact Support Modal */}
      {showContact && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--brand-card)] border border-[var(--brand-border)] rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Contact Support</h2>
              <button
                onClick={() => setShowContact(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 text-[var(--brand-primary)] mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Live Chat Available</h3>
                <p className="text-sm text-white/70 mb-4">
                  Our support team is online and ready to help you with your setup.
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-emerald-400 mb-4">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span>Online now</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    // Open chat widget
                    window.open('https://chat.dealershipai.com', '_blank');
                    setShowContact(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[var(--brand-primary)] text-white rounded-lg hover:bg-[var(--brand-primary)]/80 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  Start Live Chat
                </button>
                
                <button
                  onClick={() => {
                    window.open('mailto:support@dealershipai.com?subject=Onboarding Help', '_blank');
                    setShowContact(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  Send Email
                </button>
                
                <button
                  onClick={() => {
                    window.open('tel:+1-555-0123', '_blank');
                    setShowContact(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  Call Support
                </button>
              </div>

              <div className="text-center text-xs text-white/60">
                <p>Average response time: 2 minutes</p>
                <p>Available 24/7 for urgent issues</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
