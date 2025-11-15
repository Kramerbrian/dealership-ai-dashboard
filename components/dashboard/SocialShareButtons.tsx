'use client';

import { useState } from 'react';
import { Share2, Twitter, Linkedin, Facebook, Copy, Check } from 'lucide-react';
import { shareToSocial } from '@/lib/social-share';

type DealershipShareData = {
  dealershipName: string;
  domain: string;
  scores?: {
    vai?: number;
    qai?: number;
    trust?: number;
  };
  clarityScore?: number;
  chatgptScore?: number;
  revenueAtRisk?: number;
  slug?: string;
};
import { Button } from '@/components/ui/button';

interface SocialShareButtonsProps {
  dealership: DealershipShareData;
}

export default function SocialShareButtons({ dealership }: SocialShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async (platform: 'twitter' | 'linkedin' | 'facebook' | 'clipboard') => {
    const result = await shareToSocial(platform, dealership as any);
    if (platform === 'clipboard' && (result as any).success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('twitter')}
        className="flex items-center gap-2"
      >
        <Twitter size={16} />
        Twitter
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('linkedin')}
        className="flex items-center gap-2"
      >
        <Linkedin size={16} />
        LinkedIn
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('facebook')}
        className="flex items-center gap-2"
      >
        <Facebook size={16} />
        Facebook
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('clipboard')}
        className="flex items-center gap-2"
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
        {copied ? 'Copied!' : 'Copy'}
      </Button>
    </div>
  );
}
