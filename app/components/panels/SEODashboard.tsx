'use client';
import { useState, useEffect } from 'react';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Eye, 
  BarChart3, 
  Zap,
  CheckCircle,
  AlertTriangle,
  Info,
  Play,
  Download,
  RefreshCw
} from 'lucide-react';

interface SEOVariant {
  id: string;
  title: string;
  description: string;
  metaDescription: string;
  bulletPoints: string[];
  keywords: string[];
  atiScore: number;
  clarityScore: number;
  conversionScore: number;
  seoScore: number;
  validation: {
    issues: Array<{
      code: string;
      message: string;
      severity: 'error' | 'warn' | 'info';
    }>;
    score: number;
    recommendations: string[];
  };
  finalScore: number;
}

interface SEOAnalysis {
  semanticIntents: Array<{
    keyword: string;
    intent: 'informational' | 'navigational' | 'transactional' | 'commercial';
    confidence: number;
    buyerPersona: string;
  }>;
  competitiveEdges: Array<{
    advantage: string;
    strength: number;
    evidence: string[];
  }>;
  conversionHooks: string[];
}

export default function SEODashboard() {
  const [variants, setVariants] = useState<SEOVariant[]>([]);
  const [analysis, setAnalysis] = useState<SEOAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [productInput, setProductInput] = useState({
    name: 'Premium Wireless Headphones',
    category: 'electronics',
    targetKeywords: ['wireless headphones', 'bluetooth audio', 'noise cancelling'],
    tone: 'professional' as const,
    usp: ['Active noise cancellation', '30-hour battery life', 'Premium sound quality'],
    competitiveAdvantages: ['Industry-leading noise cancellation', 'Fast charging technology'],
    brandSamples: [
      'Premium quality products for discerning customers',
      'Innovation meets reliability in every design',
      'Professional-grade solutions for modern lifestyles'
    ],
    targetLocales: ['en-US', 'en-GB', 'de-DE', 'fr-FR'],
    useEnhancedFeatures: true
  });

  const generateVariants = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/seo/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productInput)
      });
      
      const result = await response.json();
      if ((result as any).ok) {
        setVariants((result as any).variants);
        setAnalysis((result as any).analysis);
        setSelectedVariant((result as any).recommendations.bestVariant);
      }
    } catch (error) {
      console.error('Error generating variants:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateABTest = async (variantId: string, success: number, fail: number) => {
    try {
      await fetch('/api/seo/ab/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId, success, fail })
      });
    } catch (error) {
      console.error('Error updating A/B test:', error);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-emerald-500/10 border-emerald-500/20';
    if (score >= 60) return 'bg-amber-500/10 border-amber-500/20';
    return 'bg-rose-500/10 border-rose-500/20';
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error': return <AlertTriangle className="h-4 w-4 text-rose-400" />;
      case 'warn': return <AlertTriangle className="h-4 w-4 text-amber-400" />;
      case 'info': return <Info className="h-4 w-4 text-blue-400" />;
      default: return <Info className="h-4 w-4 text-slate-400" />;
    }
  };

  const getIntentColor = (intent: string) => {
    switch (intent) {
      case 'transactional': return 'bg-emerald-500/20 text-emerald-400';
      case 'commercial': return 'bg-blue-500/20 text-blue-400';
      case 'informational': return 'bg-amber-500/20 text-amber-400';
      case 'navigational': return 'bg-purple-500/20 text-purple-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">dAI SEO Intelligence</h2>
              <p className="text-slate-400 text-sm">Advanced product description optimization</p>
            </div>
          </div>
          <button
            onClick={generateVariants}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            {loading ? 'Generating...' : 'Generate Variants'}
          </button>
        </div>

        {/* Product Input */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Product Name</label>
            <input
              type="text"
              value={productInput.name}
              onChange={(e) => setProductInput(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
            <select
              value={productInput.category}
              onChange={(e) => setProductInput(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
            >
              <option value="electronics">Electronics</option>
              <option value="clothing">Clothing</option>
              <option value="home">Home & Garden</option>
              <option value="automotive">Automotive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Semantic Intent Analysis */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-indigo-400" />
              Semantic Intent
            </h3>
            <div className="space-y-3">
              {analysis.semanticIntents.map((intent, index) => (
                <div key={index} className="p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">{intent.keyword}</span>
                    <span className={`px-2 py-1 rounded text-xs ${getIntentColor(intent.intent)}`}>
                      {intent.intent}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">
                    Confidence: {(intent.confidence * 100).toFixed(0)}% • {intent.buyerPersona}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Competitive Edges */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-400" />
              Competitive Edges
            </h3>
            <div className="space-y-3">
              {analysis.competitiveEdges.map((edge, index) => (
                <div key={index} className="p-3 bg-slate-800/50 rounded-lg">
                  <div className="text-sm font-medium text-white mb-1">{edge.advantage}</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-indigo-500 h-2 rounded-full transition-all"
                        style={{ width: `${edge.strength * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400">{(edge.strength * 100).toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Conversion Hooks */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-indigo-400" />
              Conversion Hooks
            </h3>
            <div className="space-y-2">
              {analysis.conversionHooks.map((hook, index) => (
                <div key={index} className="flex items-start gap-2 p-2 bg-slate-800/50 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-slate-300">{hook}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Variants */}
      {variants.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-400" />
            Generated Variants
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {variants.map((variant) => (
              <div
                key={variant.id}
                className={`${getScoreBg(variant.finalScore)} border rounded-xl p-6 cursor-pointer transition-all hover:border-opacity-60 ${
                  selectedVariant === variant.id ? 'ring-2 ring-indigo-500' : ''
                }`}
                onClick={() => setSelectedVariant(variant.id)}
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-white">{variant.title}</h4>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getScoreColor(variant.finalScore)}`}>
                      {variant.finalScore.toFixed(0)}
                    </div>
                    <div className="text-xs text-slate-400">Final Score</div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center">
                      <div className={`text-lg font-semibold ${getScoreColor(variant.atiScore)}`}>
                        {variant.atiScore.toFixed(0)}
                      </div>
                      <div className="text-xs text-slate-400">ATI</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-lg font-semibold ${getScoreColor(variant.clarityScore)}`}>
                        {variant.clarityScore.toFixed(0)}
                      </div>
                      <div className="text-xs text-slate-400">Clarity</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-lg font-semibold ${getScoreColor(variant.conversionScore)}`}>
                        {variant.conversionScore.toFixed(0)}
                      </div>
                      <div className="text-xs text-slate-400">Conversion</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-lg font-semibold ${getScoreColor(variant.seoScore)}`}>
                        {variant.seoScore.toFixed(0)}
                      </div>
                      <div className="text-xs text-slate-400">SEO</div>
                    </div>
                  </div>
                </div>

                <div className="text-sm text-slate-300 mb-4 line-clamp-3">
                  {variant.description}
                </div>

                {/* Validation Issues */}
                {variant.validation.issues.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {variant.validation.issues.slice(0, 2).map((issue, index) => (
                      <div key={index} className="flex items-start gap-2 text-xs">
                        {getSeverityIcon(issue.severity)}
                        <span className="text-slate-400">{issue.message}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* A/B Test Controls */}
                <div className="flex gap-2">
                  <button
                    onClick={() => updateABTest(variant.id, 1, 0)}
                    className="flex-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs transition-colors"
                  >
                    Success
                  </button>
                  <button
                    onClick={() => updateABTest(variant.id, 0, 1)}
                    className="flex-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs transition-colors"
                  >
                    Fail
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
