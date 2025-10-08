export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-2">
            DealershipAI
          </div>
          <h2 className="text-2xl font-semibold text-slate-900 mb-2">
            Get Started with DealershipAI
          </h2>
          <p className="text-slate-600">
            Registration is disabled for demo purposes
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">🚀</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Ready to Start
            </h3>
            <p className="text-slate-600 mb-6">
              Click below to access the demo dashboard
            </p>
            <a 
              href="/dashboard" 
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200"
            >
              Access Demo Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
