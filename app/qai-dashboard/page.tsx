import QAIStrategicTerminal from '@/components/dashboard/QAIStrategicTerminal';

export default function QAIDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        <QAIStrategicTerminal 
          dealerId="demo-dealer" 
          targetSegment="Used Trucks"
          localCompetitorAvg={65.0}
        />
      </div>
    </div>
  );
}
