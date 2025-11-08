'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserButton, useUser } from '@clerk/nextjs';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';

function useTelemetry() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      const r = await fetch('/api/telemetry', { cache: 'no-store' });
      const j = await r.json();
      setRows(j.events || []);
    })();
  }, []);
  return rows;
}

export default function Admin() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const rows = useTelemetry();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (isLoaded) {
      const allowed = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
      const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase();
      const isAdmin = user?.publicMetadata?.role === 'admin' || user?.privateMetadata?.role === 'admin' || allowed.includes(email || '');
      setAuthorized(isAdmin);
      if (!isAdmin) setTimeout(() => router.push('/landing'), 2000);
    }
  }, [isLoaded, user, router]);

  if (authorized === false) return (
    <main className='min-h-screen grid place-items-center text-center p-6'>
      <div className='bg-white p-8 rounded-2xl shadow-xl max-w-md'>
        <h2 className='text-2xl font-bold mb-2 text-red-600'>Access Denied</h2>
        <p className='text-gray-600 mb-4'>You are not authorized to view the Admin Dashboard.</p>
        <p className='text-sm text-gray-400'>Redirecting to landing...</p>
      </div>
    </main>
  );
  if (authorized === null) return (
    <main className='min-h-screen grid place-items-center'>
      <div>Loading...</div>
    </main>
  );
  const daily = useMemo(() => {
    const by: Record<string, number> = {};
    rows.forEach(r => {
      const d = new Date(r.ts || Date.now()).toISOString().slice(0, 10);
      by[d] = (by[d] || 0) + 1;
    });
    return Object.entries(by).map(([d, c]) => ({ d, c }));
  }, [rows]);
  const funnel = useMemo(() => {
    const f = { view: 0, scan: 0, unlock: 0, upgrade: 0 };
    rows.forEach(r => {
      if (r.type === 'page_view') f.view++;
      if (r.type === 'scan_completed') f.scan++;
      if (r.type === 'unlock_success') f.unlock++;
      if (r.type === 'upgrade_click') f.upgrade++;
    });
    return Object.entries(f).map(([k, v]) => ({ k, v }));
  }, [rows]);
  const download = () => {
    const head = ['ts', 'type', 'payload'];
    const csv = [head.join(',')].concat(rows.map(r => `${new Date(r.ts).toISOString()},${r.type},"${JSON.stringify(r.payload || {}).replaceAll('"', '""')}"`)).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'telemetry.csv';
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <main className='p-6 max-w-6xl mx-auto'>
      <header className='flex items-center justify-between mb-6'>
        <div className='text-2xl font-black'>Admin · Analytics</div>
        <div className='flex items-center gap-3'>
          <button onClick={download} className='px-4 py-2 border rounded'>Download CSV</button>
          <UserButton afterSignOutUrl='/landing' />
        </div>
      </header>
      <div className='grid md:grid-cols-2 gap-6'>
        <section className='bg-white rounded-2xl border p-4'>
          <h3 className='font-semibold mb-2'>Events per day</h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <LineChart data={daily}>
                <CartesianGrid stroke='#eee' />
                <XAxis dataKey='d' />
                <YAxis />
                <Tooltip />
                <Line type='monotone' dataKey='c' stroke='#2563eb' />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className='bg-white rounded-2xl border p-4'>
          <h3 className='font-semibold mb-2'>Funnel</h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={funnel}>
                <CartesianGrid stroke='#eee' />
                <XAxis dataKey='k' />
                <YAxis />
                <Tooltip />
                <Bar dataKey='v' fill='#10b981' />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
      <section className='bg-white rounded-2xl border p-4 mt-6'>
        <h3 className='font-semibold mb-2'>Latest events</h3>
        <div className='overflow-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='text-left border-b'>
                <th className='p-2'>Time</th>
                <th>Type</th>
                <th>Payload</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 50).map((r, i) => (
                <tr key={i} className='border-b'>
                  <td className='p-2'>{new Date(r.ts || Date.now()).toLocaleString()}</td>
                  <td>{r.type}</td>
                  <td className='text-[12px] text-gray-600'>{JSON.stringify(r.payload || {})}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
