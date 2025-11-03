# Google Analytics Configuration

## DealershipAI Google Tag Setup

### Stream Details

- **Stream Name**: dealershipAI
- **Stream URL**: https://dealershipAI.com
- **Stream ID**: 12840986554
- **Measurement ID**: G-JYQ9MZLCQW

### Environment Variables

All variables are prefixed with `NEXT_PUBLIC_` to make them available in the browser:

```bash
# Google Analytics
NEXT_PUBLIC_GA_ID=G-JYQ9MZLCQW
NEXT_PUBLIC_GA_STREAM_NAME=dealershipAI
NEXT_PUBLIC_GA_STREAM_URL=https://dealershipAI.com
NEXT_PUBLIC_GA_STREAM_ID=12840986554

# Google Ads
NEXT_PUBLIC_GOOGLE_ADS_ID=469-565-3842
```

### Configuration Locations

#### ✅ Local Development (.env.local)
All variables are configured in `.env.local`

#### ✅ Vercel
All variables are configured in:
- Production environment
- Preview environment  
- Development environment

#### ℹ️ Supabase
**Note**: Supabase doesn't need these environment variables because:
- These are **Next.js frontend variables** (prefixed with `NEXT_PUBLIC_`)
- Supabase is the database backend and doesn't render the frontend
- Google Analytics runs in the browser, not on the server

If you need to store this for reference in Supabase, you could:
1. Store in a `settings` or `configuration` table
2. Or just keep in Vercel (which serves the frontend)

### Usage in Code

The Measurement ID is used in `app/layout.tsx`:

```tsx
const gaId = process.env.NEXT_PUBLIC_GA_ID || 'G-JYQ9MZLCQW';
```

### Testing

To verify Google Analytics is working:

1. **Check browser console**: No errors related to gtag
2. **Check Network tab**: Requests to `google-analytics.com/g/collect`
3. **Real-time reports**: Check Google Analytics dashboard for real-time activity
4. **GA Debugger**: Install Google Analytics Debugger Chrome extension

### Verification Checklist

- [x] Added to `.env.local`
- [x] Added to Vercel Production
- [x] Added to Vercel Preview
- [x] Added to Vercel Development
- [ ] Tested in production (verify events are tracking)
- [ ] Verified real-time reports show traffic

---

**Last Updated**: 2025-11-02  
**Measurement ID**: G-JYQ9MZLCQW

