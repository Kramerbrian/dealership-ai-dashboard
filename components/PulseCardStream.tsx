// @ts-nocheck
"use client";

import { useLLMJsonStream } from "@/hooks/useLLMJsonStream";
import { useEffect, useState } from "react";

interface PulseCardStreamProps {
  prompt?: string;
  onComplete?: (card: any) => void;
}

export default function PulseCardStream({ prompt, onComplete }: PulseCardStreamProps) {
  const { data, events, isStreaming, start, stop } = useLLMJsonStream();
  const [finalCard, setFinalCard] = useState<any | null>(null);

  // Watch for final JSON payload
  useEffect(() => {
    const finalEvt = events.findLast((e: any) => e.event === "final_json");
    if (finalEvt) {
      setFinalCard(finalEvt.data);
      if (onComplete) {
        onComplete(finalEvt.data);
      }
    }
  }, [events, onComplete]);

  const begin = () =>
    start({
      provider: "anthropic",
      model: "claude-3.5-haiku",
      messages: [
        { role: "system", content: "You are the Pulse Engine GPT." },
        {
          role: "user",
          content: prompt || "Generate a triage card for a Toyota Camry lease program change.",
        },
      ],
    });

  return (
    <div className="p-4 rounded-md bg-gray-900 text-gray-100 font-mono border border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={isStreaming ? stop : begin}
          className="px-4 py-2 rounded bg-teal-600 hover:bg-teal-700"
        >
          {isStreaming ? "Stop Stream" : "Generate Pulse Card"}
        </button>
        {isStreaming && (
          <span className="text-xs text-gray-400 animate-pulse">streaming...</span>
        )}
      </div>

      {/* Live incremental text display */}
      {!finalCard && (
        <pre className="whitespace-pre-wrap text-sm text-gray-300 h-48 overflow-y-auto">
          {data || "Waiting for stream..."}
        </pre>
      )}

      {/* Final structured card */}
      {finalCard && (
        <div className="mt-4 p-3 border border-gray-700 rounded bg-gray-800 text-sm text-gray-200">
          <h2 className="text-lg font-semibold text-teal-400">
            {finalCard.card_title || "Pulse Card"}
          </h2>
          <p className="my-2">{finalCard.card_body}</p>

          {finalCard.why_it_matters && (
            <p className="text-gray-400 italic mb-2">
              {finalCard.why_it_matters}
            </p>
          )}

          {Array.isArray(finalCard.do_next) && finalCard.do_next.length > 0 && (
            <ul className="list-disc list-inside text-gray-300 space-y-1">
              {finalCard.do_next.map((step: string, i: number) => (
                <li key={i}>{step}</li>
              ))}
            </ul>
          )}

          {finalCard.time_to_fix_minutes_estimate && (
            <p className="text-xs text-gray-500 mt-2">
              ⏱ {finalCard.time_to_fix_minutes_estimate} min est.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

