export default function DriveLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <header className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 animate-pulse" />
          <div className="h-6 w-48 bg-white/10 rounded animate-pulse" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-24 bg-white/10 rounded-full animate-pulse" />
          <div className="h-10 w-32 bg-white/10 rounded-full animate-pulse" />
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8">
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 animate-pulse"
            >
              <div className="h-6 bg-white/10 rounded w-3/4 mb-3" />
              <div className="h-4 bg-white/10 rounded w-full mb-2" />
              <div className="h-4 bg-white/10 rounded w-2/3 mb-4" />
              <div className="flex items-center gap-4 mb-4">
                <div className="h-4 bg-white/10 rounded w-24" />
                <div className="h-4 bg-white/10 rounded w-20" />
              </div>
              <div className="flex gap-2 pt-4 border-t border-white/10">
                <div className="h-10 bg-white/10 rounded-lg w-20" />
                <div className="h-10 bg-white/10 rounded-lg w-24" />
              </div>
            </div>
          ))}
        </div>

        <div className="hidden lg:block">
          <div className="border border-white/10 rounded-lg p-5">
            <div className="h-6 bg-white/10 rounded w-32 mb-3 animate-pulse" />
            <div className="h-4 bg-white/10 rounded w-full mb-2 animate-pulse" />
            <div className="h-4 bg-white/10 rounded w-3/4 animate-pulse" />
          </div>
        </div>
      </section>
    </div>
  );
}

