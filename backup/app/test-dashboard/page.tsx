export default function TestDashboardPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Test Dashboard
      </h1>
      <p className="text-gray-600">
        This is a simple test page to verify routing is working.
      </p>
      <div className="mt-8 p-4 bg-blue-100 rounded-lg">
        <h2 className="text-xl font-semibold text-blue-800">QAI* Engine Status</h2>
        <p className="text-blue-700 mt-2">
          ✅ Core algorithms implemented<br/>
          ✅ API endpoints working<br/>
          ✅ Dashboard components ready<br/>
          ✅ Mock data generation complete
        </p>
      </div>
    </div>
  );
}
