import { useEffect, useRef, useState, useCallback } from "react";

/**
 * useLLMStream
 * Streams text from /api/stream/llm endpoint.
 *
 * Example:
 * const { text, start, stop, isStreaming } = useLLMStream();
 * start({ provider: "anthropic", model: "claude-3.5-haiku", messages });
 */
export function useLLMStream() {
  const [text, setText] = useState("");
  const [isStreaming, setStreaming] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  const start = useCallback(
    async ({
      provider,
      model,
      messages,
      maxTokens = 1024,
    }: {
      provider: "anthropic" | "openai";
      model: string;
      messages: { role: string; content: string }[];
      maxTokens?: number;
    }) => {
      if (isStreaming) return;
      setText("");
      setStreaming(true);
      const controller = new AbortController();
      controllerRef.current = controller;

      try {
        const res = await fetch("/api/stream/llm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ provider, model, messages, maxTokens }),
          signal: controller.signal,
        });

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) throw new Error("No readable stream");

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          setText((prev) => prev + chunk);
        }
      } catch (err) {
        console.error("[useLLMStream]", err);
      } finally {
        setStreaming(false);
      }
    },
    [isStreaming]
  );

  const stop = useCallback(() => {
    controllerRef.current?.abort();
    setStreaming(false);
  }, []);

  useEffect(() => () => controllerRef.current?.abort(), []);

  return { text, isStreaming, start, stop };
}

