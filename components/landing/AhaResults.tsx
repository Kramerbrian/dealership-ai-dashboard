'use client';

import React from 'react';
import {
  AlertTriangle,
  TrendingDown,
  DollarSign,
  Target,
  ArrowRight,
  Zap,
  TrendingUp,
  Award,
  Clock
} from 'lucide-react';

interface DealerData {
  name: string;
  location: string;
  score: number;
  monthlyLoss: number;
  rank: number;
  competitors: Array<{
    name: string;
    score: number;
    location: string;
  }>;
}

interface AhaResultsProps {
  data: DealerData;
  onSignup: () => void;
}

export default function AhaResults({ data, onSignup }: AhaResultsProps) {
  const topCompetitor = data.competitors[0];
  const scoreDiff = topCompetitor.score - data.score;
  const daysInMonth = 30;
  const dailyLoss = data.monthlyLoss / daysInMonth;

  // Calculate how bad it really is
  const visibilityLost = Math.round((100 - data.score) * 0.67); // % of AI searches missing
  const leadsLost = Math.round(data.monthlyLoss / 2800); // Assuming $2800 profit per car

  return (
    <div className="py-24 px-4 bg-gradient-to-b from-red-50 to-white">
      <div className="max-w-5xl mx-auto">

        {/* The Punch - Lead with PAIN */}
        <div className="text-center mb-12">
          <div className="inline-block mb-6">
            <div className="bg-red-100 rounded-full p-4 inline-block">
              <AlertTriangle className="w-12 h-12 text-red-600" />
            </div>
          </div>

          {/* Big Scary Number */}
          <div className="mb-4">
            <div className="text-7xl md:text-8xl font-black text-red-600 mb-2 tracking-tight">
              ${data.monthlyLoss.toLocaleString()}
            </div>
            <div className="text-2xl md:text-3xl text-gray-700 font-medium">
              slipping through your hands every month
            </div>
          </div>

          {/* Sales Tower Commentary */}
          <div className="max-w-2xl mx-auto mt-8 space-y-4">
            <p className="text-xl text-gray-900 leading-relaxed">
              Look, I've been in the tower long enough to know bullsh*t when I see it.
              <br />
              <span className="font-semibold">This ain't bullsh*t.</span>
            </p>

            <p className="text-lg text-gray-700">
              While you're grinding out deals the old-fashioned way, ChatGPT and Gemini are sending
              <span className="font-bold text-red-600"> {leadsLost} customers per month</span> straight to your competitors.
            </p>

            <p className="text-lg text-gray-700">
              That's <span className="font-bold">${dailyLoss.toLocaleString()} a day</span>.
              <br />
              <span className="text-sm text-gray-500">
                (About what you made on your last mini deal, but times infinity.)
              </span>
            </p>
          </div>
        </div>

        {/* The Reality Check - Show the Score */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Your Sad Score */}
          <div className="bg-white border-2 border-red-200 rounded-2xl p-8 shadow-lg">
            <div className="text-sm uppercase tracking-wide text-red-600 font-semibold mb-2">
              Your AI Visibility Score
            </div>
            <div className="flex items-end gap-4 mb-4">
              <div className="text-6xl font-black text-gray-900">{data.score}</div>
              <div className="text-3xl font-bold text-gray-400 pb-2">/100</div>
            </div>
            <div className="text-gray-600 mb-4">
              {data.score < 50 && "Ouch. I've seen better numbers on a Saturday at 8pm."}
              {data.score >= 50 && data.score < 70 && "Not terrible, but you're definitely not popping bottles."}
              {data.score >= 70 && data.score < 85 && "Decent. Like a solid 12-car Saturday."}
              {data.score >= 85 && "Pretty good! But let's be honest, you can always do better."}
            </div>
            <div className="flex items-center gap-2 text-sm text-red-600">
              <TrendingDown className="w-4 h-4" />
              <span>Missing {visibilityLost}% of AI searches</span>
            </div>
          </div>

          {/* Competitor's Better Score */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-8 shadow-lg relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <Award className="w-8 h-8 text-green-500 opacity-20" />
            </div>
            <div className="text-sm uppercase tracking-wide text-green-700 font-semibold mb-2">
              Meanwhile, {topCompetitor.name}
            </div>
            <div className="flex items-end gap-4 mb-4">
              <div className="text-6xl font-black text-green-700">{topCompetitor.score}</div>
              <div className="text-3xl font-bold text-green-400 pb-2">/100</div>
            </div>
            <div className="text-gray-700 mb-4">
              They're crushing it. Probably celebrating with overpriced cocktails right now.
            </div>
            <div className="flex items-center gap-2 text-sm text-green-700 font-semibold">
              <TrendingUp className="w-4 h-4" />
              <span>{scoreDiff} points ahead of you</span>
            </div>
            <div className="text-xs text-gray-600 mt-2">
              That's like showing up to a knife fight with a pencil.
            </div>
          </div>
        </div>

        {/* The Commentary Box */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-500 rounded-r-xl p-6 mb-12">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">
                Let me break this down like a finance manager
              </h4>
              <p className="text-gray-700 mb-3">
                <span className="font-semibold">{topCompetitor.name}</span> shows up in <span className="font-bold">{scoreDiff}% more</span> AI-powered searches than you.
              </p>
              <p className="text-gray-700 mb-3">
                When someone asks ChatGPT "best dealership near me," guess who's getting recommended?
                <br />
                <span className="text-sm text-gray-600">(Hint: It ain't you, chief.)</span>
              </p>
              <p className="text-gray-700 font-semibold">
                You're literally invisible to the future of car shopping.
              </p>
            </div>
          </div>
        </div>

        {/* The Quick Wins Tease */}
        <div className="bg-white border-2 border-blue-200 rounded-2xl p-8 mb-12 shadow-lg">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Good news: We found 3 quick fixes
              </h3>
              <p className="text-gray-600">
                (Yeah, I know. "Quick fixes." I've heard that before too. But these actually work.)
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold">
                1
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900 mb-1">Missing Schema Markup</div>
                <div className="text-sm text-gray-600">
                  Google can't read your site. It's like showing up to a lineup without your license.
                </div>
                <div className="text-xs text-blue-600 mt-2">
                  Fix time: 5 minutes • Impact: +15-20 points
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                2
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900 mb-1">No AI-Friendly FAQ</div>
                <div className="text-sm text-gray-600">
                  ChatGPT has nothing to work with. It's like a salesperson with no product knowledge.
                </div>
                <div className="text-xs text-blue-600 mt-2">
                  Fix time: 10 minutes • Impact: +10-15 points
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 font-bold">
                3
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900 mb-1">Google Business Profile Issues</div>
                <div className="text-sm text-gray-600">
                  Your hours are wrong and you have 3 duplicate listings. Classic.
                </div>
                <div className="text-xs text-blue-600 mt-2">
                  Fix time: 15 minutes • Impact: +8-12 points
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-green-700">
              <Clock className="w-4 h-4" />
              <span className="font-semibold">
                Total fix time: 30 minutes • Potential gain: 33-47 points • ROI: Literally infinite
              </span>
            </div>
          </div>
        </div>

        {/* The Close - CTA with Personality */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-2xl">
            <h3 className="text-3xl font-bold mb-4">
              So here's the deal...
            </h3>
            <p className="text-xl mb-2 text-blue-100">
              You can keep bleeding ${dailyLoss.toLocaleString()} a day,
            </p>
            <p className="text-xl mb-6 text-blue-100">
              Or you can sign up free and fix this mess in 30 minutes.
            </p>

            <button
              onClick={onSignup}
              className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-bold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 inline-flex items-center gap-3"
            >
              <span>Fine, Let's Fix It</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <p className="text-sm text-blue-200 mt-4">
              No credit card. No BS. Just free fixes that actually work.
            </p>
            <p className="text-xs text-blue-300 mt-2">
              (Unlike that "certified pre-owned" Altima you tried to sell me last month.)
            </p>
          </div>

          {/* Last Ditch Objection Handler */}
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <p className="text-sm text-gray-600 italic">
                "I'll do it later" = You won't.
                <br />
                I've been in the tower. I know how this ends.
                <br />
                <span className="font-semibold text-gray-900">
                  Your competitor just scanned their site 3 times this week. They're not waiting.
                </span>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
