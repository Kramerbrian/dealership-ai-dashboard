import DashboardLayout from '@/components/dashboard/DashboardLayout'
import ReviewDashboard from '@/components/reviews/ReviewDashboard'

interface ReviewsPageProps {
  params: Promise<{ dealerId: string }>
}

export default async function ReviewsPage({ params }: ReviewsPageProps) {
  const { dealerId } = await params
  // In production, fetch dealer info from database
  const dealerInfo = {
    id: dealerId,
    name: 'Terry Reid Hyundai',
  }

  return (
    <DashboardLayout dealerName={dealerInfo.name} dealerId={dealerInfo.id}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Review Management</h1>
        <p className="text-slate-600">
          Monitor and respond to customer reviews across all platforms
        </p>
      </div>
      <ReviewDashboard />
    </DashboardLayout>
  )
}
