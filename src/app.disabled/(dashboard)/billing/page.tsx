'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, CreditCard, Download } from 'lucide-react';

interface Subscription {
  id: string;
  status: string;
  current_period_end: number;
  cancel_at_period_end: boolean;
  plan: {
    name: string;
    price: number;
    interval: string;
  };
}

export default function BillingPage() {
  const { user } = useUser();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/billing/subscription');
      const data = await response.json();
      setSubscription(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (priceId: string) => {
    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });
      
      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
    }
  };

  const handleManageBilling = async () => {
    try {
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
      });
      
      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error creating portal session:', error);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Billing & Subscription</h1>
        <p className="text-gray-600 mt-2">Manage your subscription and billing information</p>
      </div>

      {subscription ? (
        <div className="space-y-6">
          {/* Current Subscription */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {subscription.plan.name}
                    <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                      {subscription.status}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    ${subscription.plan.price}/{subscription.plan.interval}
                  </CardDescription>
                </div>
                <Button onClick={handleManageBilling} variant="outline">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Manage Billing
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  {subscription.cancel_at_period_end
                    ? `Cancels on ${new Date(subscription.current_period_end * 1000).toLocaleDateString()}`
                    : `Renews on ${new Date(subscription.current_period_end * 1000).toLocaleDateString()}`
                  }
                </p>
                {subscription.cancel_at_period_end && (
                  <p className="text-sm text-orange-600">
                    Your subscription will be cancelled at the end of the current period.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Available Plans */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Available Plans</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  name: 'Starter',
                  price: 99,
                  interval: 'month',
                  features: ['1 Dealership', 'Basic SEO Analysis', 'Monthly Reports', 'Email Support'],
                  current: subscription.plan.name === 'Starter'
                },
                {
                  name: 'Professional',
                  price: 299,
                  interval: 'month',
                  features: ['Up to 5 Dealerships', 'Full Three-Pillar Analysis', 'Weekly Reports', 'AI Visibility Tracking', 'Priority Support'],
                  current: subscription.plan.name === 'Professional'
                },
                {
                  name: 'Enterprise',
                  price: 999,
                  interval: 'month',
                  features: ['Unlimited Dealerships', 'Advanced Analytics', 'Real-time Monitoring', 'Custom Integrations', 'Dedicated Support'],
                  current: subscription.plan.name === 'Enterprise'
                }
              ].map((plan) => (
                <Card key={plan.name} className={plan.current ? 'ring-2 ring-blue-500' : ''}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {plan.name}
                      {plan.current && <Badge>Current</Badge>}
                    </CardTitle>
                    <CardDescription>
                      ${plan.price}/{plan.interval}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-4">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <Check className="w-4 h-4 text-green-500 mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    {!plan.current && (
                      <Button 
                        onClick={() => handleUpgrade(`price_${plan.name.toLowerCase()}`)}
                        className="w-full"
                        disabled={subscription.plan.price > plan.price}
                      >
                        {subscription.plan.price > plan.price ? 'Downgrade' : 'Upgrade'}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Active Subscription</CardTitle>
            <CardDescription>
              Choose a plan to get started with DealershipAI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  name: 'Starter',
                  price: 99,
                  interval: 'month',
                  features: ['1 Dealership', 'Basic SEO Analysis', 'Monthly Reports', 'Email Support']
                },
                {
                  name: 'Professional',
                  price: 299,
                  interval: 'month',
                  features: ['Up to 5 Dealerships', 'Full Three-Pillar Analysis', 'Weekly Reports', 'AI Visibility Tracking', 'Priority Support']
                },
                {
                  name: 'Enterprise',
                  price: 999,
                  interval: 'month',
                  features: ['Unlimited Dealerships', 'Advanced Analytics', 'Real-time Monitoring', 'Custom Integrations', 'Dedicated Support']
                }
              ].map((plan) => (
                <Card key={plan.name}>
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>
                      ${plan.price}/{plan.interval}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-4">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <Check className="w-4 h-4 text-green-500 mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button 
                      onClick={() => handleUpgrade(`price_${plan.name.toLowerCase()}`)}
                      className="w-full"
                    >
                      Get Started
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
