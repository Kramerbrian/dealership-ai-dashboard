'use client';
import DealershipAI17SectionPLG from '../dealershipai-17-section-plg';

// Force dynamic rendering to avoid SSR context issues
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

export default function Home() {
  return <DealershipAI17SectionPLG />;
}
