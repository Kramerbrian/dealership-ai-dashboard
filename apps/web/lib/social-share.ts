export interface DealershipShareData {
  name: string;
  domain: string;
  scores: {
    vai?: number;
    qai?: number;
    trust?: number;
  };
}

export async function shareToSocial(
  platform: 'twitter' | 'linkedin' | 'facebook' | 'clipboard',
  data: DealershipShareData
): Promise<{ success: boolean; url?: string }> {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://dealershipai.com';
  const shareUrl = `${baseUrl}/dash?domain=${encodeURIComponent(data.domain)}`;
  
  const text = `Check out ${data.name}'s AI visibility scores:
• AI Visibility: ${data.scores.vai || 'N/A'}%
• Quality Authority: ${data.scores.qai || 'N/A'}
• Trust Score: ${data.scores.trust || 'N/A'}

${shareUrl}`;

  switch (platform) {
    case 'twitter': {
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
      window.open(twitterUrl, '_blank', 'width=550,height=420');
      return { success: true, url: twitterUrl };
    }
    
    case 'linkedin': {
      const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
      window.open(linkedinUrl, '_blank', 'width=550,height=420');
      return { success: true, url: linkedinUrl };
    }
    
    case 'facebook': {
      const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
      window.open(facebookUrl, '_blank', 'width=550,height=420');
      return { success: true, url: facebookUrl };
    }
    
    case 'clipboard': {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        return { success: true };
      }
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = shareUrl;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        document.body.removeChild(textarea);
        return { success: true };
      } catch {
        document.body.removeChild(textarea);
        return { success: false };
      }
    }
    
    default:
      return { success: false };
  }
}
