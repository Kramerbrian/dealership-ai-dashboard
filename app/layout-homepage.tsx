/**
 * Homepage-specific layout for dynamic rendering
 * Wraps the root / route to enable dynamic rendering for client component
 */

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
