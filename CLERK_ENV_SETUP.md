# 🔐 Clerk Environment Variables Setup

## Required Environment Variables

Add these to your `.env.local` file (create it if it doesn't exist):

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## How to Get Your Clerk Keys

1. **Sign up/Login** at [clerk.com](https://clerk.com)
2. **Create a new application** (or use existing)
3. **Go to API Keys** section in Clerk Dashboard
4. **Copy the keys**:
   - **Publishable Key**: Starts with `pk_test_` or `pk_live_`
   - **Secret Key**: Starts with `sk_test_` or `sk_live_`

## File Location

Create or update `.env.local` in the project root:

```bash
# .env.local (in project root)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key_here
CLERK_SECRET_KEY=your_secret_key_here
```

## Additional Clerk Configuration

### For Multi-Domain Setup

If you're using `dealershipai.com` and `dash.dealershipai.com`:

1. **In Clerk Dashboard** → **Settings** → **Domains**:
   - Add `dealershipai.com` as primary
   - Add `dash.dealershipai.com` as additional domain

2. **In Clerk Dashboard** → **Settings** → **Redirect URLs**:
   ```
   https://dealershipai.com
   https://dealershipai.com/dashboard
   https://dealershipai.com/sign-in
   https://dealershipai.com/sign-up
   https://dash.dealershipai.com
   https://dash.dealershipai.com/dashboard
   https://dash.dealershipai.com/sign-in
   https://dash.dealershipai.com/sign-up
   http://localhost:3000
   http://localhost:3000/dashboard
   http://localhost:3000/sign-in
   http://localhost:3000/sign-up
   ```

## Verification

After adding the keys:

1. **Restart your dev server**:
   ```bash
   npm run dev
   ```

2. **Check for errors** in console:
   - Should see Clerk initialized
   - No "Clerk key missing" errors

3. **Test authentication**:
   - Visit `/sign-in` or `/sign-up`
   - Should see Clerk UI

## Security Notes

- ✅ `.env.local` is git-ignored (never commit secrets)
- ✅ Use `pk_test_` / `sk_test_` for development
- ✅ Use `pk_live_` / `sk_live_` for production
- ✅ Never expose secret keys in client-side code

## Troubleshooting

### "Clerk key missing" error?
- Check `.env.local` exists in project root
- Verify variable names are exactly as shown
- Restart dev server after adding keys

### "Invalid publishable key"?
- Verify key starts with `pk_test_` or `pk_live_`
- Check for extra spaces or quotes
- Ensure key is complete (not truncated)

### Sign-in not working?
- Check redirect URLs in Clerk Dashboard
- Verify domain matches your setup
- Check browser console for errors

