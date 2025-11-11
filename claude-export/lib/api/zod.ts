import { z } from "zod";

export const GenerateSchemaZ = z.object({
  dealerId: z.string().min(1),
  domain: z.string().url(),
  pageType: z.enum(["home", "inventory", "service", "parts", "faq", "review"]),
  intent: z.string().min(1),
  context: z.string().optional(),
});

export const ValidateSchemaZ = z.object({
  dealerId: z.string().min(1),
  jsonld: z.string().min(2),
  simulate_engines: z.array(z.enum(["gpt4", "gemini", "claude"])).optional(),
});

