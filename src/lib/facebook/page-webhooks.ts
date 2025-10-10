/**
 * Facebook Page Webhooks Integration (Compliant)
 * Replaces deprecated Groups API with Page-centric approach
 */

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Initialize Supabase client with fallback
let supabase: any = null;
try {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }
} catch (error) {
  console.warn('Supabase client creation failed in Facebook webhooks:', error);
}

interface FacebookPagePost {
  id: string;
  message?: string;
  created_time: string;
  from: {
    id: string;
    name: string;
  };
  comments?: {
    data: Array<{
      id: string;
      message: string;
      created_time: string;
      from: {
        id: string;
        name: string;
      };
    }>;
  };
  reactions?: {
    data: Array<{
      id: string;
      name: string;
    }>;
  };
}

interface ProcessedContent {
  id: string;
  content: string;
  author: string;
  timestamp: string;
  type: 'post' | 'comment';
  reactions_count: number;
  comments_count: number;
  sentiment_score: number;
  redacted_content: string;
}

/**
 * Verify Facebook webhook signature
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  appSecret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', appSecret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}

/**
 * Process Facebook Page posts and comments
 */
export async function processPageContent(
  pageId: string,
  accessToken: string
): Promise<ProcessedContent[]> {
  try {
    // Fetch recent posts from the page
    const postsResponse = await fetch(
      `https://graph.facebook.com/v19.0/${pageId}/posts?access_token=${accessToken}&fields=id,message,created_time,from,comments{id,message,created_time,from},reactions&limit=25`
    );
    
    if (!postsResponse.ok) {
      throw new Error(`Facebook API error: ${postsResponse.statusText}`);
    }
    
    const postsData = await postsResponse.json();
    const processedContent: ProcessedContent[] = [];
    
    for (const post of postsData.data || []) {
      // Process main post
      if (post.message) {
        const processed = await processContentItem(post, 'post');
        processedContent.push(processed);
      }
      
      // Process comments
      if (post.comments?.data) {
        for (const comment of post.comments.data) {
          const processed = await processContentItem(comment, 'comment');
          processedContent.push(processed);
        }
      }
    }
    
    return processedContent;
  } catch (error) {
    console.error('Error processing Facebook page content:', error);
    throw error;
  }
}

/**
 * Process individual content item (post or comment)
 */
async function processContentItem(
  item: any,
  type: 'post' | 'comment'
): Promise<ProcessedContent> {
  // Redact PII
  const redactedContent = redactPII(item.message);
  
  // Calculate sentiment
  const sentimentScore = await calculateSentiment(redactedContent);
  
  // Count reactions and comments
  const reactionsCount = item.reactions?.data?.length || 0;
  const commentsCount = type === 'post' ? (item.comments?.data?.length || 0) : 0;
  
  return {
    id: item.id,
    content: item.message,
    author: item.from.name,
    timestamp: item.created_time,
    type,
    reactions_count: reactionsCount,
    comments_count: commentsCount,
    sentiment_score: sentimentScore,
    redacted_content: redactedContent,
  };
}

/**
 * Redact PII from content
 */
function redactPII(content: string): string {
  // Remove phone numbers
  content = content.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE]');
  
  // Remove email addresses
  content = content.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]');
  
  // Remove addresses (basic pattern)
  content = content.replace(/\b\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd)\b/g, '[ADDRESS]');
  
  // Remove credit card numbers
  content = content.replace(/\b\d{4}[-.\s]?\d{4}[-.\s]?\d{4}[-.\s]?\d{4}\b/g, '[CARD]');
  
  return content;
}

/**
 * Calculate sentiment score using simple keyword analysis
 * In production, use a proper sentiment analysis service
 */
async function calculateSentiment(content: string): Promise<number> {
  const positiveWords = ['great', 'excellent', 'amazing', 'love', 'perfect', 'fantastic', 'wonderful', 'outstanding'];
  const negativeWords = ['terrible', 'awful', 'hate', 'horrible', 'disappointed', 'bad', 'worst', 'poor'];
  
  const words = content.toLowerCase().split(/\s+/);
  let score = 0;
  
  words.forEach(word => {
    if (positiveWords.includes(word)) score += 1;
    if (negativeWords.includes(word)) score -= 1;
  });
  
  // Normalize to -1 to 1 range
  return Math.max(-1, Math.min(1, score / Math.max(words.length / 10, 1)));
}

/**
 * Store processed content in database
 */
export async function storeProcessedContent(
  content: ProcessedContent[],
  dealershipId: string
): Promise<void> {
  try {
    if (!supabase) {
      console.log(`Mock: Would store ${content.length} Facebook page content items for ${dealershipId}`);
      return;
    }

    const contentData = content.map(item => ({
      dealership_id: dealershipId,
      platform: 'facebook_page',
      content_id: item.id,
      content_type: item.type,
      author: item.author,
      content_text: item.redacted_content,
      original_content: item.content,
      sentiment_score: item.sentiment_score,
      reactions_count: item.reactions_count,
      comments_count: item.comments_count,
      created_at: item.timestamp,
      processed_at: new Date().toISOString(),
    }));
    
    const { error } = await supabase
      .from('ugc_content')
      .insert(contentData);
    
    if (error) {
      throw error;
    }
    
    console.log(`Stored ${contentData.length} Facebook page content items`);
  } catch (error) {
    console.error('Error storing processed content:', error);
    throw error;
  }
}

/**
 * Webhook handler for Facebook Page events
 */
export async function handlePageWebhook(
  body: any,
  signature: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Verify webhook signature
    const appSecret = process.env.FACEBOOK_APP_SECRET!;
    const payload = JSON.stringify(body);
    
    if (!verifyWebhookSignature(payload, signature, appSecret)) {
      return { success: false, message: 'Invalid signature' };
    }
    
    // Handle different webhook events
    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        switch (change.field) {
          case 'feed':
            await handleFeedChange(change, entry.id);
            break;
          case 'comments':
            await handleCommentChange(change, entry.id);
            break;
          default:
            console.log(`Unhandled webhook field: ${change.field}`);
        }
      }
    }
    
    return { success: true, message: 'Webhook processed successfully' };
  } catch (error) {
    console.error('Webhook processing error:', error);
    return { success: false, message: 'Webhook processing failed' };
  }
}

/**
 * Handle feed changes (new posts)
 */
async function handleFeedChange(change: any, pageId: string): Promise<void> {
  console.log('Processing feed change:', change);
  
  // Fetch the new post data
  const accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN!;
  const postId = change.value.post_id;
  
  const response = await fetch(
    `https://graph.facebook.com/v19.0/${postId}?access_token=${accessToken}&fields=id,message,created_time,from,comments{id,message,created_time,from},reactions`
  );
  
  if (response.ok) {
    const post = await response.json();
    const processed = await processContentItem(post, 'post');
    
    // Store in database
    await storeProcessedContent([processed], pageId);
  }
}

/**
 * Handle comment changes
 */
async function handleCommentChange(change: any, pageId: string): Promise<void> {
  console.log('Processing comment change:', change);
  
  // Similar processing for comments
  const accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN!;
  const commentId = change.value.comment_id;
  
  const response = await fetch(
    `https://graph.facebook.com/v19.0/${commentId}?access_token=${accessToken}&fields=id,message,created_time,from`
  );
  
  if (response.ok) {
    const comment = await response.json();
    const processed = await processContentItem(comment, 'comment');
    
    // Store in database
    await storeProcessedContent([processed], pageId);
  }
}

/**
 * Get UGC health score for a dealership
 */
export async function calculateUGCHealthScore(dealershipId: string): Promise<{
  score: number;
  metrics: {
    total_posts: number;
    total_comments: number;
    avg_sentiment: number;
    engagement_rate: number;
    response_rate: number;
  };
}> {
  try {
    if (!supabase) {
      // Return mock data when Supabase is not available
      return {
        score: 75,
        metrics: {
          total_posts: 12,
          total_comments: 45,
          avg_sentiment: 0.3,
          engagement_rate: 3.2,
          response_rate: 0.8,
        },
      };
    }

    const { data: content, error } = await supabase
      .from('ugc_content')
      .select('*')
      .eq('dealership_id', dealershipId)
      .eq('platform', 'facebook_page')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Last 30 days
    
    if (error) throw error;
    
    const posts = content.filter(c => c.content_type === 'post');
    const comments = content.filter(c => c.content_type === 'comment');
    
    const totalPosts = posts.length;
    const totalComments = comments.length;
    const avgSentiment = content.reduce((sum, c) => sum + c.sentiment_score, 0) / content.length || 0;
    
    // Calculate engagement rate (reactions + comments per post)
    const totalEngagement = content.reduce((sum, c) => sum + c.reactions_count + c.comments_count, 0);
    const engagementRate = totalPosts > 0 ? totalEngagement / totalPosts : 0;
    
    // Calculate response rate (comments with responses)
    const postsWithResponses = posts.filter(p => p.comments_count > 0).length;
    const responseRate = totalPosts > 0 ? postsWithResponses / totalPosts : 0;
    
    // Calculate overall UGC health score (0-100)
    const sentimentScore = Math.max(0, (avgSentiment + 1) * 50); // Convert -1,1 to 0,100
    const engagementScore = Math.min(100, engagementRate * 10); // Scale engagement
    const responseScore = responseRate * 100;
    
    const overallScore = (sentimentScore * 0.4 + engagementScore * 0.3 + responseScore * 0.3);
    
    return {
      score: Math.round(overallScore),
      metrics: {
        total_posts: totalPosts,
        total_comments: totalComments,
        avg_sentiment: avgSentiment,
        engagement_rate: engagementRate,
        response_rate: responseRate,
      },
    };
  } catch (error) {
    console.error('Error calculating UGC health score:', error);
    throw error;
  }
}
