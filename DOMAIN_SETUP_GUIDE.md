# 🌐 Domain Setup for dash.dealershipai.com

## **Step 1: Configure DNS Records**

### **Option A: CNAME Record (Recommended)**
Add this DNS record to your domain provider:

```
Type: CNAME
Name: dash
Value: cname.vercel-dns.com
TTL: 300 (or default)
```

### **Option B: A Record**
If CNAME doesn't work, use A record:

```
Type: A
Name: dash
Value: 76.76.19.61
TTL: 300 (or default)
```

## **Step 2: Add Domain in Vercel**

1. Go to: https://vercel.com/brian-kramers-projects/dealership-ai-dashboard/settings/domains
2. Click "Add Domain"
3. Enter: `dash.dealershipai.com`
4. Click "Add"
5. Wait for DNS propagation (5-10 minutes)

## **Step 3: Verify Domain**

After DNS propagation:
1. Visit: https://dash.dealershipai.com
2. Should show DealershipAI dashboard
3. Check SSL certificate is active

## **Step 4: Update Environment Variables**

Make sure these are set in Vercel:
```
NEXT_PUBLIC_APP_URL=https://dash.dealershipai.com
NEXTAUTH_URL=https://dash.dealershipai.com
```

## **Troubleshooting**

### **Domain Not Working?**
1. Check DNS propagation: https://dnschecker.org/
2. Verify CNAME record points to `cname.vercel-dns.com`
3. Wait 10-15 minutes for propagation
4. Check Vercel domain status

### **SSL Issues?**
1. Vercel automatically provides SSL
2. Wait 5-10 minutes after adding domain
3. Check certificate in browser

### **Still Not Working?**
1. Try A record instead of CNAME
2. Check domain provider settings
3. Contact Vercel support
