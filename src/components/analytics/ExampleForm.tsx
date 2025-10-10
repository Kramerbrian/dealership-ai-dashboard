'use client';
import { useUrlField } from '../../hooks/useUrlField';
import { getVariant, copyByVariant, ctaStyleByVariant } from '../../lib/ab';
import { Events } from '../../lib/analytics';
import { useRouter } from 'next/navigation';

interface ExampleFormProps {
  city?: string;
}

export default function ExampleForm({ city }: ExampleFormProps) {
  const { value, setValue, error, normalized } = useUrlField();
  const router = useRouter();
  const variant = getVariant();

  const handleSubmit = () => {
    const url = normalized();
    if (!url || error) return;
    Events.scanStart(url, city);
    router.push(`/dashboard?dealer=${encodeURIComponent(url)}&utm_source=landing&variant=${variant}`);
    Events.scanRedirect(url, variant);
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-4">
        <input
          name="dealerUrl"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-invalid={!!error}
          aria-describedby="url-help"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="www.yourdealership.com"
        />
        <div id="url-help" role="status" aria-live="polite" className="text-xs text-gray-600 mt-1">
          {error ?? 'Example: www.toyotaofnaples.com'}
        </div>
      </div>
      
      <button
        onClick={handleSubmit}
        className={`w-full rounded-xl px-4 py-3 text-sm font-semibold text-white ${ctaStyleByVariant(variant)}`}
      >
        {copyByVariant(variant)}
      </button>
    </div>
  );
}
