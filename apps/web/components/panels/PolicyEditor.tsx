'use client'
import { useEffect, useState } from 'react'
import { Save, AlertCircle, CheckCircle, History } from 'lucide-react'

interface PolicyEditorProps {
  tenantId: string
  actor?: string
}

export default function PolicyEditor({ tenantId, actor = 'system' }: PolicyEditorProps) {
  const [text, setText] = useState('')
  const [version, setVersion] = useState<number | undefined>()
  const [error, setError] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<string>('')

  useEffect(() => {
    loadPolicy()
  }, [tenantId])

  const loadPolicy = async () => {
    try {
      const response = await fetch(`/api/policy/config?tenantId=${tenantId}`)
      const data = await response.json()
      
      if (data.ok && data.policy) {
        setText(JSON.stringify(data.policy.config, null, 2))
        setVersion(data.policy.version)
        setLastSaved(new Date(data.policy.updated_at).toLocaleString())
      } else {
        // Load default policy
        const defaultPolicy = {
          offerIntegrity: { 
            priceDelta: { sev1: 100, sev2: 250, sev3: 500 }, 
            undisclosedFeeCodes: ["UNDISCLOSED_FEE"] 
          },
          hoursReliability: { maxStalenessDays: 3 },
          gate: { blockOn: ["PRICE_DELTA.sev3", "UNDISCLOSED_FEE"] },
          features: { zeroClick: true, fixQueue: true, proofPath: true, redGate: true }
        }
        setText(JSON.stringify(defaultPolicy, null, 2))
        setVersion(0)
      }
    } catch (err) {
      setError('Failed to load policy configuration')
    }
  }

  const savePolicy = async () => {
    setError('')
    setSaving(true)
    
    try {
      const config = JSON.parse(text)
      const response = await fetch('/api/policy/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, config, actor })
      })
      
      const data = await response.json()
      
      if (data.ok) {
        setVersion(data.policy.version)
        setLastSaved(new Date().toLocaleString())
        setError('')
      } else {
        setError('Invalid policy: ' + (data.errors?.[0] || 'see schema'))
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const formatJson = () => {
    try {
      const parsed = JSON.parse(text)
      setText(JSON.stringify(parsed, null, 2))
      setError('')
    } catch (err: any) {
      setError('Invalid JSON: ' + err.message)
    }
  }

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Policy Editor</h3>
          {version !== undefined && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
              v{version}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {lastSaved && (
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <History className="w-3 h-3" />
              {lastSaved}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full h-64 font-mono text-sm rounded-xl border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
          placeholder="Enter policy configuration JSON..."
        />
        
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-lg">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={savePolicy}
            disabled={saving || !!error}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Policy
              </>
            )}
          </button>
          
          <button
            onClick={formatJson}
            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
          >
            Format JSON
          </button>
          
          <a
            href="https://json-schema.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 flex items-center gap-1"
          >
            Schema Docs
          </a>
        </div>

        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
          <strong>Policy Structure:</strong> Configure offer integrity thresholds, hours reliability settings, 
          gate rules, and feature flags. Changes are versioned and audited.
        </div>
      </div>
    </div>
  )
}
