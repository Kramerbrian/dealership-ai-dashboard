'use client'

import { SessionProvider } from 'next-auth/react'
import { SWRConfig } from 'swr'
import axios from 'axios'

const fetcher = (url: string) => axios.get(url).then(res => res.data)

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SWRConfig 
        value={{
          fetcher,
          revalidateOnFocus: false,
          revalidateOnReconnect: true,
        }}
      >
        {children}
      </SWRConfig>
    </SessionProvider>
  )
}