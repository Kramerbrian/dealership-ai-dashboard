"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { ArrowRight, Volume2, VolumeX } from "lucide-react";

const aiEngines = ["ChatGPT", "Perplexity", "Gemini", "Google AI"];

export default function HeroSection_CupertinoNolan() {
  const [index, setIndex] = useState(0);
  const [chatStage, setChatStage] = useState<"competitor" | "dealer">("competitor");
  const [competitor, setCompetitor] = useState("a local competitor");
  const [city, setCity] = useState("");
  const [time, setTime] = useState("");
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(true);
  const [enteredURL, setEnteredURL] = useState("");
  const [loading, setLoading] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const translateX = useTransform(x, [-100, 100], [-5, 5]);
  const translateY = useTransform(y, [-100, 100], [-5, 5]);

  // AI name rotation
  useEffect(() => {
    const rot = setInterval(() => setIndex((i) => (i + 1) % aiEngines.length), 3000);
    return () => clearInterval(rot);
  }, []);

  // Chat window alternation
  useEffect(() => {
    const loop = setInterval(() => {
      setChatStage((s) => (s === "competitor" ? "dealer" : "competitor"));
    }, 6000);
    return () => clearInterval(loop);
  }, []);

  // Geo detection
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const res = await fetch(
              `/api/nearby-dealer?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`
            );
            const data = await res.json();
            setCompetitor(data.competitor);
            setCity(data.city);
          } catch {
            setCompetitor("a local competitor");
          }
        },
        () => setCompetitor("a local competitor"),
        { enableHighAccuracy: false, timeout: 4000 }
      );
    }
  }, []);

  // Local time updater
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  // Ambient hum setup (muted) - optional, won't break if audio file missing
  useEffect(() => {
    if (typeof Audio !== 'undefined') {
      const audio = new Audio("/audio/ai-hum.mp3");
      audio.loop = true;
      audio.volume = 0;
      audio.play().catch(() => {}); // browser block until user gesture
      setAudioRef(audio);
    }
  }, []);

  const toggleMute = () => {
    if (!audioRef) return;
    const nextMuted = !muted;
    setMuted(nextMuted);
    audioRef.volume = nextMuted ? 0 : 0.25;
  };

  // Handle launch - fetch KPI data and redirect to onboarding
  async function handleLaunch() {
    if (!enteredURL) return;
    setLoading(true);
    const normalizedURL = enteredURL.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    localStorage.setItem('dealer:url', normalizedURL);

    try {
      const res = await fetch(`/api/marketpulse/compute?dealer=${encodeURIComponent(normalizedURL)}`);
      if (!res.ok) {
        throw new Error(`API returned ${res.status}`);
      }
      const result = await res.json();
      const aiv = Number(result?.aiv ?? 0.88);
      const ati = Number(result?.ati ?? 0.82);

      // Transition to onboarding after delay
      setTimeout(() => {
        window.location.href = `/onboarding?dealer=${encodeURIComponent(normalizedURL)}&aiv=${aiv}&ati=${ati}`;
      }, 1500);
    } catch (err) {
      console.error('API error:', err);
      // Still redirect on error, just without metrics
      setTimeout(() => {
        window.location.href = `/onboarding?dealer=${encodeURIComponent(normalizedURL)}`;
      }, 1500);
    }
    // Note: Don't set loading=false here since we're redirecting anyway
  }

  const handleMouse = (e: React.MouseEvent) => {
    if (typeof window !== 'undefined') {
      const { innerWidth, innerHeight } = window;
      x.set(e.clientX - innerWidth / 2);
      y.set(e.clientY - innerHeight / 2);
    }
  };

  return (
    <section
      onMouseMove={handleMouse}
      className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden bg-[#0A0A0C] text-white px-6 select-none"
    >
      {/* Ambient Layers */}
      <motion.div
        style={{ translateX, translateY }}
        className="absolute inset-0 pointer-events-none"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(30,64,175,0.1)_0%,transparent_70%)] animate-[pulse_10s_ease-in-out_infinite]" />
        <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(0,0,0,0)_0%,rgba(59,130,246,0.1)_40%,rgba(0,0,0,0)_100%)] opacity-20 animate-[sweep_20s_linear_infinite]" />
      </motion.div>

      {/* Chat window backdrop */}
      <AnimatePresence mode="wait">
        <motion.div
          key={chatStage}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.15, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute top-1/3 w-[90%] md:w-[600px] bg-white/5 backdrop-blur-xl border border-slate-700/30 rounded-2xl p-4 font-mono text-sm text-slate-300 tracking-tight"
        >
          <p className="text-slate-400">user &gt; Best Nissan dealer near me?</p>
          {chatStage === "competitor" ? (
            <p className="mt-3 text-slate-100">
              🤖 AI &gt; You might like{" "}
              <span className="text-blue-400 font-semibold">{competitor}</span>.
            </p>
          ) : (
            <p className="mt-3 text-slate-100">
              🤖 AI &gt; Try{" "}
              <span className="text-blue-400 font-semibold">
                Germain Nissan of Naples
              </span>{" "}
              — excellent ratings and offers available.
            </p>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
        className="text-center text-4xl md:text-6xl font-semibold max-w-4xl leading-tight z-10 tracking-tight"
      >
        While You're Reading This,{" "}
        <AnimatePresence mode="wait">
          <motion.span
            key={aiEngines[index]}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.0 }}
            className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400"
          >
            {aiEngines[index]}
          </motion.span>
        </AnimatePresence>{" "}
        Just Recommended Your Competitor.
      </motion.h1>

      {/* Subhead */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
        className="mt-6 text-lg md:text-xl text-slate-300 text-center max-w-2xl z-10"
      >
        AI assistants don't sleep — but they sure do play favorites.{" "}
        <span className="text-slate-100 font-medium">
          DealershipAI fixes that with algorithmic therapy for your dealership.
        </span>
      </motion.p>

      {/* URL Input & CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8, duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
        className="mt-10 z-10 flex flex-col items-center gap-4 w-full max-w-md mx-auto"
      >
        <div className="w-full flex gap-2">
          <input
            type="text"
            value={enteredURL}
            onChange={(e) => setEnteredURL(e.target.value)}
            placeholder="Enter your dealership URL (e.g. naplesautogroup.com)"
            className="flex-1 px-4 py-3 rounded-full bg-white/5 border border-slate-600/50 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/80 outline-none backdrop-blur-md transition-all"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && enteredURL && !loading) {
                handleLaunch();
              }
            }}
          />
          <button
            onClick={handleLaunch}
            disabled={!enteredURL || loading}
            onMouseEnter={() => {
              if (audioRef && muted === true) audioRef.volume = 0.25;
            }}
            className="group px-6 py-3 text-base font-medium tracking-tight rounded-full border border-slate-600/50
                     hover:border-blue-500/80 hover:text-blue-400 transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] backdrop-blur-md
                     disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'Calibrating...' : 'Launch'}
            <ArrowRight className="w-4 h-4 inline-block ml-2 transition-transform duration-700 group-hover:translate-x-1" />
          </button>
        </div>

        {audioRef && (
          <button
            onClick={toggleMute}
            className="flex items-center gap-1 text-slate-500 hover:text-blue-400 transition"
            aria-label="Toggle ambient audio"
          >
            {muted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
            <span className="text-xs">{muted ? "Unmute" : "Mute"}</span>
          </button>
        )}

        <p className="text-sm text-slate-500 text-center">
          Free AI Visibility Scan in 30 Seconds
        </p>
      </motion.div>

      {/* Footer */}
      <div className="absolute bottom-3 right-6 text-[11px] text-slate-500 z-10">
        {city ? (
          <span>
            Detected Location: {city} · {time || "Now"}
          </span>
        ) : (
          <span>AI Never Sleeps · Global Feed Active</span>
        )}
      </div>

      <div className="absolute bottom-0 w-full h-1/4 bg-gradient-to-t from-black/90 via-black/60 to-transparent pointer-events-none" />
    </section>
  );
}
