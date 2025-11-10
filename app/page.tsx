import { redirect } from 'next/navigation'

export default function RootPage() {
  // Redirect root to the marketing landing page
  redirect('/(mkt)')
}
