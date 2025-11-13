export default async function Report({ params: { id } }: { params: { id: string } }) {
  const snap = await fetch(process.env.KV_READ_URL + `?id=${id}`, { cache: 'no-store' }).then(r => r.json());
  const S = Object.entries(snap.snapshot?.scores || {});
  return (<main className="mx-auto max-w-3xl px-4 py-10">
    <h1 className="text-2xl font-semibold tracking-tight">AI Visibility Report</h1>
    <div className="mt-4 grid grid-cols-2 gap-3">
      {S.map(([k, v]) => (
        <div key={k} className="rounded-xl border p-4 ring-1 ring-gray-900/5">
          <div className="text-xs text-gray-500">{k}</div>
          <div className="mt-1 text-2xl font-mono tabular-nums">{String(v)}</div>
        </div>
      ))}
    </div>
    <a href="/" className="mt-6 inline-block text-sm text-gray-600 hover:text-black">Run your audit →</a>
  </main>);
}
