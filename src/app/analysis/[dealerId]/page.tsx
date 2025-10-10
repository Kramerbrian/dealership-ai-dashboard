import DealerAnalysisReport from '@/components/DealerAnalysisReport';

interface AnalysisPageProps {
  params: {
    dealerId: string;
  };
}

export default function AnalysisPage({ params }: AnalysisPageProps) {
  const { dealerId } = params;

  // In production, you would fetch dealer details from your database
  const dealerDetails = {
    id: dealerId,
    name: 'Lou Glutz Motors',
    city: 'Naples',
    state: 'FL',
    brand: 'Hyundai'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DealerAnalysisReport
        dealerId={dealerDetails.id}
        dealerName={dealerDetails.name}
        city={dealerDetails.city}
        state={dealerDetails.state}
        brand={dealerDetails.brand}
      />
    </div>
  );
}
