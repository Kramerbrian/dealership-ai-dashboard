'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Clock, AlertCircle, ArrowRight } from 'lucide-react';

interface ActionItem {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed';
  dueDate?: string;
  category: 'seo' | 'reviews' | 'ai' | 'content';
}

export default function ActionQueue() {
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActions();
  }, []);

  const fetchActions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard/actions');
      const data = await res.json();
      setActions(data.actions);
    } catch (error) {
      console.error('Failed to fetch actions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-amber-600 bg-amber-50';
      case 'low': return 'text-blue-600 bg-blue-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'in-progress': return <Clock className="w-4 h-4 text-blue-600" />;
      case 'pending': return <AlertCircle className="w-4 h-4 text-amber-600" />;
      default: return <Clock className="w-4 h-4 text-slate-600" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'seo': return '🔍';
      case 'reviews': return '⭐';
      case 'ai': return '🤖';
      case 'content': return '📝';
      default: return '📋';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-slate-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-900">Action Queue</h3>
        <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
          View All
        </button>
      </div>

      <div className="space-y-3">
        {actions.slice(0, 5).map((action) => (
          <div
            key={action.id}
            className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-lg">{getCategoryIcon(action.category)}</span>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">
                    {action.title}
                  </h4>
                  <p className="text-sm text-slate-600 mt-1">{action.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {getStatusIcon(action.status)}
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(action.priority)}`}>
                  {action.priority}
                </span>
              </div>
            </div>

            {action.dueDate && (
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200">
                <span className="text-xs text-slate-500">
                  Due: {new Date(action.dueDate).toLocaleDateString()}
                </span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
              </div>
            )}
          </div>
        ))}
      </div>

      {actions.length === 0 && (
        <div className="text-center py-8">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <p className="text-slate-500">All caught up! No pending actions.</p>
        </div>
      )}
    </div>
  );
}
