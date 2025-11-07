// dAIQuoteFetcher.ts
// 
// Adapter layer that bridges the legacy API to the new dAIQuoteFetcher implementation
// Maintains backward compatibility while using the enhanced personalization engine

import { dAIQuoteFetcher as newQuoteFetcher, formatQuote, QuoteContext } from './personalization/dAIQuoteFetcher';
import { QuoteMatrix, Quote } from './personalization/QuoteMatrix';

// --- Configuration Constants ---
const SCARCITY_CONFIG = {
    // 1 in 10 chance (10% chance) of even attempting a quote insertion.
    // This is the primary mechanism enforcing the "Easter Egg" scarcity.
    OVERALL_SELECTION_CHANCE: 0.10, 

    // Weights for the Usage Decay Formula
    WEIGHT_DECAY_DAYS: 0.5, // 0.5 point bonus for every day since last use
    WEIGHT_USAGE_COUNT: 5,  // 5 point penalty for every time used (heavy penalty for quick reuse)
    WEIGHT_SUBTLETY: 2,      // 2 point bonus for high-subtlety quotes (5/5)

    // Minimum score required to be eligible for selection, ensuring high quality/freshness.
    MIN_SELECTION_SCORE: 10,
};

// Interface for the input context and fallback text (legacy API maintained for backward compatibility)
export interface dAIQuoteFetcherProps {
    contextTag: string;
    defaultText: string;
    // Optional: Allows integration points to request a minimum subtlety level (e.g., error messages should be less subtle)
    minSubtlety?: number; 
}

/**
 * Maps legacy contextTag strings to new QuoteContextType
 */
function mapContextTagToContextType(contextTag: string): QuoteContext['type'] {
    const tagLower = contextTag.toLowerCase();
    
    if (tagLower.includes('error') || tagLower.includes('failure') || tagLower.includes('system limitation')) {
        return 'error';
    }
    if (tagLower.includes('success') || tagLower.includes('breakthrough') || tagLower.includes('achievement')) {
        return 'success';
    }
    if (tagLower.includes('urgency') || tagLower.includes('scaling') || tagLower.includes('procrastination') || tagLower.includes('action') || tagLower.includes('deadlines')) {
        return 'urgency';
    }
    if (tagLower.includes('data insight') || tagLower.includes('kpi spike') || tagLower.includes('validation') || tagLower.includes('discovery')) {
        return 'data';
    }
    if (tagLower.includes('competitive intel') || tagLower.includes('market share') || tagLower.includes('dominance') || tagLower.includes('acquisition')) {
        return 'competitor';
    }
    if (tagLower.includes('roi') || tagLower.includes('revenue') || tagLower.includes('value proposition') || tagLower.includes('negotiation')) {
        return 'roi';
    }
    if (tagLower.includes('vision') || tagLower.includes('introduction') || tagLower.includes('opportunity') || tagLower.includes('ambition')) {
        return 'vision';
    }
    if (tagLower.includes('endurance') || tagLower.includes('motivation') || tagLower.includes('long-term strategy')) {
        return 'endurance';
    }
    
    // Default fallback
    return 'info';
}

// --- Utility Functions ---

/**
 * Placeholder for a real time utility (in production, this would calculate time since epoch).
 */
function getDaysSince(timestamp: number): number {
    if (timestamp === 0) return 90; // Large arbitrary number for initial priority
    const now = Date.now();
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    return (now - timestamp) / millisecondsPerDay;
}

/**
 * Updates the quote usage tracking (localStorage for demo, API in production).
 */
function logQuoteUsage(quoteId: string): void {
    if (typeof window === 'undefined') return;
    
    try {
        const storageKey = 'dAI_quote_usage';
        const usageData = JSON.parse(localStorage.getItem(storageKey) || '{}');
        
        const quote = QuoteMatrix.find(q => q.id === quoteId);
        if (quote) {
            quote.usageCount = (usageData[quoteId]?.usageCount || quote.usageCount) + 1;
            quote.lastUsedTimestamp = Date.now();
            
            usageData[quoteId] = {
                usageCount: quote.usageCount,
                lastUsedTimestamp: quote.lastUsedTimestamp
            };
            
            localStorage.setItem(storageKey, JSON.stringify(usageData));
        }
    } catch (error) {
        console.error('Failed to update quote usage:', error);
    }
}




// --- The Persona Wrapper: Delivering the Wit ---

/**
 * Wraps the selected quote in the persona's voice (Reynolds, Seinfeld, Gillis).
 * This maintains the quote's subtlety while delivering the sharp, dry humor.
 */
function createWittyWrapper(quote: string, context: string, defaultText: string): string {
    const defaultObservation = `(Agent Observation: The data suggests that at times like this, the simple advice is always best: **"${quote}"**)`;

    // Check if context contains key phrases (handles comma-separated context tags)
    const contextLower = context.toLowerCase();

    if (contextLower.includes('error') || contextLower.includes('failure') || contextLower.includes('system limitation')) {
        // Reynolds/Seinfeld: Meta-aware, dry observation of the failure
        return `Look, you hit a snag. That's data for you—it's always something, right? You try to click the button, and the system basically just says, **"${quote}"**. Let's restart.`;
    }
        
    if (contextLower.includes('data insight') || contextLower.includes('kpi spike') || contextLower.includes('validation') || contextLower.includes('discovery')) {
        // Chappelle/Reynolds: Confident, earned celebration or sudden realization
        return `I know what you're seeing in this KPI. It looks like a random fluctuation, but if you look closer, **"${quote}"**—it's not luck, it's the algorithm. That's the real insight.`;
    }

    if (contextLower.includes('urgency') || contextLower.includes('action') || contextLower.includes('deadlines') || contextLower.includes('procrastination')) {
        // Gillis/Seinfeld: Dry, matter-of-fact push for immediate action
        return `That 'to-do' list is great. Really. But you can't just admire the problem. Remember: **"${quote}"**—I find that's true with leads *and* laundry. Let's execute.`;
    }

    if (contextLower.includes('competitive intel') || contextLower.includes('aggressive competition') || contextLower.includes('market share') || contextLower.includes('dominance')) {
        // Dry, confident coaching and strategy
        return `Your competitor is exposed. They thought they were slick, but the market is tight. It's an aggressive move, but when faced with an opportunity like this, **"${quote}"**—you don't have time for a polite handshake.`;
    }
        
    if (contextLower.includes('delegation') || contextLower.includes('task management') || contextLower.includes('action item') || contextLower.includes('process demand')) {
        // High Subtlety, Office Space / Seinfeld Observation
        return `${defaultText}. Oh, and while you're at it, don't forget to implement the new tracking codes. **"${quote}"**—it's foundational.`;
    }

    // Fallback for less critical context tags
    return `${defaultText}. ${defaultObservation}`;
}

// --- The Scarcity & Persona Engine ---

/**
 * Fetches a highly sensitive, seldom-used PG quote based on context.
 * Returns the quote wrapped in the appropriate persona delivery.
 * 
 * This is a legacy adapter that maintains backward compatibility while using
 * the new dAIQuoteFetcher implementation from personalization engine.
 */
export function dAIQuoteFetcher({ 
    contextTag, 
    defaultText, 
    minSubtlety = 1
}: dAIQuoteFetcherProps): string {
    // Map legacy contextTag to new QuoteContext format
    const contextType = mapContextTagToContextType(contextTag);
    
    // Extract keywords from contextTag for better matching
    const keywords = contextTag.split(',').map(t => t.trim());
    
    // Create QuoteContext for new implementation
    const context: QuoteContext = {
        type: contextType,
        keywords: keywords,
        severity: contextTag.toLowerCase().includes('critical') ? 'high' : 
                  contextTag.toLowerCase().includes('warning') ? 'medium' : 'low'
    };
    
    // Use new implementation (defaults to 'free' tier for PG-only quotes)
    const result = newQuoteFetcher(defaultText, context, 'free');
    
    // If quote was selected, format it with persona wrapper
    if (result.wasSelected && result.quote) {
        // Filter by minSubtlety if specified
        if (result.quote.subtletyIndex < minSubtlety) {
            return defaultText;
        }
        
        // Use the witty wrapper function for persona delivery
        const formattedQuote = formatQuote(result.quote, result.quote.subtletyIndex < 4);
        return createWittyWrapper(formattedQuote, contextTag, defaultText);
    }
    
    // Fallback to default text (90% of the time due to scarcity)
    return defaultText;
}


