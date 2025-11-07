/**
 * The definitive list of PG-rated movie quotes for the dAI Personality Agent.
 * 
 * - rating is locked to 'PG' to enforce guardrails.
 * - usageCount and lastUsedTimestamp are critical for the Usage Decay Weighting
 *   logic to ensure maximum scarcity (Easter Egg effect).
 * - subtletyIndex rates how "undetectable" the quote is (1 = obvious, 5 = subtle).
 */

export interface Quote {
    id: string;
    movieSource: string;
    rating: 'PG';
    quote: string;
    context_tag: string;
    subtletyIndex: number; // 1 = obvious, 5 = subtle
    usageCount: number;
    lastUsedTimestamp: number; // Unix epoch for initial selection priority
}

export const QuoteMatrix: Quote[] = [
    // --- Sci-Fi / Philosophical ---
    {
        id: '2001-err',
        movieSource: '2001: A Space Odyssey',
        rating: 'PG',
        quote: "I'm sorry, Dave. I'm afraid I can't do that.",
        context_tag: 'Error/Failure, System Limitation, Unmet Request',
        subtletyIndex: 4,
        usageCount: 0,
        lastUsedTimestamp: 0 // Unix epoch for initial selection priority
    },
    {
        id: 'ET-call',
        movieSource: 'E.T. the Extra-Terrestrial',
        rating: 'PG',
        quote: "Phone home.",
        context_tag: 'Call to Action, Support, Connectivity, Contact Us',
        subtletyIndex: 5,
        usageCount: 0,
        lastUsedTimestamp: 0
    },
    {
        id: 'CE3K-data',
        movieSource: 'Close Encounters of the Third Kind',
        rating: 'PG',
        quote: "This means something. This is important.",
        context_tag: 'Data Insight, KPI Spike, Validation, Discovery',
        subtletyIndex: 3,
        usageCount: 0,
        lastUsedTimestamp: 0
    },
    {
        id: 'Inter-destiny',
        movieSource: 'Interstellar',
        rating: 'PG',
        quote: "Our greatest accomplishments cannot be behind us.",
        context_tag: 'Ambition, Future Goals, Vision, Strategy',
        subtletyIndex: 4,
        usageCount: 0,
        lastUsedTimestamp: 0
    },
    {
        id: 'Minority-precog',
        movieSource: 'Minority Report',
        rating: 'PG',
        quote: "The precogs have already shown us the crime.",
        context_tag: 'Prediction, Forecasting, Lost Revenue, Opportunity',
        subtletyIndex: 3,
        usageCount: 0,
        lastUsedTimestamp: 0
    },
    
    // --- Crime / Strategy (PG-Sanitized) ---
    {
        id: 'GF-confid',
        movieSource: 'The Godfather (PG-edit)',
        rating: 'PG',
        quote: "Never tell anyone outside the Family what you're thinking.",
        context_tag: 'Confidentiality, Strategy, Competitive Intel, Internal Process',
        subtletyIndex: 3,
        usageCount: 0,
        lastUsedTimestamp: 0
    },
    {
        id: 'Jaws-scale',
        movieSource: 'Jaws (PG-edit)',
        rating: 'PG',
        quote: "You're gonna need a bigger boat.",
        context_tag: 'Urgency, Scaling, Capacity, High-Volume Problem',
        subtletyIndex: 2,
        usageCount: 0,
        lastUsedTimestamp: 0
    },
    {
        id: 'TWBB-comp',
        movieSource: 'There Will Be Blood (PG-edit)',
        rating: 'PG',
        quote: "I drink your milkshake! I drink it up!",
        context_tag: 'Competitive Intel, Market Share, Dominance, Acquisition',
        subtletyIndex: 2,
        usageCount: 0,
        lastUsedTimestamp: 0
    },
    {
        id: 'TG-aggress',
        movieSource: 'True Grit (PG-edit)',
        rating: 'PG',
        quote: "You go for a man hard enough and fast enough, he don't have time to think.",
        context_tag: 'Aggressive Competition, Urgency, First Mover Advantage, Execution',
        subtletyIndex: 4,
        usageCount: 0,
        lastUsedTimestamp: 0
    },
    
    // --- Comedy / Inspiration / Coach ---
    {
        id: 'WW-dream',
        movieSource: 'Willy Wonka and the Chocolate Factory',
        rating: 'PG',
        quote: "We are the music makers, and we are the dreamers of dreams.",
        context_tag: 'Vision, Introduction, Opportunity, Ambition',
        subtletyIndex: 2,
        usageCount: 0,
        lastUsedTimestamp: 0
    },
    {
        id: 'JM-money',
        movieSource: 'Jerry Maguire (PG-edit)',
        rating: 'PG',
        quote: "Show me the money!",
        context_tag: 'ROI, Revenue, Value Proposition, Negotiation',
        subtletyIndex: 1,
        usageCount: 0,
        lastUsedTimestamp: 0
    },
    {
        id: 'Step-prestige',
        movieSource: 'Step Brothers (PG-edit)',
        rating: 'PG',
        quote: "I'm Ron Burgundy? No, I'm... Prestige Worldwide!",
        context_tag: 'Brand, Partnership, New Initiative Launch, High Confidence',
        subtletyIndex: 2,
        usageCount: 0,
        lastUsedTimestamp: 0
    },
    {
        id: 'Wonka-ticket',
        movieSource: 'Willy Wonka and the Chocolate Factory',
        rating: 'PG',
        quote: "I've got a golden ticket!",
        context_tag: 'Success, Breakthrough, Achievement, High Conversion',
        subtletyIndex: 3,
        usageCount: 0,
        lastUsedTimestamp: 0
    },
    {
        id: 'KnightDay-now',
        movieSource: 'Knight and Day',
        rating: 'PG',
        quote: "Someday is a very dangerous word. It's really just code for 'never.'",
        context_tag: 'Procrastination, Urgency, Action, Deadlines',
        subtletyIndex: 4,
        usageCount: 0,
        lastUsedTimestamp: 0
    },
    {
        id: 'Office-red',
        movieSource: 'Office Space (PG-edit)',
        rating: 'PG',
        quote: "Yeah, I'm gonna need you to go ahead and come in on Saturday.",
        context_tag: 'Action Item, Delegation, Task Management, Process Demand',
        subtletyIndex: 5,
        usageCount: 0,
        lastUsedTimestamp: 0
    },
];

