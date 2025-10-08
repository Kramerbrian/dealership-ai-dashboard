const express = require('express');
const { Configuration, OpenAIApi } = require('openai');

const router = express.Router();

// Initialize OpenAI
let openai = null;
if (process.env.OPENAI_API_KEY) {
    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
    });
    openai = new OpenAIApi(configuration);
}

/**
 * POST /api/chatbot
 * Handle chatbot messages
 */
router.post('/', async (req, res) => {
    try {
        const { message, context = {} } = req.body;

        if (!message) {
            return res.status(400).json({
                error: 'Message is required'
            });
        }

        // Get AI response
        const response = await getAIResponse(message, context);

        res.json({
            response: response,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Chatbot error:', error);
        res.status(500).json({
            error: 'Failed to process message',
            message: error.message
        });
    }
});

/**
 * Get AI response using OpenAI or fallback to rule-based responses
 */
async function getAIResponse(message, context) {
    // If OpenAI is available, use it
    if (openai) {
        try {
            const completion = await openai.createChatCompletion({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: `You are DealershipAI Assistant, an expert in automotive dealership digital marketing and SEO. You help dealership owners understand their online presence, improve their AI visibility score, and provide actionable recommendations.

Your expertise includes:
- SEO optimization for automotive dealerships
- Google My Business optimization
- Social media marketing for car dealers
- Local search optimization
- Website performance analysis
- Conversion rate optimization
- Competitor analysis

Always provide helpful, actionable advice specific to automotive dealerships. Be concise but informative. If you don't know something, say so and suggest where they can find more information.`
                    },
                    {
                        role: "user",
                        content: message
                    }
                ],
                max_tokens: 500,
                temperature: 0.7
            });

            return completion.data.choices[0].message.content;

        } catch (error) {
            console.error('OpenAI API error:', error);
            // Fall back to rule-based responses
            return getRuleBasedResponse(message);
        }
    } else {
        // Use rule-based responses
        return getRuleBasedResponse(message);
    }
}

/**
 * Rule-based response system as fallback
 */
function getRuleBasedResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // AI Visibility Score related
    if (lowerMessage.includes('ai visibility score') || lowerMessage.includes('score')) {
        return "Your AI Visibility Score is calculated based on multiple factors including website performance, SEO optimization, social media presence, and local search visibility. The score ranges from 0-100, with higher scores indicating better online visibility. To get your actual score, please run a dealership analysis first.";
    }
    
    // SEO related
    if (lowerMessage.includes('seo') || lowerMessage.includes('search engine')) {
        return "To improve your SEO: 1) Optimize page titles and meta descriptions with relevant keywords, 2) Improve page loading speed (aim for under 3 seconds), 3) Add structured data markup for vehicles and business info, 4) Create quality content about your inventory and services, 5) Build local citations and encourage customer reviews.";
    }
    
    // Issues and problems
    if (lowerMessage.includes('issues') || lowerMessage.includes('problems') || lowerMessage.includes('what\'s wrong')) {
        return "Common issues I find include: slow page loading (over 3 seconds), missing or poor meta descriptions, poor mobile optimization, lack of local SEO optimization, insufficient social media presence, and missing structured data. Run an analysis to see your specific issues and get personalized recommendations.";
    }
    
    // Competitor analysis
    if (lowerMessage.includes('competitor') || lowerMessage.includes('competition') || lowerMessage.includes('rival')) {
        return "Competitor analysis helps you understand your market position and identify opportunities. I can analyze your competitors' SEO strategies, social media presence, and identify gaps where you can outperform them. This includes keyword analysis, backlink opportunities, and content gaps.";
    }
    
    // Google My Business
    if (lowerMessage.includes('google my business') || lowerMessage.includes('gmb') || lowerMessage.includes('google business')) {
        return "Google My Business is crucial for local visibility. Optimize by: 1) Complete all business information, 2) Add high-quality photos of your dealership and vehicles, 3) Encourage customer reviews, 4) Post regularly with updates and offers, 5) Respond to all reviews professionally, 6) Use relevant keywords in your business description.";
    }
    
    // Social media
    if (lowerMessage.includes('social media') || lowerMessage.includes('facebook') || lowerMessage.includes('instagram')) {
        return "For social media success: 1) Post consistently with engaging content about your inventory and services, 2) Use high-quality photos and videos of vehicles, 3) Engage with customers in comments and messages, 4) Share customer testimonials and success stories, 5) Use relevant hashtags, 6) Run targeted ads to reach local customers.";
    }
    
    // Website performance
    if (lowerMessage.includes('website') || lowerMessage.includes('site') || lowerMessage.includes('performance')) {
        return "Website performance is critical for SEO and user experience. Focus on: 1) Page loading speed (under 3 seconds), 2) Mobile responsiveness, 3) Clear navigation and user experience, 4) Fast checkout/contact processes, 5) High-quality images optimized for web, 6) SSL certificate and security, 7) Regular content updates.";
    }
    
    // Local SEO
    if (lowerMessage.includes('local') || lowerMessage.includes('near me') || lowerMessage.includes('location')) {
        return "Local SEO is essential for dealerships. Optimize by: 1) Consistent NAP (Name, Address, Phone) across all platforms, 2) Local keyword optimization, 3) Google My Business optimization, 4) Local directory listings, 5) Customer reviews and ratings, 6) Local content creation, 7) Community involvement and local events.";
    }
    
    // Conversion optimization
    if (lowerMessage.includes('conversion') || lowerMessage.includes('leads') || lowerMessage.includes('sales')) {
        return "To improve conversions: 1) Clear call-to-action buttons, 2) Easy contact forms and phone numbers, 3) Live chat or instant messaging, 4) Customer testimonials and reviews, 5) Special offers and incentives, 6) Mobile-friendly design, 7) Fast response times to inquiries, 8) Professional website design that builds trust.";
    }
    
    // Help and general questions
    if (lowerMessage.includes('help') || lowerMessage.includes('what can you do') || lowerMessage.includes('how can you help')) {
        return "I can help you with: analyzing your dealership's online presence, explaining your AI Visibility Score, providing SEO recommendations, competitor analysis, Google My Business optimization, social media strategies, website performance tips, and answering questions about your analytics data. What specific area would you like help with?";
    }
    
    // Pricing and plans
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('plan') || lowerMessage.includes('subscription')) {
        return "We offer three plans: Free (basic analysis), Starter ($20/month with 5 analyses), and Professional ($99/month with unlimited analyses). All paid plans include detailed insights, recommendations, and priority support. You can start with a 7-day free trial on any paid plan.";
    }
    
    // Analysis and reports
    if (lowerMessage.includes('analysis') || lowerMessage.includes('report') || lowerMessage.includes('data')) {
        return "Our analysis covers: website performance, SEO optimization, social media presence, local search visibility, competitor analysis, and AI-powered recommendations. The analysis provides actionable insights to improve your online visibility and attract more customers.";
    }
    
    // Default response
    return "I'm here to help with your dealership's digital marketing! I can assist with SEO optimization, social media strategies, Google My Business, competitor analysis, and improving your AI Visibility Score. What specific question do you have about your online presence?";
}

module.exports = router;
