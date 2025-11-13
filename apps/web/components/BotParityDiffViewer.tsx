'use client';
import useSWR from 'swr';
const fetcher=(u:string)=>fetch(u).then(r=>r.json());
function diff(a:string,b:string){
  // ultra-light: highlight missing 'ld+json' presence
  const hasA=/ld\+json/.test(a), hasB=/ld\+json/.test(b);
  return {summary: hasA && !hasB ? 'Schema missing for GPTBot' : hasB && !hasA ? 'Schema missing for Googlebot' : 'No schema parity issue detected'};
}
export default function BotParityDiffViewer(){
  const {data}=useSWR('/api/bot-parity-snapshots',fetcher);
  if(!data) return null;
  const d=diff(data.googlebot,data.gptbot);
  return (
    <div className="rounded-2xl border border-gray-200 bg-white/70 p-4 shadow">
      <div className="font-semibold mb-2">Bot Parity Diff Viewer</div>
      <div className="text-sm text-gray-700 mb-2">{d.summary}</div>
      <div className="grid md:grid-cols-2 gap-2 text-xs">
        <pre className="p-2 bg-gray-900 text-white rounded overflow-auto">{data.googlebot}</pre>
        <pre className="p-2 bg-gray-900 text-white rounded overflow-auto">{data.gptbot}</pre>
      </div>
      <div className="text-[11px] text-gray-500 mt-2">URL: {data.url}</div>
    </div>
  );
}