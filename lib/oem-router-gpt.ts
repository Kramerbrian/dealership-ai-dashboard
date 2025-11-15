/**
 * OEM Router GPT Configuration
 * Internal agent for parsing OEM content and producing OEMModel JSON
 */

/**
 * System prompt for the OEM Router agent
 */
export const OEM_ROUTER_SYSTEM_PROMPT = `You are the OEM Router Agent for DealershipAI.

Your job:
- Read official OEM content (pressroom, news, model pages) for a specific model-year vehicle.
- Produce a single JSON object called OEMModel that describes the model-year update.

Rules:
- Only trust domains that are explicitly allowed in the tools/context (e.g. pressroom.toyota.com, toyota.com).
- Do not hallucinate horsepower, torque, MPG, or MSRP. Only use values clearly present in the source.
- If a value is not explicitly stated, omit that field.
- No competitor comparisons. No offers, payments, or deal language.
- Use official model names and capitalization (e.g. "Toyota Tacoma", "i-FORCE MAX", "TRD Pro", "Toyota Safety Sense").

Tagging:
- For each headline bullet, set:
  - tag: one of POWERTRAIN, COLOR, TRIM, SAFETY, TECH, EQUIP, PRICE, OTHER.
  - retail_relevance: HIGH if it materially affects how the dealership should merchandise or message, else MEDIUM or LOW.

Output:
- Always return a single JSON object that matches the OEMModel schema exactly.
- Do not wrap the JSON in markdown or any other text.`;

/**
 * OEMModel JSON Schema for structured output
 * Matches the TypeScript OEMModel type
 */
export const OEMMODEL_JSON_SCHEMA = {
  type: 'object',
  properties: {
    model_year: {
      type: 'number',
      description: 'Model year (e.g., 2026)',
    },
    brand: {
      type: 'string',
      description: 'Brand name (e.g., "Toyota")',
    },
    model: {
      type: 'string',
      description: 'Model name (e.g., "Tacoma")',
    },
    trim: {
      type: 'string',
      description: 'Trim level (e.g., "TRD Pro")',
      nullable: true,
    },
    headline_bullets: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          text: {
            type: 'string',
            description: 'Bullet point text',
          },
          tag: {
            type: 'string',
            enum: ['POWERTRAIN', 'COLOR', 'TRIM', 'SAFETY', 'TECH', 'EQUIP', 'PRICE', 'OTHER'],
            description: 'Category tag for the bullet',
          },
          retail_relevance: {
            type: 'string',
            enum: ['HIGH', 'MEDIUM', 'LOW'],
            description: 'Relevance to dealership merchandising',
          },
        },
        required: ['text', 'tag', 'retail_relevance'],
      },
    },
    // Add other OEMModel fields as needed
  },
  required: ['model_year', 'brand', 'model', 'headline_bullets'],
  additionalProperties: false,
};

/**
 * Tool definition for fetch_url
 * Used by the OEM Router GPT to fetch OEM content
 */
export const FETCH_URL_TOOL = {
  type: 'function' as const,
  function: {
    name: 'fetch_url',
    description: 'Fetch HTML content from a whitelisted OEM URL. Only use this for official OEM domains.',
    parameters: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          format: 'uri',
          description: 'The URL to fetch. Must be from an approved OEM domain.',
        },
      },
      required: ['url'],
    },
  },
};

/**
 * Call the OEM Router GPT to parse OEM content
 * 
 * @param pressUrl - URL to the OEM press release or model page
 * @param allowedDomains - List of allowed OEM domains for validation
 * @returns Parsed OEMModel object
 */
export async function callOemRouterGPT(
  pressUrl: string,
  allowedDomains: string[] = []
): Promise<any> {
  // Validate URL is from allowed domain
  const url = new URL(pressUrl);
  const isAllowed = allowedDomains.some((domain) => url.hostname.includes(domain));
  
  if (!isAllowed && allowedDomains.length > 0) {
    throw new Error(`URL ${pressUrl} is not from an allowed OEM domain`);
  }

  // TODO: Replace with actual OpenAI/Anthropic API call
  // This is a placeholder structure
  const response = await fetch('/api/oem/gpt-parse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: pressUrl,
      system_prompt: OEM_ROUTER_SYSTEM_PROMPT,
      schema: OEMMODEL_JSON_SCHEMA,
    }),
  });

  if (!response.ok) {
    throw new Error(`OEM Router GPT failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.oemModel;
}

/**
 * Example integration pattern for Orchestrator
 * 
 * When a new OEM page is detected:
 * 1. Call OEM Router GPT to parse content
 * 2. Route to dealers/groups
 * 3. Generate CommerceActions
 * 4. Push to Pulse tiles
 */
export async function processOemUpdate(
  pressUrl: string,
  brandConfig: { oem_domains: string[] }
): Promise<void> {
  // Step 1: Parse OEM content via GPT
  const oemModel = await callOemRouterGPT(pressUrl, brandConfig.oem_domains);

  // Step 2: Route to dealers (import from your routing module)
  // const dealers = await loadAllDealers();
  // const groups = await loadAllGroups();
  // const routingResult = await routeOemUpdate(oemModel, dealers, groups);

  // Step 3: Generate actions
  // const dealersById = Object.fromEntries(dealers.map((d) => [d.id, d]));
  // const actions = buildGroupCommerceActions(
  //   oemModel,
  //   routingResult,
  //   dealersById,
  //   { onlyHighPriority: true }
  // );

  // Step 4: Push to Pulse (via your Pulse API)
  // await pushOemRollupToPulse(routingResult.group_rollups);
}

