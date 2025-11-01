'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, AlertCircle, CheckCircle2, Copy, ExternalLink } from 'lucide-react';

/**
 * Webhooks Management Page
 * Enterprise tier only
 */
export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newWebhook, setNewWebhook] = useState({
    url: '',
    events: [] as string[],
  });

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const fetchWebhooks = async () => {
    try {
      const response = await fetch('/api/user/webhooks');
      const data = await response.json();
      setWebhooks(data.webhooks || []);
    } catch (error) {
      console.error('Webhooks fetch error:', error);
    }
  };

  const handleAddWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/user/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWebhook),
      });

      if (response.ok) {
        fetchWebhooks();
        setShowAddForm(false);
        setNewWebhook({ url: '', events: [] });
      }
    } catch (error) {
      console.error('Webhook add error:', error);
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    if (!confirm('Delete this webhook?')) return;

    try {
      await fetch(`/api/user/webhooks/${id}`, {
        method: 'DELETE',
      });
      fetchWebhooks();
    } catch (error) {
      console.error('Webhook delete error:', error);
    }
  };

  const handleTestWebhook = async (id: string) => {
    try {
      await fetch(`/api/user/webhooks/${id}/test`, {
        method: 'POST',
      });
      alert('Test webhook sent!');
    } catch (error) {
      console.error('Webhook test error:', error);
    }
  };

  const events = [
    'trust_score_changed',
    'critical_issue_detected',
    'competitor_passed_you',
    'fix_applied',
    'tier_upgraded',
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Webhooks</h1>
        <p className="text-zinc-400">
          Configure real-time event notifications for integrations (Enterprise only)
        </p>
      </div>

      {/* Add Webhook Button */}
      {!showAddForm && (
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Webhook
        </button>
      )}

      {/* Add Webhook Form */}
      {showAddForm && (
        <form onSubmit={handleAddWebhook} className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Webhook URL
            </label>
            <input
              type="url"
              value={newWebhook.url}
              onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
              placeholder="https://your-server.com/webhook"
              className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Subscribe to Events
            </label>
            <div className="space-y-2">
              {events.map((event) => (
                <label key={event} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newWebhook.events.includes(event)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setNewWebhook({ ...newWebhook, events: [...newWebhook.events, event] });
                      } else {
                        setNewWebhook({ ...newWebhook, events: newWebhook.events.filter(e => e !== event) });
                      }
                    }}
                    className="w-4 h-4 text-purple-600 rounded"
                  />
                  <span className="text-sm text-zinc-300">{event}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Create Webhook
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setNewWebhook({ url: '', events: [] });
              }}
              className="px-4 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Webhooks List */}
      <div className="space-y-4">
        {webhooks.map((webhook) => (
          <div key={webhook.id} className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <ExternalLink className="w-4 h-4 text-zinc-400" />
                  <span className="text-white font-medium">{webhook.url}</span>
                  {webhook.active ? (
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">Active</span>
                  ) : (
                    <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded">Inactive</span>
                  )}
                </div>
                <div className="text-sm text-zinc-400">
                  Events: {webhook.events.join(', ')}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleTestWebhook(webhook.id)}
                  className="px-3 py-1.5 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 text-sm transition-colors"
                >
                  Test
                </button>
                <button
                  onClick={() => handleDeleteWebhook(webhook.id)}
                  className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 text-sm transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Secret (shown once) */}
            {webhook.secret && (
              <div className="mt-4 p-3 bg-zinc-900/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400">Webhook Secret:</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(webhook.secret)}
                    className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300"
                  >
                    <Copy className="w-3 h-3" />
                    Copy
                  </button>
                </div>
                <code className="text-xs text-zinc-500 font-mono block mt-1">{webhook.secret}</code>
                <p className="text-xs text-amber-400 mt-2">
                  ⚠️ Save this secret now. It won't be shown again.
                </p>
              </div>
            )}
          </div>
        ))}

        {webhooks.length === 0 && (
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-12 text-center">
            <AlertCircle className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
            <p className="text-zinc-400">No webhooks configured</p>
            <p className="text-sm text-zinc-500 mt-2">
              Add a webhook to receive real-time event notifications
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

