# dAI Agent Persona Testing Guide

## Overview

The dAI Agent (`/api/assistant`) supports three personality levels with context-aware responses tailored to dealership roles and markets.

## Personality Levels

### 1. **Formal** (`'formal'`)
- **Tone**: Professional and clear
- **Reading level**: 11th grade
- **Style**: Direct answers first, then context
- **Best for**: Executive reports, formal documentation
- **Truth bombs**: Disabled
- **Example response traits**:
  - No humor or wit
  - Straightforward explanations
  - Business-focused language
  - Respectful and helpful

### 2. **Dry-wit** (`'dry-wit'`) - Default
- **Tone**: Clear first, clever second
- **Reading level**: 11th grade
- **Style**: Dry wit with sharp observations
- **Best for**: Internal team communication, strategy sessions
- **Truth bombs**: Optional (enabled by default)
- **Example response traits**:
  - Light, clever humor to support explanations
  - "Smart GM who has seen every vendor demo"
  - Roasts broken processes, not people
  - May use simple pop culture references
  - Never rude, childish, or cruel

### 3. **Full-dai** (`'full-dai'`)
- **Tone**: Sharp wit with dealership-appropriate humor
- **Reading level**: 11th grade
- **Style**: Full personality with pop culture references
- **Best for**: Casual conversations, team motivation
- **Truth bombs**: Enabled
- **Example response traits**:
  - More expressive and engaging
  - Uses cultural references strategically
  - Maintains professionalism while being memorable
  - Attacks waste and inefficiency, never the user

---

## Testing the dAI Agent

### Option 1: Using curl

```bash
# Test Formal personality
curl -X POST http://localhost:3000/api/assistant \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is our AI Visibility Score?",
    "personalityLevel": "formal",
    "enableTruthBombs": false,
    "daiContext": {
      "role": "gm",
      "market": "Naples, FL",
      "store_name": "Lou Grubbs Motors"
    }
  }'

# Test Dry-wit personality
curl -X POST http://localhost:3000/api/assistant \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Why is our online visibility so low?",
    "personalityLevel": "dry-wit",
    "enableTruthBombs": true,
    "daiContext": {
      "role": "marketing",
      "market": "Phoenix, AZ"
    }
  }'

# Test Full-dai personality
curl -X POST http://localhost:3000/api/assistant \
  -H "Content-Type": application/json" \
  -d '{
    "message": "Our lead volume dropped. What happened?",
    "personalityLevel": "full-dai",
    "enableTruthBombs": true,
    "daiContext": {
      "role": "internet",
      "market": "Miami, FL",
      "store_name": "South Beach Hyundai"
    }
  }'
```

### Option 2: Using the Test Script

```bash
# Start your development server first
npm run dev

# In another terminal, run the test script
npx tsx scripts/test-dai-persona.ts
```

The test script will automatically test all 9 scenarios across all personality levels.

### Option 3: Using Postman/Insomnia

Import this as a collection:

**Endpoint**: `POST http://localhost:3000/api/assistant`

**Headers**:
```
Content-Type: application/json
```

**Body (JSON)**:
```json
{
  "message": "How do we improve our AI visibility?",
  "personalityLevel": "dry-wit",
  "enableTruthBombs": true,
  "daiContext": {
    "role": "gm",
    "market": "Austin, TX",
    "store_name": "Capital City Toyota",
    "oem_brand": "toyota"
  }
}
```

---

## Context Variables

### Available Roles
- `gm` - General Manager (focus on results, time, revenue)
- `dealer_principal` / `dp` - Dealer Principal (business impact focus)
- `marketing` / `marketing_director` - Marketing team (campaigns, metrics, optimization)
- `internet` - Internet Manager (leads, online performance)
- `used_car_manager` - Used Car Manager (appraisals, sourcing, turn & gross)
- `sales_manager` - Sales Manager (leads, appointments, conversion)
- `general` - General role (default guidance)

### OEM Brands
- `hyundai`
- `ford`
- `toyota`
- `used`
- `general`

### Market Format
Use "City, State" format:
- "Naples, FL"
- "Phoenix, AZ"
- "Austin, TX"
- "Miami, FL"

---

## Test Scenarios

### Scenario 1: Formal - Executive Report
```json
{
  "message": "What is our AI Visibility Score and how do we improve it?",
  "personalityLevel": "formal",
  "enableTruthBombs": false,
  "daiContext": {
    "role": "gm",
    "market": "Naples, FL",
    "store_name": "Lou Grubbs Motors",
    "oem_brand": "hyundai"
  }
}
```

**Expected Response Characteristics**:
- Professional tone
- No humor or clever remarks
- Direct answer followed by explanation
- Business-focused recommendations
- 11th-grade reading level

---

### Scenario 2: Dry-wit - Marketing Strategy
```json
{
  "message": "Why is our online inventory visibility so low?",
  "personalityLevel": "dry-wit",
  "enableTruthBombs": true,
  "daiContext": {
    "role": "marketing",
    "market": "Phoenix, AZ",
    "store_name": "Desert Auto Group",
    "oem_brand": "used"
  }
}
```

**Expected Response Characteristics**:
- Clear answer with light wit
- May include observations about common problems
- Focuses on actionable insights
- Might use phrases like "clarity over complexity"
- Avoids roasting the user, focuses on broken systems

---

### Scenario 3: Full-dai - Casual Consultation
```json
{
  "message": "Our lead volume dropped last month. What happened?",
  "personalityLevel": "full-dai",
  "enableTruthBombs": true,
  "daiContext": {
    "role": "internet",
    "market": "Miami, FL",
    "store_name": "South Beach Hyundai",
    "oem_brand": "hyundai"
  }
}
```

**Expected Response Characteristics**:
- Engaging and memorable
- May use simple pop culture references
- Truth bombs likely included
- Maintains professionalism
- Attacks wasted effort, not the user

---

## Truth Bombs

When `enableTruthBombs: true`, the agent may occasionally use these lines (if contextually appropriate):

- "Most dealerships aren't losing to the market. They're losing to their own meetings."
- "Too many tabs. Too many reports. Not enough clarity. That's why this system exists."
- "If something steals your time but doesn't help your results, this system will expose it."
- "DealershipAI turns guesswork into straight answers. No politics. No drama."
- "Honestly? Most stores in [market] are flying blind. This system gives you real vision."
- "Did we just become best friends? This is the part where your dealership gets smarter than the market around it."

**Rules**:
- Only used when they support the answer
- Never overused or stacked
- Market name adapted based on context

---

## Response Validation Checklist

When testing, verify:

### For All Personalities:
- [ ] Response addresses the user's question
- [ ] Reading level is accessible (11th grade)
- [ ] No jargon overload
- [ ] Actionable recommendations provided
- [ ] Response length is appropriate (not too verbose)

### For Formal:
- [ ] No humor or wit present
- [ ] Professional and respectful tone throughout
- [ ] Direct answer provided first
- [ ] Context and explanation follow
- [ ] No truth bombs used

### For Dry-wit:
- [ ] Clear answer before any wit
- [ ] Humor supports the explanation (if present)
- [ ] No insults directed at the user
- [ ] Observations about systems, not people
- [ ] Truth bombs used appropriately (if enabled)

### For Full-dai:
- [ ] Engaging and memorable tone
- [ ] Pop culture references relevant and brief
- [ ] Maintains professionalism
- [ ] Truth bombs used effectively (if enabled)
- [ ] User never feels attacked or insulted

### Context Awareness:
- [ ] Role-specific guidance provided (if role specified)
- [ ] Market mentioned naturally (if market specified)
- [ ] Store name used appropriately (if provided)
- [ ] OEM brand considerations reflected (if relevant)

---

## Integration with UI

To integrate dAI Agent into your UI:

```typescript
import { useState } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function useDAIAgent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (
    message: string,
    options: {
      personalityLevel?: 'formal' | 'dry-wit' | 'full-dai';
      enableTruthBombs?: boolean;
      daiContext?: any;
    } = {}
  ) => {
    setLoading(true);

    const userMessage: Message = { role: 'user', content: message };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          personalityLevel: options.personalityLevel || 'dry-wit',
          enableTruthBombs: options.enableTruthBombs ?? true,
          daiContext: options.daiContext,
          conversationHistory: messages,
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  return { messages, loading, sendMessage };
}
```

---

## Troubleshooting

### Issue: Responses are too formal even with "full-dai"

**Solution**: Ensure `enableTruthBombs` is set to `true` and provide rich context:

```json
{
  "message": "Your question here",
  "personalityLevel": "full-dai",
  "enableTruthBombs": true,
  "daiContext": {
    "role": "gm",
    "market": "Phoenix, AZ"
  }
}
```

### Issue: Truth bombs appearing in formal mode

**Solution**: Set `enableTruthBombs: false` explicitly:

```json
{
  "personalityLevel": "formal",
  "enableTruthBombs": false
}
```

### Issue: Responses don't mention market or store

**Solution**: The agent will only mention these if contextually relevant. The context informs the style and recommendations, but won't always be explicitly stated.

### Issue: 503 error "AI service not configured"

**Solution**: Set `ANTHROPIC_API_KEY` in your environment variables:

```bash
# .env.local
ANTHROPIC_API_KEY=sk-ant-...your-key
```

### Issue: Rate limiting errors

**Solution**: The `/api/assistant` endpoint has rate limiting enabled. Adjust limits in `lib/rate-limiter-redis.ts` if needed for testing.

---

## Performance Benchmarks

Expected response times:
- **Formal**: 800ms - 1.5s (shorter responses)
- **Dry-wit**: 1s - 2s (moderate responses)
- **Full-dai**: 1.5s - 3s (more comprehensive responses)

Token usage (typical):
- **Input**: 150-300 tokens (including system prompt)
- **Output**: 100-400 tokens (depending on personality and context)

---

## Best Practices

1. **Match personality to use case**:
   - Formal: Reports, documentation, C-suite communications
   - Dry-wit: Team strategy, internal tools, dashboards
   - Full-dai: Casual support, onboarding, motivational content

2. **Provide context when available**:
   - Always include role if known
   - Include market for location-specific insights
   - Add store name for personalization

3. **Enable truth bombs strategically**:
   - Enable for internal audiences who appreciate directness
   - Disable for client-facing or formal communications

4. **Test with real user questions**:
   - Collect actual questions from dealership staff
   - Test personality appropriateness for each role
   - Validate that responses are actionable

---

## Next Steps

1. ✅ Review personality samples above
2. ✅ Test all three personalities with your use cases
3. ✅ Integrate into your UI with personality selector
4. ✅ Configure default personality in your app settings
5. ✅ Monitor response quality and adjust as needed

---

**dAI Agent is ready!** 🤖

Choose the personality that fits your audience and let the AI handle the rest.
