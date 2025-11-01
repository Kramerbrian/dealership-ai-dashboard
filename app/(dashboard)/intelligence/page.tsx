import RaRCard from './widgets/RaRCard';
import PredictionPanel from './widgets/PredictionPanel';

export default function IntelligencePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">AI Intelligence</h1>
        <p className="mt-2 text-gray-600">
          Advanced AI analytics, competitor insights, and strategic recommendations
        </p>
      </div>

      {/* Intelligence Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Revenue at Risk Card */}
        <RaRCard dealerId="germain-toyota-naples" />
        
        {/* AI Insights Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 ml-3">AI Insights</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Deep analysis of your AI visibility across all major platforms.
          </p>
          <div className="text-2xl font-bold text-blue-600">94.2%</div>
          <div className="text-sm text-gray-500">Overall AI Score</div>
        </div>

        {/* Competitor Analysis Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 ml-3">Competitor Analysis</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Track how you compare against local and national competitors.
          </p>
          <div className="text-2xl font-bold text-green-600">#3</div>
          <div className="text-sm text-gray-500">Market Position</div>
        </div>
      </div>

      {/* GNN Prediction Panel */}
      <div className="mt-8">
        <PredictionPanel />
      </div>
    </div>
  );
}

