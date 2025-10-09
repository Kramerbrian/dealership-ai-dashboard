export default function TestDeployment() {
  return (
    <div className="min-h-screen bg-green-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">✅ Deployment Working!</h1>
        <p className="text-xl mb-8">If you can see this page, your Vercel deployment is successful.</p>
        <div className="bg-green-800 p-4 rounded-lg">
          <p className="text-sm">Timestamp: {new Date().toISOString()}</p>
          <p className="text-sm">Status: Active</p>
        </div>
        <div className="mt-8">
          <a 
            href="/" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Go to Homepage
          </a>
        </div>
      </div>
    </div>
  )
}
