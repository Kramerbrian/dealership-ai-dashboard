import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - DealershipAI',
  description: 'AI visibility dashboard for car dealerships',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-950">
      {children}
    </div>
  );
}
