import ExportManager from '../components/export/ExportManager';

// Force dynamic rendering to avoid SSR context issues
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

export default function ExportManagerPage() {
  return <ExportManager />;
}
