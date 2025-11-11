'use client';

import { useState, useEffect } from 'react';

interface Voice {
  voice_id: string;
  name: string;
  category?: string;
  description?: string;
}

interface VoiceSelectorProps {
  onVoiceSelect?: (voiceId: string) => void;
  defaultVoiceId?: string;
}

export function VoiceSelector({ onVoiceSelect, defaultVoiceId }: VoiceSelectorProps) {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>(defaultVoiceId || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVoices() {
      try {
        const response = await fetch('/api/elevenlabs/voices');
        const data = await response.json();
        
        if (data.voices?.voices) {
          setVoices(data.voices.voices);
          if (data.voices.voices.length > 0 && !defaultVoiceId) {
            setSelectedVoice(data.voices.voices[0].voice_id);
          }
        }
        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Failed to load voices');
        setLoading(false);
      }
    }

    fetchVoices();
  }, [defaultVoiceId]);

  const handleVoiceChange = (voiceId: string) => {
    setSelectedVoice(voiceId);
    onVoiceSelect?.(voiceId);
  };

  if (loading) {
    return (
      <div className="p-4 border rounded-lg">
        <p className="text-sm text-gray-600">Loading voices...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-red-200 rounded-lg bg-red-50">
        <p className="text-sm text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Select Voice
      </label>
      <select
        value={selectedVoice}
        onChange={(e) => handleVoiceChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {voices.map((voice) => (
          <option key={voice.voice_id} value={voice.voice_id}>
            {voice.name} {voice.category ? `(${voice.category})` : ''}
          </option>
        ))}
      </select>
      {selectedVoice && (
        <p className="text-xs text-gray-500">
          Selected: {voices.find(v => v.voice_id === selectedVoice)?.name}
        </p>
      )}
    </div>
  );
}

