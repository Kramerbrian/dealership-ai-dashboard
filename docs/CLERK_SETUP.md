# 🔐 Clerk Authentication & Waitlist Setup

## Step 1: Create Clerk Account

1. Go to [clerk.com](https://clerk.com) and sign up
2. Create a new application
3. Choose "Next.js" as your framework
4. Copy your API keys

## Step 2: Configure Environment Variables

Add to your `.env.local`:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

## Step 3: Configure Clerk Dashboard

### Authentication Settings
1. Go to **Authentication** → **Email, Phone, Username**
2. Enable **Email address** as primary identifier
3. Enable **Google** and **Microsoft** OAuth providers
4. Set **Redirect URLs**:
   - `http://localhost:3000` (development)
   - `https://your-domain.vercel.app` (production)

### Waitlist Configuration
1. Go to **User Management** → **Waitlist**
2. Enable **Waitlist mode**
3. Configure waitlist settings:
   - **Waitlist message**: "Join 500+ dealerships already winning with AI"
   - **Success message**: "You're on the list! We'll notify you when your dashboard is ready."
   - **Email template**: Customize with your branding

### Domain Configuration
1. Go to **Domains** → **Satellites**
2. Add your production domain:
   - `https://your-domain.vercel.app`
   - `https://www.your-domain.com` (if using custom domain)

## Step 4: Test Authentication

1. Run `npm run dev`
2. Visit `http://localhost:3000/waitlist`
3. Test the waitlist signup flow
4. Verify emails are being sent

## Step 5: Production Deployment

1. Update environment variables in Vercel
2. Add production domain to Clerk
3. Test production authentication flow

## Troubleshooting

### Common Issues:
- **"Invalid publishable key"**: Check your environment variables
- **"Domain not allowed"**: Add your domain to Clerk dashboard
- **"Redirect URL mismatch"**: Update redirect URLs in Clerk settings

### Support:
- [Clerk Documentation](https://clerk.com/docs)
- [Clerk Discord](https://discord.gg/clerk)
