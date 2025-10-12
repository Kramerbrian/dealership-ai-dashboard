// Placeholder Stripe billing utility
export const stripeBilling = {
  createPortalSession: () => Promise.resolve({ url: 'https://billing.stripe.com' }),
  createCheckoutSession: () => Promise.resolve({ url: 'https://checkout.stripe.com' })
};
