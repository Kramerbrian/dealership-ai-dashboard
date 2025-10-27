export default function WaitlistPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Join the Waitlist</h1>
        <p className="text-gray-600 mb-6">
          Be the first to know when DealershipAI launches!
        </p>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <form className="space-y-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Join Waitlist
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
