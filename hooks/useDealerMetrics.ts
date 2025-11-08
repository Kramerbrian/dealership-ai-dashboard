import * as React from 'react';
import { apiFetch } from '@/lib/orchestratorClient';

export function useDealerMetrics(domainOrId: string|undefined) {
  const [data,setData] = React.useState<any>(null);
  const [loading,setLoading] = React.useState(false);
  const [error,setError] = React.useState<null|Error>(null);

  React.useEffect(()=>{
    if(!domainOrId) return;
    let alive = true;
    (async ()=>{
      try{
        setLoading(true);
        const ai = await apiFetch(`/ai-scores?domain=${encodeURIComponent(domainOrId)}`);
        const eeat = await apiFetch(`/metrics/eeat?domain=${encodeURIComponent(domainOrId)}`);
        const qai  = await apiFetch(`/metrics/qai?domain=${encodeURIComponent(domainOrId)}`);
        const zero = await apiFetch(`/zero-click?domain=${encodeURIComponent(domainOrId)}`);
        const ugc  = await apiFetch(`/ugc?domain=${encodeURIComponent(domainOrId)}`);
        const cwv  = await apiFetch(`/metrics/cwv?domain=${encodeURIComponent(domainOrId)}`);
        const trust= await apiFetch(`/metrics/trust?domain=${encodeURIComponent(domainOrId)}`);
        const dtri = await apiFetch(`/metrics/dtri?domain=${encodeURIComponent(domainOrId)}`);
        if(!alive) return;
        setData({ ai, eeat, qai, zero, ugc, cwv, trust, dtri });
      } catch(e:any){
        if(!alive) return;
        setError(e);
      } finally {
        if(!alive) return;
        setLoading(false);
      }
    })();
    return ()=>{alive=false};
  },[domainOrId]);

  return { data, loading, error };
}

