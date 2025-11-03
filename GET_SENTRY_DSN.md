# 🔍 How to Get SENTRY_DSN from Sentry Dashboard

## Step-by-Step Instructions

### Step 1: Access Sentry Dashboard

1. Go to: **https://sentry.io/organizations/dealershipai/projects/javascript-nextjs/settings/keys/**
2. Or navigate manually:
   - Login to https://sentry.io
   - Select organization: **dealershipai**
   - Select project: **javascript-nextjs**
   - Go to: **Settings → Client Keys (DSN)**

---

### Step 2: Find the DSN

On the "Client Keys (DSN)" page, you'll see:

#### Option A: If you see multiple keys
Look for the key labeled:
- **"DSN"** or **"Default DSN"**
- **"Public DSN"** (this is usually the same as NEXT_PUBLIC_SENTRY_DSN)
- **"Server-side DSN"** (this is what you need for SENTRY_DSN)

#### Option B: If you only see one DSN
The DSN shown is typically the same for both client and server. Copy this value.

**DSN Format:**
```
https://[KEY]@o[ORG_ID].ingest.us.sentry.io/[PROJECT_ID]
```

---

### Step 3: Copy the DSN

1. Click the **copy icon** (📋) next to the DSN
2. Or select and copy the entire DSN string
3. It should look similar to:
   ```
   https://6917c43cd0ee4d8c5c79c9a7a3ebc806@o4510049793605632.ingest.us.sentry.io/4510298696515584
   ```

---

### Step 4: Verify It's Different (or Same) as NEXT_PUBLIC_SENTRY_DSN

**Current NEXT_PUBLIC_SENTRY_DSN:**
```
https://6917c43cd0ee4d8c5c79c9a7a3ebc806@o4510049793605632.ingest.us.sentry.io/4510298696515584
```

**What to look for:**
- ✅ **Same DSN?** That's fine! Use the same value for `SENTRY_DSN`
- ✅ **Different DSN?** Use the server-side one for `SENTRY_DSN`
- ⚠️ **Key difference:** Sometimes server DSN has different permissions/scopes

---

### Step 5: Add to Vercel

1. Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**
2. Click **"Add New"**
3. **Key:** `SENTRY_DSN`
4. **Value:** Paste the DSN you copied from Sentry
5. **Environments:** ✅ Production, ✅ Preview, ✅ Development
6. Click **"Save"**

---

## Quick Check: Is Your Current DSN Correct?

Based on your `NEXT_PUBLIC_SENTRY_DSN`:
```
https://6917c43cd0ee4d8c5c79c9a7a3ebc806@o4510049793605632.ingest.us.sentry.io/4510298696515584
```

**In most cases, you can use the SAME value for `SENTRY_DSN`:**

```
SENTRY_DSN=https://6917c43cd0ee4d8c5c79c9a7a3ebc806@o4510049793605632.ingest.us.sentry.io/4510298696515584
```

**However, it's best to verify in Sentry dashboard because:**
- Some projects have separate server/client DSNs
- Some have different security scopes
- You might have multiple keys configured

---

## Alternative: Use Sentry API to Get DSN

If you have Sentry API access, you can also retrieve it programmatically:

```bash
# Requires SENTRY_AUTH_TOKEN
curl -H "Authorization: Bearer YOUR_SENTRY_AUTH_TOKEN" \
  https://sentry.io/api/0/projects/dealershipai/javascript-nextjs/keys/
```

---

## Troubleshooting

### Can't find the DSN page?
1. Make sure you're logged in as an admin/owner
2. Check that you have access to the `dealershipai` organization
3. Verify project name is `javascript-nextjs`

### DSN not working?
- Make sure you copied the **entire** DSN string
- Check for trailing spaces or line breaks
- Verify the DSN hasn't been revoked/regenerated

### Multiple DSNs shown?
- Use the **default** or **server-side** DSN for `SENTRY_DSN`
- Use the **public** DSN for `NEXT_PUBLIC_SENTRY_DSN` (already set)

---

## Quick Copy-Paste for Vercel

Once you have the DSN from Sentry, add it as:

**Key:** `SENTRY_DSN`  
**Value:** `[PASTE_DSN_HERE]`  
**Environments:** Production, Preview, Development

---

**📝 Note:** In many Sentry setups, the client and server DSNs are the same. If you only see one DSN in the Sentry dashboard, use that same value for both `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN`.

