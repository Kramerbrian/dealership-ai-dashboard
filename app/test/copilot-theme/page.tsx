"use client";

/**
 * Interactive Test Page for Copilot Theme System
 * 
 * Visit /test/copilot-theme to manually verify:
 * - Mood derivation from different metric combinations
 * - CSS variable updates
 * - Visual theme changes
 * - Regional tone variants
 */

import { useState, useEffect } from "react";
import { deriveCopilotMood } from "@/lib/copilot-context";
import { applyThemeSignal } from "@/lib/theme-controller";
import DAICopilot from "@/components/DAICopilot";

export default function CopilotThemeTestPage() {
  const [aiv, setAiv] = useState(75);
  const [forecastChange, setForecastChange] = useState(0);
  const [feedbackScore, setFeedbackScore] = useState(0.5);
  const [region, setRegion] = useState<"south" | "midwest" | "west" | "northeast" | "default">("default");
  
  const metrics = { aiv, forecastChange };
  const localTime = new Date();
  const moodInfo = deriveCopilotMood({ metrics, feedbackScore, localTime, region });

  // Apply theme signal when mood changes
  useEffect(() => {
    applyThemeSignal({ mood: moodInfo.mood, tone: moodInfo.tone });
  }, [moodInfo.mood, moodInfo.tone]);

  // Get current CSS variable values
  const [cssVars, setCssVars] = useState({
    accent: "59 130 246",
    glow: "rgba(59,130,246,0.15)",
    brightness: "0.75",
    weight: "450"
  });

  useEffect(() => {
    const updateCssVars = () => {
      const root = document.documentElement;
      setCssVars({
        accent: root.style.getPropertyValue("--accent-rgb") || "59 130 246",
        glow: root.style.getPropertyValue("--accent-glow") || "rgba(59,130,246,0.15)",
        brightness: root.style.getPropertyValue("--vignette-brightness") || "0.75",
        weight: root.style.getPropertyValue("--heading-weight") || "450"
      });
    };
    
    updateCssVars();
    const interval = setInterval(updateCssVars, 100);
    return () => clearInterval(interval);
  }, [moodInfo]);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Copilot Theme System Test</h1>
          <p className="text-slate-400">Interactive test page for mood derivation and theme application</p>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-900/50 rounded-2xl border border-slate-800">
          <div>
            <label className="block text-sm font-medium mb-2">
              AIV Score: {aiv}
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={aiv}
              onChange={(e) => setAiv(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Forecast Change: {forecastChange > 0 ? '+' : ''}{forecastChange}
            </label>
            <input
              type="range"
              min="-30"
              max="30"
              value={forecastChange}
              onChange={(e) => setForecastChange(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Feedback Score: {feedbackScore.toFixed(2)}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={feedbackScore}
              onChange={(e) => setFeedbackScore(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Region</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value as any)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2"
            >
              <option value="default">Default</option>
              <option value="south">South</option>
              <option value="midwest">Midwest</option>
              <option value="west">West</option>
              <option value="northeast">Northeast</option>
            </select>
          </div>
        </div>

        {/* Current Mood Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800">
            <h2 className="text-xl font-semibold mb-4">Derived Mood</h2>
            <div className="space-y-3">
              <div>
                <span className="text-slate-400">Mood:</span>
                <span className="ml-2 font-semibold text-lg capitalize">{moodInfo.mood}</span>
              </div>
              <div>
                <span className="text-slate-400">Tone:</span>
                <span className="ml-2 font-semibold text-lg capitalize">{moodInfo.tone}</span>
              </div>
              {moodInfo.prediction && (
                <div className="mt-4 p-3 bg-slate-800/50 rounded-lg">
                  <span className="text-slate-400">Prediction:</span>
                  <p className="mt-1 text-sm">{moodInfo.prediction}</p>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800">
            <h2 className="text-xl font-semibold mb-4">CSS Variables</h2>
            <div className="space-y-2 text-sm font-mono">
              <div>
                <span className="text-slate-400">--accent-rgb:</span>
                <span className="ml-2">{cssVars.accent}</span>
              </div>
              <div>
                <span className="text-slate-400">--accent-glow:</span>
                <span className="ml-2">{cssVars.glow}</span>
              </div>
              <div>
                <span className="text-slate-400">--vignette-brightness:</span>
                <span className="ml-2">{cssVars.brightness}</span>
              </div>
              <div>
                <span className="text-slate-400">--heading-weight:</span>
                <span className="ml-2">{cssVars.weight}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Theme Preview */}
        <div className="p-8 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700">
          <h2 className="text-xl font-semibold mb-4">Theme Preview</h2>
          <div className="space-y-4">
            <div 
              className="theme-bg p-6 rounded-xl"
              style={{
                boxShadow: `0 0 40px ${cssVars.glow}`
              }}
            >
              <h3 style={{ fontWeight: cssVars.weight }} className="text-2xl mb-2">
                Sample Heading
              </h3>
              <p className="text-slate-300">
                This preview shows how the theme variables affect the visual appearance.
                The background uses the vignette gradient, and the heading weight adjusts
                based on the tone.
              </p>
            </div>
          </div>
        </div>

        {/* Live Copilot Component */}
        <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800">
          <h2 className="text-xl font-semibold mb-4">Live DAICopilot Component</h2>
          <p className="text-slate-400 mb-4 text-sm">
            The Copilot component should appear in the bottom-right corner and reflect
            the current mood and tone settings.
          </p>
          <DAICopilot 
            dealerId="test_dealer" 
            region={region === "default" ? "naples" : region}
            brand="toyota"
          />
        </div>

        {/* Test Scenarios */}
        <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800">
          <h2 className="text-xl font-semibold mb-4">Quick Test Scenarios</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onClick={() => {
                setAiv(85);
                setForecastChange(12);
                setFeedbackScore(0.7);
              }}
              className="p-3 bg-green-600/20 hover:bg-green-600/30 border border-green-600/30 rounded-lg text-left"
            >
              <div className="font-semibold">Positive Mood</div>
              <div className="text-xs text-slate-400">AIV: 85, Forecast: +12</div>
            </button>
            <button
              onClick={() => {
                setAiv(45);
                setForecastChange(-20);
                setFeedbackScore(0.3);
              }}
              className="p-3 bg-red-600/20 hover:bg-red-600/30 border border-red-600/30 rounded-lg text-left"
            >
              <div className="font-semibold">Urgent Mood</div>
              <div className="text-xs text-slate-400">AIV: 45, Forecast: -20</div>
            </button>
            <button
              onClick={() => {
                setAiv(95);
                setForecastChange(25);
                setFeedbackScore(0.9);
              }}
              className="p-3 bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-600/30 rounded-lg text-left"
            >
              <div className="font-semibold">Celebratory Mood</div>
              <div className="text-xs text-slate-400">AIV: 95, Forecast: +25</div>
            </button>
            <button
              onClick={() => {
                setAiv(60);
                setForecastChange(-10);
                setFeedbackScore(0.4);
              }}
              className="p-3 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-600/30 rounded-lg text-left"
            >
              <div className="font-semibold">Reflective Mood</div>
              <div className="text-xs text-slate-400">AIV: 60, Forecast: -10</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

