'use client';
import { useState } from 'react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e: any) => {
    e.preventDefault();
    const email = new FormData(e.currentTarget).get('email');
    await fetch('/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
  };

  if (isSubmitted) {
    return (
      <div className="p-6 bg-green-50 border border-green-200 rounded-xl">
        <div className="text-center">
          <div className="text-2xl mb-2">✅</div>
          <h3 className="font-semibold text-green-800 mb-1">Thanks for subscribing!</h3>
          <p className="text-sm text-green-600">
            You'll receive our latest AI visibility insights and updates.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white/80 backdrop-blur ring-1 ring-gray-900/5 rounded-xl border border-gray-200">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Stay ahead of AI visibility trends
        </h3>
        <p className="text-sm text-gray-600">
          Get weekly insights on AI search changes, optimization tips, and industry updates.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <input
            type="email"
            name="email"
            placeholder="Enter your email address"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <button
          type="submit"
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Subscribe to Newsletter
        </button>
      </form>

      <p className="text-xs text-gray-500 text-center mt-3">
        No spam. Unsubscribe anytime. We respect your privacy.
      </p>
    </div>
  );
}
