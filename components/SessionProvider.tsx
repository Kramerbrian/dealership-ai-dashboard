'use client';

// @ts-ignore
import { SessionProvider as NextAuthSessionProvider } from '@clerk/nextjs';
import { ReactNode } from 'react';

interface SessionProviderProps {
  children: ReactNode;
}

export default function SessionProvider({ children }: SessionProviderProps) {
  return (
    // @ts-ignore
    <NextAuthSessionProvider>
      {children}
    </NextAuthSessionProvider>
  );
}
