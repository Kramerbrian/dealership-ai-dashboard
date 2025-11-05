// components/BenchmarkCard.tsx

export function BenchmarkCard() {
  return (
    <div className="rounded-xl border p-4 bg-white/5 text-white text-sm">
      <div className="font-semibold mb-2">📊 Industry Benchmarks</div>
      <div className="text-white/80 mb-2">Dealers like you (Honda, 80–100 cars/mo):</div>
      <table className="w-full text-xs">
        <thead><tr><th className="text-left">Metric</th><th>You</th><th>Avg</th><th>Top 10%</th></tr></thead>
        <tbody>
          <tr><td>AIV Score</td><td>72</td><td>68</td><td>85</td></tr>
          <tr><td>Review Resp</td><td>78%</td><td>45%</td><td>92%</td></tr>
          <tr><td>Schema Cov</td><td>72%</td><td>35%</td><td>95%</td></tr>
          <tr><td>Content Freq</td><td>1/mo</td><td>2/mo</td><td>8/mo</td></tr>
        </tbody>
      </table>
      <div className="mt-2">Quick wins:</div>
      <ul className="list-disc list-inside text-white/80">
        <li>Publish 4 more blogs/month</li>
        <li>Add product schema (20 min)</li>
        <li>Maintain review response rate</li>
      </ul>
    </div>
  );
}

