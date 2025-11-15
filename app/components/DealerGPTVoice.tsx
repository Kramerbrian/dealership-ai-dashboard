// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'

export default function DealerGPTVoice() {
  const [q, setQ] = useState('')
  const [a, setA] = useState('')
  const [listening, setListening] = useState(false)
  const [recognizer, setRecognizer] = useState<SpeechRecognition | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const rec = new (window as any).webkitSpeechRecognition()
      rec.lang = 'en-US'
      rec.interimResults = false
      rec.continuous = false
      rec.onresult = (e: any) => {
        const text = e.results[0][0].transcript
        setQ(text)
        fetch('/api/dealergpt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ q: text })
        })
          .then(r => r.json())
          .then(d => setA(d.a))
      }
      rec.onend = () => setListening(false)
      setRecognizer(rec)
    }
  }, [])

  const toggle = () => {
    if (!recognizer) return
    if (listening) {
      recognizer.stop()
      setListening(false)
    } else {
      setA('')
      recognizer.start()
      setListening(true)
    }
  }

  return (
    <div className="rounded-2xl border p-4 bg-white/70 shadow space-y-3">
      <div className="font-semibold">DealerGPT 2.0 (Voice + Context)</div>
      <button
        onClick={toggle}
        className={`px-3 py-1 rounded ${listening ? 'bg-red-600' : 'bg-blue-600'} text-white`}
      >
        {listening ? 'Stop' : '🎙 Speak'}
      </button>
      {q && (
        <div className="text-sm text-gray-700">
          You said: <span className="font-medium">{q}</span>
        </div>
      )}
      {a && (
        <div className="rounded border bg-white p-3 text-sm whitespace-pre-wrap">
          {a}
        </div>
      )}
    </div>
  )
}
