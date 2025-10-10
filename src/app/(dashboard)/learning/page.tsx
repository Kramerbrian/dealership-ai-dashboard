/**
 * Learning Center Page
 * Educational content and resources for AI visibility
 */

import { getServerSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LearningCenter } from '@/components/learning/LearningCenter';

export default async function LearningPage() {
  const session = await getServerSession();

  if (!session) {
    redirect('/sign-in?callbackUrl=/learning');
  }

  return <LearningCenter />;
}
