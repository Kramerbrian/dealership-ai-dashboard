export default function MarketingSimplePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a href="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-blue-600">DealershipAI</span>
            </a>
            <nav className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="#features" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Features</a>
                <a href="#demo" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Demo</a>
                <a href="#pricing" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Pricing</a>
                <a href="#contact" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Contact</a>
              </div>
            </nav>
            <div className="flex items-center gap-4">
              <a href="/demo" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                View Demo
              </a>
              <a
                href="https://dash.dealershipai.com"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Get Started
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-blue-50 to-white py-20 text-center">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
            Transform Your Dealership with AI-Powered Analytics
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Get comprehensive insights into your dealership's online presence, customer engagement, and growth opportunities with our advanced AI visibility tracking.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://dash.dealershipai.com"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors inline-block"
            >
              🚀 Get My AI Report
            </a>
            <a
              href="/demo"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition-colors inline-block"
            >
              View Demo
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">Powerful Analytics for Modern Dealerships</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Visibility Tracking</h3>
              <p className="text-gray-600">Monitor your dealership's presence across AI platforms like Google SGE, ChatGPT, and Perplexity with real-time visibility metrics.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Advanced Search & Filtering</h3>
              <p className="text-gray-600">Powerful search capabilities with advanced filtering, sorting, and real-time suggestions to find exactly what you need.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">📈</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Performance Analytics</h3>
              <p className="text-gray-600">Track revenue at risk, monthly leads, and performance scores with beautiful glassmorphism dashboards.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Modern UI Design</h3>
              <p className="text-gray-600">Beautiful glassmorphism interface with responsive design, dark/light themes, and accessibility features.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-time Data</h3>
              <p className="text-gray-600">Live data integration with loading states, error handling, and performance monitoring for optimal user experience.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Enterprise Security</h3>
              <p className="text-gray-600">Built with enterprise-grade security, RBAC, HMAC verification, and comprehensive audit trails.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-20 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Dealership?</h2>
          <p className="text-xl mb-8">Join hundreds of dealerships already using DealershipAI to boost their online presence and drive more sales.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://dash.dealershipai.com"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-100 transition-colors inline-block"
            >
              🚀 Start Your Free Analysis
            </a>
            <a
              href="/demo"
              className="bg-blue-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-400 transition-colors inline-block"
            >
              View Demo First
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-600">&copy; 2024 DealershipAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
