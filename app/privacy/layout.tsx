/**
 * Privacy Page Layout
 * Enables dynamic rendering for the client component privacy page
 */

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
