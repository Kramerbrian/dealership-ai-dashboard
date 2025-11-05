"use client";

// Dashboard page wrapper for the enhanced LA dashboard.
// This simply imports the React component from the root file and renders it.
// By placing this file under pages/, Next.js will create the /dashboard route.

import DealershipAIDashboardLA from '../DealershipAIDashboardLA';

export default function DashboardPage() {
  return <DealershipAIDashboardLA />;
}