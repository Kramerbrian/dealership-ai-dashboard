import { ClerkProvider } from '@clerk/nextjs'
import { ConfidenceRibbon } from '@/components/orchestrator/ConfidenceRibbon'
import { Sidebar } from '@/components/layout/Sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <div className="min-h-screen bg-gray-50">
        <ConfidenceRibbon />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </ClerkProvider>
  )
}

