'use client';

import { useState, useEffect } from 'react';
import { Star, TrendingUp, MessageSquare, Calendar } from 'lucide-react';

interface Review {
  id: string;
  rating: number;
  comment: string;
  author: string;
  date: string;
  source: 'google' | 'facebook' | 'yelp' | 'dealer_website';
  response?: string;
  responseDate?: string;
}

export default function ReviewsTimeline() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'recent' | 'unresponded'>('all');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      // Simulated data - replace with actual API call
      const mockReviews: Review[] = [
        {
          id: '1',
          rating: 5,
          comment: 'Excellent service! The team was professional and helped me find the perfect car.',
          author: 'John Smith',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          source: 'google',
          response: 'Thank you for your kind words, John! We\'re thrilled you had a great experience.',
          responseDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          rating: 4,
          comment: 'Good selection of vehicles, but the financing process took longer than expected.',
          author: 'Sarah Johnson',
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          source: 'google',
        },
        {
          id: '3',
          rating: 5,
          comment: 'Amazing customer service! Highly recommend this dealership.',
          author: 'Mike Davis',
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          source: 'facebook',
          response: 'Thank you, Mike! We appreciate your recommendation.',
          responseDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '4',
          rating: 3,
          comment: 'Average experience. The car was fine but the sales process felt rushed.',
          author: 'Lisa Wilson',
          date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          source: 'yelp',
        },
        {
          id: '5',
          rating: 5,
          comment: 'Best dealership in Naples! The staff went above and beyond.',
          author: 'Robert Brown',
          date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
          source: 'google',
          response: 'We\'re so glad we could exceed your expectations, Robert!',
          responseDate: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];
      setReviews(mockReviews);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews = reviews.filter(review => {
    switch (filter) {
      case 'recent':
        return new Date(review.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      case 'unresponded':
        return !review.response;
      default:
        return true;
    }
  });

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'google': return 'text-blue-600 bg-blue-50';
      case 'facebook': return 'text-blue-700 bg-blue-50';
      case 'yelp': return 'text-red-600 bg-red-50';
      case 'dealer_website': return 'text-emerald-600 bg-emerald-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-slate-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-slate-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-900">Recent Reviews</h3>
        <div className="flex gap-2">
          {(['all', 'recent', 'unresponded'] as const).map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                filter === filterType
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {filterType === 'all' ? 'All' : filterType === 'recent' ? 'Recent' : 'Unresponded'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <div key={review.id} className="p-4 bg-slate-50 rounded-lg">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-slate-300 to-slate-400 rounded-full flex items-center justify-center text-white font-semibold">
                  {review.author[0]}
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">{review.author}</h4>
                  <div className="flex items-center gap-2">
                    <div className="flex">{getRatingStars(review.rating)}</div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getSourceColor(review.source)}`}>
                      {review.source}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm text-slate-500">
                <Calendar className="w-4 h-4" />
                {new Date(review.date).toLocaleDateString()}
              </div>
            </div>

            <p className="text-slate-700 mb-3">{review.comment}</p>

            {review.response ? (
              <div className="pl-4 border-l-2 border-emerald-200 bg-emerald-50 p-3 rounded-r-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-semibold text-emerald-700">Dealership Response</span>
                </div>
                <p className="text-slate-700 text-sm">{review.response}</p>
                {review.responseDate && (
                  <p className="text-xs text-slate-500 mt-2">
                    Responded {new Date(review.responseDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            ) : (
              <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                Respond to this review
              </button>
            )}
          </div>
        ))}
      </div>

      {filteredReviews.length === 0 && (
        <div className="text-center py-8">
          <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-500">No reviews found for the selected filter.</p>
        </div>
      )}
    </div>
  );
}
