/**
 * DTRI-MAXIMUS Page
 * Digital Trust Revenue Index - Autonomous Predictive System
 * Intelligence Command Center Integration
 */

import DTriMaximusIntelligenceCommand from '../../components/dashboard/DTRI-MAXIMUS-Intelligence-Command';

export default function DTRIMaximusPage() {
  // In a real app, these would come from your auth context or URL params
  const tenantId = '00000000-0000-0000-0000-000000000000';
  const dealershipId = '11111111-1111-1111-1111-111111111111';

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        <DTriMaximusIntelligenceCommand 
          tenantId={tenantId}
          dealershipId={dealershipId}
        />
      </div>
    </div>
  );
}
