import { useEffect, useState, useCallback, useRef } from "react";

/**
 * useLLMJsonStream
 * Streams structured Server-Sent Events from /api/stream/llm-json
 */
export function useLLMJsonStream() {
  const [data, setData] = useState<string>("");
  const [events, setEvents] = useState<any[]>([]);
  const [isStreaming, setStreaming] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const start = useCallback(
    ({
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
      setStreaming(true);
      setData("");
      setEvents([]);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      fetch("/api/stream/llm-json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, model, messages, maxTokens }),
        signal: controller.signal,
      })
        .then((res) => {
          if (!res.body) throw new Error("No readable stream");
          const reader = res.body.getReader();
          const decoder = new TextDecoder();

          function readStream(): Promise<void> {
            return reader.read().then(({ value, done }) => {
              if (done) {
                setStreaming(false);
                return;
              }

              const chunk = decoder.decode(value, { stream: true });
              const lines = chunk.split("\n");

              for (const line of lines) {
                if (line.startsWith("data: ")) {
                  try {
                    const parsed = JSON.parse(line.slice(6));
                    if (parsed.event === "update") {
                      setData((prev) => prev + parsed.data.partial);
                    }
                    setEvents((prev) => [...prev, parsed]);
                    if (parsed.event === "done" || parsed.event === "final_json" || parsed.event === "error") {
                      setStreaming(false);
                      return;
                    }
                  } catch (e) {
                    console.error("[useLLMJsonStream] parse error", e);
                  }
                }
              }

              return readStream();
            });
          }

          return readStream();
        })
        .catch((err) => {
          if (err.name !== "AbortError") {
            console.error("[useLLMJsonStream] stream error", err);
          }
          setStreaming(false);
        });
    },
    [isStreaming]
  );

  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setStreaming(false);
  }, []);

  useEffect(() => () => abortControllerRef.current?.abort(), []);

  return { data, events, isStreaming, start, stop };
}

