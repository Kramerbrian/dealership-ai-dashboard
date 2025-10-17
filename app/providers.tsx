'use client';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import SessionProvider from '@/components/SessionProvider';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <NextThemesProvider 
        attribute="class" 
        defaultTheme="system"
        enableSystem={true}
        disableTransitionOnChange={false}
      >
        {children}
      </NextThemesProvider>
    </SessionProvider>
  );
}
