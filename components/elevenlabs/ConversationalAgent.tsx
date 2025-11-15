// @ts-nocheck
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

interface ConversationalAgentProps {
  agentId?: string;
  conversationSignature?: string;
  className?: string;
}

export default function ConversationalAgent({ 
  agentId, 
  conversationSignature,
  className = '' 
}: ConversationalAgentProps) {
  const [isListening, setIsListening] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [transcript, setTranscript] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const clientRef = useRef<ElevenLabsClient | null>(null);

  useEffect(() => {
    // Initialize ElevenLabs client
    const agentIdValue = agentId || process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
    const signatureValue = conversationSignature || process.env.NEXT_PUBLIC_ELEVENLABS_CONVERSATION_SIGNATURE;

    if (!agentIdValue || !signatureValue) {
      setError('ElevenLabs agent credentials not configured');
      return;
    }

    try {
      const client = new ElevenLabsClient({
        agentId: agentIdValue,
        conversationSignature: signatureValue,
      });

      clientRef.current = client;
      setIsConnected(true);
    } catch (err: any) {
      setError(err.message || 'Failed to initialize ElevenLabs client');
    }
  }, [agentId, conversationSignature]);

  const handleStartConversation = async () => {
    if (!clientRef.current) {
      setError('Client not initialized');
      return;
    }

    try {
      setIsListening(true);
      setError(null);
      
      // Start conversation
      // Note: Actual implementation depends on @11labs/client API
      // This is a placeholder structure
      const response = await clientRef.current.start();
      
      // Handle audio stream
      if (response.audioStream) {
        const audio = new Audio();
        audio.src = URL.createObjectURL(response.audioStream);
        audio.play();
        audioRef.current = audio;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to start conversation');
      setIsListening(false);
    }
  };

  const handleStopConversation = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsListening(false);
  };

  return (
    <div className={`rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-xl p-6 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">AI Voice Assistant</h3>
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {transcript && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">{transcript}</p>
          </div>
        )}

        <div className="flex gap-3">
          {!isListening ? (
            <button
              onClick={handleStartConversation}
              disabled={!isConnected}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Start Conversation
            </button>
          ) : (
            <button
              onClick={handleStopConversation}
              className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Stop Conversation
            </button>
          )}
        </div>

        {isListening && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span>Listening...</span>
          </div>
        )}
      </div>

      <p className="mt-4 text-xs text-gray-500">
        Powered by ElevenLabs Conversational AI
      </p>
    </div>
  );
}

