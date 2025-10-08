'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface Template {
  id: string
  name: string
  text: string
  category: string
}

interface ResponseTemplatesProps {
  templates: Template[]
  onSelect: (template: string) => void
  selected: string
}

export default function ResponseTemplates({ templates, onSelect, selected }: ResponseTemplatesProps) {
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null)

  const handleCopy = async (template: string) => {
    try {
      await navigator.clipboard.writeText(template)
      setCopiedTemplate(template)
      setTimeout(() => setCopiedTemplate(null), 2000)
    } catch (error) {
      console.error('Failed to copy template:', error)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {templates.map((template) => (
        <div
          key={template.id}
          className={`p-4 border rounded-lg cursor-pointer transition-all ${
            selected === template.text
              ? 'border-emerald-500 bg-emerald-50'
              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
          }`}
          onClick={() => onSelect(template.text)}
        >
          <div className="flex items-start justify-between mb-2">
            <h5 className="font-medium text-slate-900 text-sm">{template.name}</h5>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleCopy(template.text)
              }}
              className="p-1 hover:bg-slate-200 rounded transition-colors"
            >
              {copiedTemplate === template.text ? (
                <Check className="w-3 h-3 text-emerald-600" />
              ) : (
                <Copy className="w-3 h-3 text-slate-400" />
              )}
            </button>
          </div>
          <p className="text-xs text-slate-600 line-clamp-3">{template.text}</p>
        </div>
      ))}
    </div>
  )
}
