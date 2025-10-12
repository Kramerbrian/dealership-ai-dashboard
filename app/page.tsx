import DealershipAILanding from '@/src/components/landing/DealershipAILanding';
import { jsonLdSchema } from '@/src/lib/schema';

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
      />
      <DealershipAILanding />
    </>
  );
}