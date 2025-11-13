import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

// Quick reply templates for automotive dealerships
const quickReplyTemplates = [
  // Greeting responses
  "Thank you for your interest! How can I help you today?",
  "Hello! I'm here to assist you with any questions about our vehicles.",
  "Welcome! What brings you in today?",
  "Hi there! Looking for a specific vehicle or just browsing?",
  
  // Vehicle inquiries
  "That's a great choice! Let me get you more details on that vehicle.",
  "I'd be happy to show you that vehicle. When would be a good time to visit?",
  "That vehicle is still available! Would you like to schedule a test drive?",
  "Let me check the current inventory and get back to you with options.",
  
  // Pricing responses
  "I'd be happy to discuss pricing options with you. Let me prepare some numbers.",
  "We have competitive financing options available. Would you like to hear more?",
  "I can work with you on the price. What's your budget range?",
  "Let me see what incentives and rebates are available for you.",
  
  // Service responses
  "I can help you schedule a service appointment. What type of service do you need?",
  "Our service department is excellent. Let me connect you with our service team.",
  "I'll get you set up with a service appointment. What's your preferred time?",
  "We offer competitive service rates. Let me get you a quote.",
  
  // Follow-up responses
  "Thank you for your time today! I'll follow up with you tomorrow.",
  "I'll send you those details via email shortly.",
  "Let me know if you have any other questions!",
  "I'm here if you need anything else. Have a great day!",
  
  // Objection handling
  "I understand your concern. Let me address that for you.",
  "That's a valid point. Here's how we can work around that.",
  "I hear you. Let me show you why this is still a great option.",
  "I appreciate your honesty. Let me find a solution that works for you.",
  
  // Urgency responses
  "This vehicle is in high demand. I'd recommend acting quickly.",
  "We have limited inventory on this model. Would you like to reserve it?",
  "The current promotion ends soon. Let me get you locked in today.",
  "This is a great deal that won't last long. Shall we move forward?",
  
  // Closing responses
  "Are you ready to make this vehicle yours today?",
  "What would it take to get you driving this vehicle home today?",
  "Let's get you behind the wheel of your new car!",
  "I'm confident this is the right vehicle for you. Shall we proceed?"
];

// Generate a random quick reply name
export function generateName(): string {
  const prefixes = [
    'Auto', 'Car', 'Drive', 'Motor', 'Speed', 'Road', 'Wheel', 'Gear',
    'Fast', 'Quick', 'Smart', 'Pro', 'Elite', 'Prime', 'Max', 'Turbo'
  ];
  
  const suffixes = [
    'Reply', 'Response', 'Answer', 'Message', 'Text', 'Chat', 'Bot',
    'Assistant', 'Helper', 'Guide', 'Expert', 'Pro', 'Master', 'Genius'
  ];
  
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  const number = Math.floor(Math.random() * 999) + 1;
  
  return `${prefix}${suffix}${number}`;
}

// Generate a quick reply object
function generateQuickReply(tenantId: string) {
  const name = generateName();
  const template = quickReplyTemplates[Math.floor(Math.random() * quickReplyTemplates.length)];
  
  // Add some variation to the template
  const variations = [
    template,
    template.replace(/!/g, '.'),
    template.replace(/\./g, '!'),
    template.toLowerCase(),
    template.toUpperCase()
  ];
  
  const content = variations[Math.floor(Math.random() * variations.length)];
  
  return {
    id: `qr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    tenant_id: tenantId,
    name,
    content,
    category: getRandomCategory(),
    tags: getRandomTags(),
    usage_count: Math.floor(Math.random() * 100),
    is_active: Math.random() > 0.1, // 90% active
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

function getRandomCategory(): string {
  const categories = [
    'greeting', 'vehicle_inquiry', 'pricing', 'service', 'follow_up',
    'objection_handling', 'urgency', 'closing', 'general'
  ];
  return categories[Math.floor(Math.random() * categories.length)];
}

function getRandomTags(): string[] {
  const allTags = [
    'new_customer', 'returning_customer', 'price_sensitive', 'urgent',
    'test_drive', 'financing', 'trade_in', 'service', 'warranty',
    'inventory', 'promotion', 'follow_up', 'objection', 'closing'
  ];
  
  const numTags = Math.floor(Math.random() * 3) + 1; // 1-3 tags
  const shuffled = allTags.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numTags);
}

// Seed quick replies for a tenant
export async function seedQuickReplies(supabase: any, count: number = 10, tenantId?: string): Promise<void> {
  const targetTenantId = tenantId || 'default-tenant';
  
  try {
    const quickReplies = Array.from({ length: count }, () => generateQuickReply(targetTenantId));
    
    const { data, error } = await supabase
      .from('quick_replies')
      .insert(quickReplies);
    
    if (error) {
      console.error('Error seeding quick replies:', error);
      throw error;
    }
    
    console.log(`Successfully seeded ${count} quick replies for tenant ${targetTenantId}`);
    return data;
    
  } catch (error) {
    console.error('Failed to seed quick replies:', error);
    throw error;
  }
}

// Get quick replies for a tenant
export async function getQuickReplies(tenantId: string, category?: string): Promise<any[]> {
  try {
    let query = supabase
      .from('quick_replies')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .order('usage_count', { ascending: false });
    
    if (category) {
      query = query.eq('category', category);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching quick replies:', error);
      throw error;
    }
    
    return data || [];
    
  } catch (error) {
    console.error('Failed to fetch quick replies:', error);
    throw error;
  }
}

// Update quick reply usage count
export async function updateQuickReplyUsage(replyId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('quick_replies')
      .update({ 
        usage_count: supabase.raw('usage_count + 1'),
        updated_at: new Date().toISOString()
      })
      .eq('id', replyId);
    
    if (error) {
      console.error('Error updating quick reply usage:', error);
      throw error;
    }
    
  } catch (error) {
    console.error('Failed to update quick reply usage:', error);
    throw error;
  }
}

// Search quick replies by content
export async function searchQuickReplies(tenantId: string, searchTerm: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('quick_replies')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .ilike('content', `%${searchTerm}%`)
      .order('usage_count', { ascending: false });
    
    if (error) {
      console.error('Error searching quick replies:', error);
      throw error;
    }
    
    return data || [];
    
  } catch (error) {
    console.error('Failed to search quick replies:', error);
    throw error;
  }
}

// Example usage (as shown in your snippet)
export async function exampleUsage() {
  // Seed 10 quick replies
  await seedQuickReplies(supabase, 10);
  
  // Generate a random name
  console.log(generateName()); // prints a quick-reply name
  
  // Get quick replies for a tenant
  const replies = await getQuickReplies('default-tenant', 'greeting');
  console.log('Greeting replies:', replies);
  
  // Search for specific content
  const searchResults = await searchQuickReplies('default-tenant', 'thank you');
  console.log('Search results:', searchResults);
}
