const defaultBaseUrl =
  process.env.NODE_ENV === 'production'
    ? 'https://dealership-ai-dashboard.vercel.app/api'
    : process.env.NEXT_PUBLIC_API_DEV_URL || 'http://localhost:3000/api';

export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || defaultBaseUrl).replace(/\/$/, '');
