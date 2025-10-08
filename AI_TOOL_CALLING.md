# AI Assistant Tool Calling

The AI Assistant now supports **OpenAI function calling**, enabling it to fetch fresh dealership scores on demand.

## How It Works

### 1. User Makes Audit Request
```
User: "Audit https://toyotaofnaples.com and give me risk $, fixes, and proof"
```

### 2. AI Recognizes Need for Tool
The OpenAI model determines it needs fresh data and calls the `get_ai_scores` tool:
```json
{
  "id": "call_abc123",
  "type": "function",
  "function": {
    "name": "get_ai_scores",
    "arguments": "{\"origin\":\"https://toyotaofnaples.com\"}"
  }
}
```

### 3. Tool Executes
The system:
- Calls `/api/ai-assistant/execute-tool`
- Which internally calls `/api/scores?domain=toyotaofnaples.com`
- Returns structured results with scores, risk, fixes, and evidence

### 4. AI Summarizes Results
The model receives the tool results and generates a natural language summary:
```
Visibility is 35%

Risk: $351,000/mo

Top Fixes:
- Improve on-page SEO to raise visibility in Google search
- Add structured data (Schema.org) for better AI understanding
- Optimize for featured snippets and answer boxes

Evidence:
- Current AI visibility score is 35%. Analysis shows opportunities...
```

## API Endpoints

### `/api/ai-assistant` (Enhanced)
**POST** - Main AI assistant endpoint

**New Parameters:**
- `messages`: Array of conversation history (for multi-turn dialogues)

**New Response:**
- `requiresToolExecution`: Boolean indicating if tool needs to be called
- `toolCalls`: Array of tool calls to execute

### `/api/ai-assistant/execute-tool` (New)
**POST** - Execute a specific tool call

**Request:**
```json
{
  "toolCall": {
    "id": "call_abc123",
    "type": "function",
    "function": {
      "name": "get_ai_scores",
      "arguments": "{\"origin\":\"https://example.com\"}"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "result": "{ ... JSON with scores ... }",
  "toolCallId": "call_abc123"
}
```

## Available Tools

### `get_ai_scores`
Fetches fresh AI visibility scores for a dealership URL.

**Parameters:**
- `origin` (string, required): Dealership website URL

**Returns:**
- `visibility`: AI visibility score (0-1)
- `aiVisibility`: AI visibility percentage (0-100)
- `overallScore`: Overall dealership score
- `zeroClickScore`: Zero-click optimization score
- `risk_per_month`: Estimated revenue at risk per month
- `top_fixes`: Array of recommended improvements
- `evidence`: Array of evidence objects with source and notes

## Frontend Integration

The `AIAssistantQuery` component automatically handles tool calling:

```tsx
<AIAssistantQuery
  context="dealership-overview"
  data={dashboardMetrics}
/>
```

When a tool call is needed:
1. Shows "🔍 Fetching fresh AI scores..." message
2. Calls execute-tool endpoint
3. Sends results back to AI for summary
4. Displays final response

## Example Queries That Trigger Tools

- "Audit https://toyotaofnaples.com"
- "Get fresh scores for example.com"
- "Analyze https://honda-dealership.com and show me the risk"
- "What are the latest scores for my competitor at xyz.com?"

## Example Queries That Don't Trigger Tools

- "What is my current revenue at risk?" (uses existing data)
- "How can I improve my AI visibility?" (general advice)
- "Explain zero-click optimization" (educational)
- "Compare my scores to competitors" (uses cached data)

## Testing

Run the test script to verify tool calling:

```bash
node test-tool-calling.js
```

This will:
1. Test a simple query (no tool calling)
2. Test an audit request (with tool calling)
3. Show the complete conversation flow

## Configuration

Set your OpenAI API key in `.env`:
```bash
OPENAI_API_KEY=sk-your-openai-key
```

If no API key is configured, the system falls back to rule-based responses (no tool calling).

## Cost Considerations

Tool calling adds extra API calls:
- Initial query: ~150 tokens
- Tool result: ~500 tokens
- Final summary: ~150 tokens
- **Total: ~800 tokens per audit (~$0.008)**

The `/api/scores` endpoint is rate-limited and cached to control costs.

## Future Tools

Potential tools to add:
- `get_competitor_scores`: Fetch competitor analysis
- `get_market_insights`: Get market data for dealership area
- `schedule_audit`: Schedule recurring audits
- `generate_report`: Create PDF reports
- `update_business_profile`: Modify GMB listing

## Architecture

```
User Query
    ↓
AI Assistant API
    ↓
OpenAI (decides to call tool)
    ↓
Execute Tool Endpoint
    ↓
Scores API (fresh data)
    ↓
Return Results to AI
    ↓
AI Generates Summary
    ↓
Display to User
```

## Comparison to Test Harness

The implementation matches the pattern from your test harness:

| Test Harness | Our Implementation |
|-------------|-------------------|
| `ai_scores_api.get_ai_scores` | `get_ai_scores` tool |
| Manual conversation array | Automatic conversation tracking |
| `tool_use` → `tool_result` | `toolCalls` → `execute-tool` → final response |
| Fixed conversation | Dynamic multi-turn dialogue |

The key difference: Our implementation is **fully automated** - the frontend handles all the orchestration automatically.
