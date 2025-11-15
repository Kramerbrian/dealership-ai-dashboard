// @ts-nocheck
"use client";

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff } from 'lucide-react';

interface VoiceAssistantProps {
  onTranscript?: (text: string) => void;
  onResponse?: (text: string) => void;
}

export function VoiceAssistant({ 
  onTranscript, 
  onResponse 
}: VoiceAssistantProps) {
  const [state, setState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Initialize Web Speech API
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setState('listening');
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      setTranscript(transcript);
      if (event.results[event.results.length - 1].isFinal) {
        onTranscript?.(transcript);
        setState('thinking');
        // Simulate processing
        setTimeout(() => {
          setState('idle');
          setTranscript('');
        }, 1000);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setState('idle');
    };

    recognition.onend = () => {
      if (state === 'listening') {
        setState('idle');
      }
    };

    recognitionRef.current = recognition;
  }, [state, onTranscript]);

  const toggleVoice = () => {
    if (state === 'idle') {
      setState('listening');
      recognitionRef.current?.start();
    } else {
      setState('idle');
      recognitionRef.current?.stop();
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {/* Listening indicator */}
      {transcript && state === 'listening' && (
        <motion.div
          className="absolute -top-16 right-0 bg-black/90 backdrop-blur-xl rounded-2xl px-6 py-3 border border-white/10 min-w-[200px]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-sm text-white/60 mb-1">Listening...</div>
          <div className="text-sm text-white">{transcript}</div>
        </motion.div>
      )}

      {/* Voice button */}
      <motion.button
        onClick={toggleVoice}
        className="relative group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Glow effect */}
        <div 
          className={`absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl transition-opacity duration-300 ${
            state === 'listening' ? 'opacity-50 animate-pulse' : 
            'opacity-0 group-hover:opacity-50'
          }`} 
        />
        
        {/* Button */}
        <div 
          className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
            state === 'listening' 
              ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
              : 'bg-white/10 hover:bg-white/20'
          }`}
        >
          {state === 'listening' ? (
            <MicOff size={24} className="text-white" />
          ) : (
            <Mic size={24} className="text-white" />
          )}
        </div>
      </motion.button>

      {/* Status indicator */}
      {state !== 'idle' && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
          <div className="text-xs text-white/60 whitespace-nowrap">
            {state === 'listening' && 'Listening...'}
            {state === 'thinking' && 'Processing...'}
            {state === 'speaking' && 'Speaking...'}
          </div>
        </div>
      )}
    </div>
  );
}

// TypeScript declaration for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

