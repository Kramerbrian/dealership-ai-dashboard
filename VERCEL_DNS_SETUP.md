# Configure DNS for dash.dealershipai.com in Vercel

Since Vercel is managing your nameservers, configure DNS in Vercel Dashboard:

## Steps:

1. **Go to Vercel Dashboard:**
   https://vercel.com/dashboard

2. **Select your project:** `dealership-ai-dashboard`

3. **Navigate to:** Settings → Domains

4. **Click on:** `dealershipai.com` (to manage DNS)

5. **Add DNS Record:**
   - Click "Add Record" or "DNS Records"
   - Type: **CNAME**
   - Name/Host: `dash`
   - Value/Target: `cname.vercel-dns.com`
   - TTL: `3600` (or default)
   - Click **Save**

6. **Wait 2-5 minutes** for DNS to update

7. **Then add the domain:**
   ```bash
   npx vercel domains add dash.dealershipai.com
   ```

## Alternative: Use Vercel Dashboard UI

Instead of CLI, try adding via Dashboard:
- Go to: Settings → Domains
- Click "Add Domain"
- Enter: `dash.dealershipai.com`
- Follow verification steps

