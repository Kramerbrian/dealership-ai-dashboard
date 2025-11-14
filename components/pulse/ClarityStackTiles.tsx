'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react';
import { useState } from 'react';

interface ClarityStackData {
  scores: {
    seo: number;
    aeo: number;
    geo: number;
    avi: number;
  };
  schema: {
    score: number;
    coverage_by_template?: Record<string, number>;
  };
  ugc: {
    score: number;
    recent_reviews_90d: number;
  };
  competitive: {
    rank: number;
    total: number;
    top_competitors?: Array<{ name: string; avi: number }>;
  };
}

interface ClarityStackTilesProps {
  data: ClarityStackData;
  onTileClick?: (tileId: string) => void;
}

/**
 * Clarity Stack Tiles
 * Row A: SEO Health, AEO Health, GEO Health
 * Row B: UGC & Reviews, Schema Coverage, Competitive Position
 */
export default function ClarityStackTiles({ data, onTileClick }: ClarityStackTilesProps) {
  const [expandedTile, setExpandedTile] = useState<string | null>(null);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Strong';
    if (score >= 60) return 'Needs tuning';
    return 'Critical';
  };

  const handleTileClick = (tileId: string) => {
    setExpandedTile(expandedTile === tileId ? null : tileId);
    onTileClick?.(tileId);
  };

  return (
    <div className="space-y-4">
      {/* Row A: VISIBILITY STACK */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* SEO Health Tile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all cursor-pointer"
          onClick={() => handleTileClick('seo')}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">SEO Health</h3>
            <ExternalLink className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className={`text-4xl font-bold ${getScoreColor(data.scores.seo)}`}>
              {Math.round(data.scores.seo)}
            </span>
            <span className="text-gray-500 text-sm">/100</span>
          </div>
          <p className="text-xs text-gray-600 mb-3">{getScoreLabel(data.scores.seo)}</p>
          {expandedTile === 'seo' && (
            <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-600 space-y-2">
              <p className="font-medium">Top issues:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Core Web Vitals: LCP needs improvement</li>
                <li>3 pages dragging performance down</li>
                <li>Internal linking gaps on service pages</li>
              </ul>
            </div>
          )}
        </motion.div>

        {/* AEO Health Tile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all cursor-pointer"
          onClick={() => handleTileClick('aeo')}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">AEO Health</h3>
            <ExternalLink className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className={`text-4xl font-bold ${getScoreColor(data.scores.aeo)}`}>
              {Math.round(data.scores.aeo)}
            </span>
            <span className="text-gray-500 text-sm">/100</span>
          </div>
          <p className="text-xs text-gray-600 mb-3">{getScoreLabel(data.scores.aeo)}</p>
          {expandedTile === 'aeo' && (
            <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-600 space-y-2">
              <p className="font-medium">Answer gaps:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Missing FAQ blocks for "oil change near me"</li>
                <li>No step-by-step guides for lease vs finance</li>
                <li>Service pages lack clear answer paragraphs</li>
              </ul>
            </div>
          )}
        </motion.div>

        {/* GEO Health Tile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all cursor-pointer"
          onClick={() => handleTileClick('geo')}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">GEO Health</h3>
            <ExternalLink className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className={`text-4xl font-bold ${getScoreColor(data.scores.geo)}`}>
              {Math.round(data.scores.geo)}
            </span>
            <span className="text-gray-500 text-sm">/100</span>
          </div>
          <p className="text-xs text-gray-600 mb-3">{getScoreLabel(data.scores.geo)}</p>
          {expandedTile === 'geo' && (
            <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-600 space-y-2">
              <p className="font-medium">AI visibility gaps:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Schema missing on 84% of VDPs</li>
                <li>GBP & schema NAP mismatch</li>
                <li>Vehicle structured data incomplete</li>
              </ul>
            </div>
          )}
        </motion.div>
      </div>

      {/* Row B: SYSTEM & UGC */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* UGC & Reviews Tile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all cursor-pointer"
          onClick={() => handleTileClick('ugc')}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">UGC & Reviews</h3>
            <ExternalLink className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className={`text-4xl font-bold ${getScoreColor(data.ugc.score)}`}>
              {Math.round(data.ugc.score)}
            </span>
            <span className="text-gray-500 text-sm">/100</span>
          </div>
          <p className="text-xs text-gray-600 mb-1">
            {data.ugc.recent_reviews_90d} reviews (90d)
          </p>
          {expandedTile === 'ugc' && (
            <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-600 space-y-2">
              <p className="font-medium">Opportunities:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Reviews strong but underused on VDPs</li>
                <li>Add 3 review quotes to top 5 URLs</li>
                <li>Review velocity vs competitors: +12%</li>
              </ul>
            </div>
          )}
        </motion.div>

        {/* Schema Coverage Tile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all cursor-pointer"
          onClick={() => handleTileClick('schema')}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Schema Coverage</h3>
            <ExternalLink className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className={`text-4xl font-bold ${getScoreColor(data.schema.score)}`}>
              {Math.round(data.schema.score)}
            </span>
            <span className="text-gray-500 text-sm">/100</span>
          </div>
          <p className="text-xs text-gray-600 mb-1">
            AutoDealer present, Vehicle/FAQ missing
          </p>
          {expandedTile === 'schema' && (
            <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-600 space-y-2">
              <p className="font-medium">Coverage by template:</p>
              <ul className="list-disc list-inside space-y-1">
                {data.schema.coverage_by_template && Object.entries(data.schema.coverage_by_template).map(([template, coverage]) => (
                  <li key={template}>
                    {template.toUpperCase()}: {Math.round(coverage * 100)}%
                  </li>
                ))}
              </ul>
              <button className="mt-2 text-blue-600 hover:underline text-xs">
                Generate missing schema pack →
              </button>
            </div>
          )}
        </motion.div>

        {/* Competitive Position Tile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all cursor-pointer"
          onClick={() => handleTileClick('competitive')}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Competitive Position</h3>
            <ExternalLink className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-4xl font-bold text-purple-600">
              #{data.competitive.rank}
            </span>
            <span className="text-gray-500 text-sm">of {data.competitive.total}</span>
          </div>
          <p className="text-xs text-gray-600 mb-1">
            In your AI local pack
          </p>
          {expandedTile === 'competitive' && (
            <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-600 space-y-2">
              <p className="font-medium">Top competitors:</p>
              <ul className="space-y-1">
                {data.competitive.top_competitors?.map((comp, i) => (
                  <li key={i} className="flex justify-between">
                    <span>{i + 1}. {comp.name}</span>
                    <span className="font-semibold">AVI {comp.avi}</span>
                  </li>
                ))}
              </ul>
              <button className="mt-2 text-blue-600 hover:underline text-xs">
                Open Battle Plan →
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

