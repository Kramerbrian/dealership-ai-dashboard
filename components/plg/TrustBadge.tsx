import React from 'react';

export default function TrustBadge() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2">
      <div className="h-2 w-2 rounded-full bg-green-500"></div>
      <span className="text-sm font-medium">Trusted by 1,000+ Dealerships</span>
    </div>
  );
}
