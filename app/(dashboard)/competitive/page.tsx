'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, Users, MapPin, Star, Award } from 'lucide-react';

export default function CompetitivePage() {
  const [competitors] = useState([
    {
      id: 1,
      name: 'Selleck Motors',
      location: 'Temecula, CA',
      score: 78,
      change: +5.2,
      marketShare: 24.3,
      strengths: ['High review volume', 'Strong GBP presence'],
    },
    {
      id: 2,
      name: 'LaRusso Auto',
      location: 'Reseda, CA',
      score: 71,
      change: -2.1,
      marketShare: 18.7,
      strengths: ['Active on social media', 'Good schema markup'],
    },
    {
      id: 3,
      name: 'Your Dealership',
      location: 'Chicago, IL',
      score: 64,
      change: +3.5,
      marketShare: 15.2,
      isYou: true,
    },
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Competitive Intelligence</h1>
        <p className="mt-2 text-gray-600">Track your position against competitors</p>
      </div>

      {/* Market Position */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Award className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">Rank</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">#3</div>
          <div className="text-sm text-green-600 mt-2">+1 this month</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm text-gray-500">Market Share</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">15.2%</div>
          <div className="text-sm text-green-600 mt-2">+2.3% this month</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Star className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-gray-500">AI Score</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">64</div>
          <div className="text-sm text-green-600 mt-2">+3.5 this week</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Users className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-sm text-gray-500">Competitors</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">12</div>
          <div className="text-sm text-gray-500 mt-2">Tracked</div>
        </div>
      </div>

      {/* Competitor Comparison */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Competitor Comparison</h2>
        <div className="space-y-4">
          {competitors.map((competitor) => (
            <div
              key={competitor.id}
              className={`p-4 rounded-lg border-2 ${
                competitor.isYou
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    competitor.isYou
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    <span className="font-bold">{competitor.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {competitor.name}
                      {competitor.isYou && (
                        <span className="ml-2 text-xs px-2 py-1 bg-blue-600 text-white rounded-full">
                          You
                        </span>
                      )}
                    </h3>
                    <div className="flex items-center space-x-1 text-sm text-gray-500 mt-1">
                      <MapPin className="w-4 h-4" />
                      <span>{competitor.location}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{competitor.score}</div>
                  <div className={`flex items-center space-x-1 text-sm ${
                    competitor.change > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {competitor.change > 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    <span>{Math.abs(competitor.change)}</span>
                  </div>
                </div>
              </div>
              {competitor.strengths && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Key Strengths:</h4>
                  <div className="flex flex-wrap gap-2">
                    {competitor.strengths.map((strength, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-700"
                      >
                        {strength}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

