import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AILeaderboard from '@/components/leaderboard/AILeaderboard';

export default async function LeaderboardPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AILeaderboard />
      </div>
    </div>
  );
}
