'use client';

/**
 * MultimodalInput - Text + Voice + Visual + Touch = Fluid Cognition
 * Supports drag-drop images, voice commands, gestures, and long-press
 */

import React, { useState, useRef, useCallback } from 'react';
import { TOKENS } from '@/styles/design-tokens';

interface MultimodalInputProps {
  onImageDrop?: (file: File) => Promise<void>;
  onVoiceCommand?: (transcript: string) => Promise<void>;
  onGesture?: (gesture: 'swipe-left' | 'swipe-right' | 'long-press') => void;
  placeholder?: string;
}

export function MultimodalInput({
  onImageDrop,
  onVoiceCommand,
  onGesture,
  placeholder = 'Type, speak, or drag an image...'
}: MultimodalInputProps) {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Voice recognition setup
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        onVoiceCommand?.(transcript);
      };
      recognitionRef.current.onend = () => setIsRecording(false);
    }
  }, [onVoiceCommand]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      await onImageDrop?.(file);
    }
  }, [onImageDrop]);

  const handleLongPress = useCallback(() => {
    const timer = setTimeout(() => {
      onGesture?.('long-press');
      // Trigger haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    }, 500);
    setLongPressTimer(timer);
  }, [onGesture]);

  const handleLongPressEnd = useCallback(() => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  }, [longPressTimer]);

  const startVoiceRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const stopVoiceRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  return (
    <div
      className="relative rounded-xl border p-4"
      style={{
        background: isDragging 
          ? 'rgba(59, 130, 246, 0.1)' 
          : TOKENS.color.surface.panel,
        borderColor: isDragging 
          ? TOKENS.color.accent.blue 
          : TOKENS.color.surface.border
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="absolute inset-0 flex items-center justify-center bg-blue-500/10 rounded-xl">
          <div className="text-sm font-medium" style={{ color: TOKENS.color.accent.blue }}>
            Drop image here
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none text-sm"
          style={{ color: TOKENS.color.text.primary }}
          onMouseDown={handleLongPress}
          onMouseUp={handleLongPressEnd}
          onTouchStart={handleLongPress}
          onTouchEnd={handleLongPressEnd}
        />

        <div className="flex gap-1">
          <button
            onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
            className="px-3 py-2 rounded-lg text-sm"
            style={{
              background: isRecording 
                ? TOKENS.color.accent.blue 
                : TOKENS.color.surface.hover,
              color: isRecording ? '#fff' : TOKENS.color.text.secondary
            }}
            aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
          >
            {isRecording ? '⏹' : '🎤'}
          </button>
        </div>
      </div>

      {isRecording && (
        <div className="mt-2 text-xs text-center" style={{ color: TOKENS.color.text.muted }}>
          Listening...
        </div>
      )}
    </div>
  );
}

