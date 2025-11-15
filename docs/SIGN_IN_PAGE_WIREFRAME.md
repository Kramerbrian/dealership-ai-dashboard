# Sign-In Page Wireframe & Specification

**URL**: `https://dash.dealershipai.com/sign-in`  
**Status**: ⚠️ Currently showing "Loading..." (needs fix)

---

## 🎨 Expected Design (Wireframe)

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│              [Dark Gradient Background]                │
│         (from-gray-950 via-gray-900 to-gray-950)        │
│                                                         │
│                    ┌─────────────────┐                  │
│                    │                 │                  │
│                    │  Sign-In Card   │                  │
│                    │  (Clerk UI)     │                  │
│                    │                 │                  │
│                    │  ┌───────────┐ │                  │
│                    │  │   Email   │ │                  │
│                    │  │   Input   │ │                  │
│                    │  └───────────┘ │                  │
│                    │                 │                  │
│                    │  ┌───────────┐ │                  │
│                    │  │ Password  │ │                  │
│                    │  │   Input   │ │                  │
│                    │  └───────────┘ │                  │
│                    │                 │                  │
│                    │  ┌───────────┐ │                  │
│                    │  │  Sign In  │ │                  │
│                    │  │  Button   │ │                  │
│                    │  └───────────┘ │                  │
│                    │                 │                  │
│                    │  ─────────────  │                  │
│                    │                 │                  │
│                    │  ┌───────────┐ │                  │
│                    │  │  Continue │ │                  │
│                    │  │  with     │ │                  │
│                    │  │  Google   │ │                  │
│                    │  └───────────┘ │                  │
│                    │                 │                  │
│                    │  Don't have an  │                  │
│                    │  account?      │                  │
│                    │  Sign up       │                  │
│                    │                 │                  │
│                    └─────────────────┘                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 Component Structure

### Layout
- **Container**: `min-h-screen flex items-center justify-center`
- **Background**: `bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950`
- **Padding**: `py-12 px-4 sm:px-6 lg:px-8`

### Header Section
- **Title**: "Sign in to DealershipAI"
  - Style: `text-3xl font-extrabold text-white`
- **Subtitle**: "Access your AI-powered dealership analytics dashboard"
  - Style: `text-sm text-gray-400`

### Clerk Sign-In Component
- **Component**: `<SignIn />` from `@clerk/nextjs`
- **Wrapper**: `<Suspense>` with fallback: "Loading..."
- **Appearance**:
  - Card: `bg-gray-800/80 backdrop-blur-xl shadow-2xl border border-purple-500/30`
  - Button: `bg-gradient-to-r from-purple-600 to-pink-600`
  - Input: `bg-gray-700/50 border-gray-600 text-white`
  - Links: `text-purple-400 hover:text-purple-300`

---

## 🎯 Current Implementation

**File**: `app/(auth)/sign-in/[[...sign-in]]/page.tsx`

```tsx
export default function Page() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-white">
            Sign in to DealershipAI
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Access your AI-powered dealership analytics dashboard
          </p>
        </div>
        <Suspense fallback={<div className="flex justify-center text-white">Loading...</div>}>
          <SignIn 
            appearance={{...}}
            redirectUrl={redirectUrl}
            afterSignInUrl={redirectUrl}
            signUpUrl={signUpUrl}
          />
        </Suspense>
      </div>
    </main>
  );
}
```

---

## ⚠️ Issue: Stuck on "Loading..."

**Problem**: The `<SignIn>` component is stuck in Suspense fallback, showing "Loading..." indefinitely.

**Root Causes**:
1. **ClerkProvider not initializing** - Clerk publishable key may not be available
2. **Client-side hydration issue** - ClerkProviderWrapper may not be rendering on client
3. **Environment variable missing** - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` not set in Vercel
4. **Domain mismatch** - Clerk domain configuration doesn't match `dash.dealershipai.com`

---

## 🔧 Fix Steps

### 1. Verify Environment Variables
```bash
# Check Vercel Dashboard
# Settings → Environment Variables
# Verify:
# - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY (set for Production)
# - CLERK_SECRET_KEY (set for Production)
```

### 2. Check ClerkProviderWrapper
**File**: `components/providers/ClerkProviderWrapper.tsx`

**Issue**: May not be initializing on `dash.dealershipai.com`

**Fix**: Ensure domain check includes production domain:
```tsx
const isDashboardDomain = 
  domain === 'dash.dealershipai.com' ||
  domain.includes('vercel.app') ||
  domain === 'localhost';
```

### 3. Verify Clerk Dashboard Configuration
1. Go to: https://dashboard.clerk.com
2. Select your application
3. Check **Allowed Origins**:
   - `https://dash.dealershipai.com`
   - `https://*.vercel.app` (for previews)
4. Check **Domain & Cookies**:
   - Cookie Domain: `.dealershipai.com` (for SSO)

### 4. Check Browser Console
Open DevTools (F12) and check for errors:
- `Clerk publishable key not found`
- `Clerk domain mismatch`
- Network errors

---

## ✅ Expected Behavior

### When Working Correctly:

1. **Page Loads**:
   - Dark gradient background appears
   - Header text appears: "Sign in to DealershipAI"
   - Subtitle appears: "Access your AI-powered dealership analytics dashboard"

2. **Clerk Component Renders** (within 1-2 seconds):
   - Sign-in card appears with glassmorphism effect
   - Email input field appears
   - Password input field appears
   - "Sign In" button appears
   - "Continue with Google" button appears (if configured)
   - "Don't have an account? Sign up" link appears

3. **User Interaction**:
   - Can type in email field
   - Can type in password field
   - Can click "Sign In" button
   - Can click "Continue with Google" button
   - Can click "Sign up" link

4. **After Sign-In**:
   - Redirects to `/onboarding` (or redirect_url if provided)
   - No errors in console

---

## 🎨 Visual Design Specifications

### Colors
- **Background**: Dark gradient (`from-gray-950 via-gray-900 to-gray-950`)
- **Card Background**: `bg-gray-800/80` with `backdrop-blur-xl`
- **Card Border**: `border-purple-500/30`
- **Text Primary**: `text-white`
- **Text Secondary**: `text-gray-400`
- **Button**: `bg-gradient-to-r from-purple-600 to-pink-600`
- **Input**: `bg-gray-700/50 border-gray-600 text-white`
- **Links**: `text-purple-400 hover:text-purple-300`

### Typography
- **Title**: `text-3xl font-extrabold`
- **Subtitle**: `text-sm`
- **Body**: Default system font

### Spacing
- **Container Padding**: `py-12 px-4 sm:px-6 lg:px-8`
- **Card Max Width**: `max-w-md`
- **Card Spacing**: `space-y-8`

### Effects
- **Card Shadow**: `shadow-2xl`
- **Backdrop Blur**: `backdrop-blur-xl`
- **Border**: `border border-purple-500/30`

---

## 📱 Responsive Design

### Mobile (< 640px)
- Full width with padding
- Card takes full width minus padding
- Text scales appropriately

### Tablet (640px - 1024px)
- Card centered, max-width maintained
- Padding adjusted

### Desktop (> 1024px)
- Card centered
- Max width: `max-w-md` (448px)

---

## 🔍 Debugging Checklist

- [ ] Check browser console for errors
- [ ] Verify `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set in Vercel
- [ ] Verify `CLERK_SECRET_KEY` is set in Vercel
- [ ] Check Clerk Dashboard for allowed origins
- [ ] Verify ClerkProviderWrapper is rendering
- [ ] Check network tab for Clerk API calls
- [ ] Verify domain matches Clerk configuration
- [ ] Check if Suspense is timing out

---

## 📄 Related Files

- `app/(auth)/sign-in/[[...sign-in]]/page.tsx` - Sign-in page component
- `components/providers/ClerkProviderWrapper.tsx` - Clerk provider wrapper
- `app/layout.tsx` - Root layout with ClerkProviderWrapper
- `middleware.ts` - Auth middleware

---

**Status**: ⚠️ Needs fix - Currently stuck on "Loading..."  
**Priority**: 🔴 Critical - Blocks all authentication

