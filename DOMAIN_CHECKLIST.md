# ✅ Domain Transfer Checklist

## Progress Tracker

---

## Step 1: Remove Domains from OLD Project ⏳

**Go to**: https://vercel.com/brian-kramers-projects/dealershipai-dashboard/settings/domains

- [ ] Remove `main.dealershipai.com`
  - Click ••• → Remove Domain

- [ ] Remove `marketing.dealershipai.com`
  - Click ••• → Remove Domain

- [ ] Remove `dash.dealershipai.com`
  - Click ••• → Remove Domain

---

## Step 2: Add Domains to NEW Project ⏳

**Go to**: https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings/domains

- [ ] Add `main.dealershipai.com`
  - Click "Add Domain" → Enter domain → Click Add

- [ ] Add `marketing.dealershipai.com`
  - Click "Add Domain" → Enter domain → Click Add

- [ ] Add `dash.dealershipai.com`
  - Click "Add Domain" → Enter domain → Click Add

---

## Step 3: Wait for SSL Certificates ⏳

Expected time: 5-15 minutes

- [ ] Wait for Vercel to verify domains
- [ ] SSL certificates provisioning
- [ ] Check status in Vercel dashboard

---

## Step 4: Verify & Test ⏳

### Run Verification Script
```bash
./verify-domains.sh
```

### Manual Testing
- [ ] Test `https://main.dealershipai.com`
  - [ ] Page loads
  - [ ] SSL certificate valid (green padlock)
  - [ ] No errors in browser console

- [ ] Test `https://marketing.dealershipai.com`
  - [ ] Page loads
  - [ ] SSL certificate valid
  - [ ] Content displays correctly

- [ ] Test `https://dash.dealershipai.com/dash`
  - [ ] Dashboard loads
  - [ ] SSL certificate valid
  - [ ] All metrics display
  - [ ] Tab navigation works
  - [ ] Modals open/close
  - [ ] Deploy buttons trigger alerts

### Dashboard Feature Testing
- [ ] Click SEO card → Modal opens
- [ ] Click AEO card → EEAT modal with Authority data
- [ ] Click GEO card → EEAT modal with Experience data
- [ ] Switch to AI Health tab → Content changes
- [ ] Switch to Website tab → Performance metrics show
- [ ] Switch to Schema tab → Schema manager displays
- [ ] Switch to Reviews tab → Review center displays
- [ ] Switch to Settings tab → Settings page shows
- [ ] Modal close button (×) works
- [ ] All deploy/action buttons work

---

## Commands Reference

### Check Domain Status
```bash
vercel domains ls
```

### Test DNS Resolution
```bash
dig main.dealershipai.com
dig marketing.dealershipai.com
dig dash.dealershipai.com
```

### Test HTTPS
```bash
curl -I https://main.dealershipai.com
curl -I https://marketing.dealershipai.com
curl -I https://dash.dealershipai.com/dash
```

### Run Full Verification
```bash
./verify-domains.sh
```

---

## Success Criteria

All checkboxes above should be checked (✓) for complete success!

**Time Estimate**: 15-20 minutes total
**Downtime**: None (seamless transfer)

---

**Status**: In Progress ⏳
**Started**: $(date)
**Next**: Complete Step 1 (Remove domains from old project)
