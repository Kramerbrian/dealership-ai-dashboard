'use client'

import { createContext, useContext, ReactNode } from 'react'

interface BrandColorContextType {
  primaryColor: string
  setPrimaryColor: (color: string) => void
}

const BrandColorContext = createContext<BrandColorContextType | undefined>(undefined)

export function BrandColorProvider({ children }: { children: ReactNode }) {
  return (
    <BrandColorContext.Provider value={{ primaryColor: '#000000', setPrimaryColor: () => {} }}>
      {children}
    </BrandColorContext.Provider>
  )
}

export function useBrandColor() {
  const context = useContext(BrandColorContext)
  if (!context) {
    throw new Error('useBrandColor must be used within BrandColorProvider')
  }
  return context
}
