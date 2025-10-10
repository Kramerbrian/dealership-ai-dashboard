/**
 * Dashboard Layout
 * Auth-protected layout with onboarding redirect logic
 */

import { getServerSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';
import { Toaster } from 'sonner';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect('/sign-in?callbackUrl=/dashboard');
  }

  // If user is not onboarded, redirect to onboarding
  if (!session.user.onboarded) {
    redirect('/onboarding');
  }

  return (
    <SessionProvider session={session}>
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          {/* Sidebar */}
          <Sidebar />
          
          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            <Header />
            <main className="flex-1 p-6">
              {children}
            </main>
          </div>
        </div>
        
        {/* Toast Notifications */}
        <Toaster position="top-right" />
      </div>
    </SessionProvider>
  );
}
