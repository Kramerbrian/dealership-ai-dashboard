/**
 * Terms Page Layout
 * Enables dynamic rendering for the client component terms page
 */

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
