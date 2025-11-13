'use client';

import React from 'react';

export default function TrustBadge() {
  return (
    <a
      href="/schema/TrustBadge.json"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg hover:bg-emerald-100 transition-colors"
    >
      <span>✅ EEAT Verified</span>
    </a>
  );
}
