"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { FlaskConical, TrendingUp } from "lucide-react";

export default function ScenarioSimulatorPanel() {
  const [inputs, setInputs] = useState({ schema: 0, ugc: 0, content: 0 });
  const [forecast, setForecast] = useState<any[]>([]);
  const [gain, setGain] = useState<number | null>(null);

  function runScenario() {
    const baseARR = 2_800_000;
    const improvement = inputs.schema * 0.4 + inputs.ugc * 0.35 + inputs.content * 0.25;
    const monthly = Array.from({ length: 6 }).map((_, i) => ({
      month: `+${i+1}M`,
      ARR: Math.round(baseARR * Math.pow(1 + improvement/100, i+1))
    }));
    setForecast(monthly);
    setGain(monthly[5].ARR - baseARR);
  }

  const sliders = [
    { label: "Schema Coverage Δ (%)", key: "schema", color: "blue" },
    { label: "UGC Health Δ (%)", key: "ugc", color: "green" },
    { label: "Content Quality Δ (%)", key: "content", color: "purple" }
  ] as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-lg"
    >
      <CardHeader className="flex items-center gap-2 mb-4">
        <FlaskConical className="text-amber-400 w-5 h-5" />
        <CardTitle>Strategic Scenario Simulator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-slate-400 text-sm">Adjust optimization levers below to test hypothetical improvements.</p>

        {sliders.map((s) => (
          <div key={s.key}>
            <div className="flex justify-between text-sm text-slate-300">
              <span>{s.label}</span>
              <span className={`text-${s.color}-400 font-semibold`}>{inputs[s.key]}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={20}
              step={1}
              value={inputs[s.key]}
              onChange={(e)=> setInputs({ ...inputs, [s.key]: parseInt(e.target.value) })}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        ))}

        <Button onClick={runScenario} className="bg-blue-600 hover:bg-blue-700">
          Run Simulation
        </Button>

        {forecast.length > 0 && (
          <>
            <div className="mt-6 bg-slate-800/60 border border-slate-700 rounded-xl p-4">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={forecast}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="ARR" stroke="#22c55e" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="text-slate-300 text-sm mt-4 flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span>Projected ARR Gain:&nbsp;<span className="text-green-400 font-semibold">+${gain?.toLocaleString()}</span></span>
            </div>
          </>
        )}
      </CardContent>
    </motion.div>
  );
}
