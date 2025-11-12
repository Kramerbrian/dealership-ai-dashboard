import { Inter } from 'next/font/google';

/**
 * Next.js Font Configuration
 * Using Inter font with swap display to prevent FOUT (Flash of Unstyled Text)
 */
export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});
