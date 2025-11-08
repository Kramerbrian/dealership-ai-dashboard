import React from 'react'

export function JsonLd({ children }: { children: string }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: children }}
    />
  )
}

