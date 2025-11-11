export default function LandingLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="wrapper">
        {/* Header skeleton */}
        <header className="wrapper" style={{ paddingBottom: 0 }}>
          <nav className="nav" aria-label="Main navigation">
            <div className="logo">
              <span className="logo-dot" aria-hidden="true" />
              DealershipAI
            </div>
            <div className="nav-desktop">
              <div className="h-4 w-20 bg-white/10 rounded animate-pulse" />
              <div className="h-4 w-20 bg-white/10 rounded animate-pulse" />
              <div className="h-4 w-20 bg-white/10 rounded animate-pulse" />
            </div>
          </nav>
        </header>

        {/* Hero skeleton */}
        <main className="wrapper">
          <section className="hero">
            <div>
              <div className="h-6 w-48 bg-white/10 rounded mb-4 animate-pulse" />
              <div className="h-12 w-full max-w-2xl bg-white/10 rounded mb-4 animate-pulse" />
              <div className="h-6 w-full max-w-xl bg-white/10 rounded mb-8 animate-pulse" />
              
              {/* Form skeleton */}
              <div className="panel">
                <div className="scan">
                  <div className="h-12 w-full bg-white/10 rounded animate-pulse" />
                  <div className="h-12 w-32 bg-white/10 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

