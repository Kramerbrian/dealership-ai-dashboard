import { redirect } from 'next/navigation'

export default function DashboardPage() {
  // Redirect to the first tab (AI Health)
  redirect('/dashboard/ai-health')
}