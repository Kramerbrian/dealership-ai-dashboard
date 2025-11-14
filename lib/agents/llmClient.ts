import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
  console.warn("[AIM VIN-DEX] No LLM API keys set. Both providers will fail.");
}

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

/**
 * runLLM(provider, model, messages, options?)
 * provider: 'openai' | 'anthropic'
 * model: string (e.g., 'gpt-4o-mini', 'claude-3.5-haiku')
 * messages: Array<{ role: 'system'|'user'|'assistant', content: string }>
 * options: { stream?: boolean, maxTokens?: number }
 * Returns plain string text or AsyncGenerator<string> if stream is true.
 */
export async function runLLM(
  provider: "openai" | "anthropic",
  model: string,
  messages: Array<{ role: string; content: string }>,
  options?: { stream?: boolean; maxTokens?: number }
): Promise<string | AsyncGenerator<string>> {
  switch (provider) {
    case "anthropic": {
      if (!anthropic) throw new Error("Anthropic client not configured");

      const anthropicMessages = messages.map((m) => ({
        role: m.role === "system" ? "user" : (m.role as "user" | "assistant"), // Anthropic doesn't use 'system'
        content: m.content,
      }));

      if (options?.stream) {
        const stream = anthropic.messages.stream({
          model,
          max_tokens: options.maxTokens || 1024,
          messages: anthropicMessages,
        });

        async function* generate() {
          for await (const chunk of stream) {
            if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
              yield chunk.delta.text;
            }
          }
        }
        return generate();
      } else {
        const response = await anthropic.messages.create({
          model,
          max_tokens: options.maxTokens || 1024,
          messages: anthropicMessages,
        });
        const raw = response.content?.[0]?.text ?? "";
        return raw.replace(/^.*?(\{)/s, "$1"); // strip leading chatter before JSON
      }
    }
    case "openai":
    default: {
      if (!openai) throw new Error("OpenAI client not configured");

      if (options?.stream) {
        const stream = await openai.chat.completions.create({
          model,
          messages: messages as any, // OpenAI messages type is slightly different
          stream: true,
          max_tokens: options.maxTokens || 1024,
        });

        async function* generate() {
          for await (const chunk of stream) {
            yield chunk.choices?.[0]?.delta?.content ?? "";
          }
        }
        return generate();
      } else {
        const completion = await openai.chat.completions.create({
          model,
          messages: messages as any,
          max_tokens: options.maxTokens || 1024,
        });
        return completion.choices?.[0]?.message?.content ?? "";
      }
    }
  }
}

