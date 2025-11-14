import HeroSection_CupertinoNolan from '@/components/HeroSection_CupertinoNolan';
import { LandingAnalyzer } from '@/components/landing/LandingAnalyzer';

export default function HomePage() {
  return (
    <main className="relative overflow-hidden">
      <HeroSection_CupertinoNolan />
      <LandingAnalyzer />
    </main>
  );
}