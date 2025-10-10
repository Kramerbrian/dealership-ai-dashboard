import { redirect } from 'next/navigation';
import { getServerSession } from '@/src/lib/auth';
import { Sidebar } from '@/components/layout/Sidebar';
import { LanguageSelector } from '@/components/i18n/LanguageSelector';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  // Redirect to sign-in if not authenticated
  if (!session) {
    redirect('/sign-in');
  }

  // Check if user has completed onboarding
  const hasCompletedOnboarding = true; // In production, check from database
  
  // Redirect to onboarding if not completed
  if (!hasCompletedOnboarding) {
    redirect('/onboarding');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Top Navigation */}
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  DealershipAI Dashboard
                </h1>
                <p className="text-sm text-gray-600">
                  Welcome back, {session.user?.name || session.user?.email}
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <LanguageSelector variant="compact" />
                
                {/* User Menu */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || 'U'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </header>
          
          {/* Page Content */}
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}