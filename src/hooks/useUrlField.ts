// useUrlField.ts
import { useState } from 'react';
import { Events } from '../lib/analytics';
const RE = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

export function useUrlField() {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  function onChange(v: string) {
    setValue(v.trim());
    if (!v) return setError(null);
    const normalized = v.startsWith('http') ? v : `https://${v}`;
    if (RE.test(normalized)) {
      setError(null);
      Events.urlValid(normalized);
    } else {
      setError('Enter a valid website URL');
      Events.urlInvalid(v);
    }
  }
  function normalized() {
    return value ? (value.startsWith('http') ? value : `https://${value}`) : '';
  }
  return { value, setValue: onChange, error, normalized };
}
