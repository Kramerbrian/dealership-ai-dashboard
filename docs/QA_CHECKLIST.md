# QA Checklist - DealershipAI 2026

## ✅ **Core Functionality**

### **GA4 Tracking**
- [ ] GA snippet fires `gtag('config', 'G-...')` on page load
- [ ] CTA clicks emit GA events (`cta_click`)
- [ ] Modal opens emit GA events (`modal_open`)
- [ ] Form submissions emit GA events (`form_submit`)
- [ ] Share actions emit GA events (`share`)
- [ ] Error events are tracked (`exception`)

### **Newsletter Integration**
- [ ] Newsletter POST returns 200 in network tab
- [ ] Valid email addresses are accepted
- [ ] Invalid email addresses show error
- [ ] Success message displays after subscription
- [ ] HubSpot form submission works correctly

### **Shareable Reports**
- [ ] `/r/:id` renders after "Share public report" click
- [ ] Report data displays correctly
- [ ] Expired reports show 404
- [ ] Invalid report IDs show 404
- [ ] Share URL is copied to clipboard
- [ ] Report expires after 30 days

### **Onboarding Emails**
- [ ] User registration triggers onboarding webhook
- [ ] Automation service receives correct payload
- [ ] Email sequence starts after signup

## 🎨 **UI/UX Validation**

### **Apple Park Styling**
- [ ] All KPIs use `font-mono tabular-nums`
- [ ] Primary panels use `bg-white/80 backdrop-blur ring-1 ring-gray-900/5`
- [ ] Smooth transitions (200ms duration)
- [ ] Consistent border radius (8px, 12px, 16px, 24px)
- [ ] Proper spacing and typography hierarchy

### **Responsive Design**
- [ ] Mobile-first design works on all screen sizes
- [ ] Touch targets are at least 44px
- [ ] Text remains readable on small screens
- [ ] Navigation works on mobile devices

### **Accessibility**
- [ ] All interactive elements have focus states
- [ ] Color contrast meets WCAG AA standards
- [ ] Screen reader compatibility
- [ ] Keyboard navigation works throughout
- [ ] Alt text for all images

## 🔧 **Technical Validation**

### **Performance**
- [ ] Page load times under 3 seconds
- [ ] Images are optimized (next/image)
- [ ] No console errors
- [ ] Proper error boundaries catch failures
- [ ] Loading states display during data fetch

### **Security**
- [ ] Environment variables are not exposed
- [ ] API routes validate all inputs
- [ ] CORS headers are properly set
- [ ] Rate limiting is implemented
- [ ] Authentication is required for protected routes

### **Data Flow**
- [ ] API responses are properly typed
- [ ] Error states are handled gracefully
- [ ] Loading states prevent multiple requests
- [ ] Data updates reflect in UI immediately
- [ ] Offline states are handled

## 📊 **Business Logic**

### **Scoring System**
- [ ] VAI calculation is accurate
- [ ] PIQR penalties are applied correctly
- [ ] HRP scores reflect actual risk
- [ ] QAI* composite score is correct
- [ ] Revenue at risk calculations are accurate

### **Feature Gating**
- [ ] Plan-based features are properly restricted
- [ ] Trial users see appropriate limitations
- [ ] Upgrade prompts appear at right times
- [ ] Feature flags work correctly

### **Notifications**
- [ ] Real-time notifications display correctly
- [ ] Notification types have proper styling
- [ ] Auto-dismiss works for timed notifications
- [ ] Manual dismiss works for persistent notifications

## 🚀 **Deployment Checklist**

### **Environment Setup**
- [ ] All environment variables are set
- [ ] Database connections work
- [ ] External API integrations are configured
- [ ] SSL certificates are valid
- [ ] Domain is properly configured

### **Monitoring**
- [ ] Error tracking is enabled (Sentry)
- [ ] Analytics are collecting data
- [ ] Performance monitoring is active
- [ ] Uptime monitoring is configured
- [ ] Log aggregation is working

### **Backup & Recovery**
- [ ] Database backups are scheduled
- [ ] File storage backups are configured
- [ ] Recovery procedures are documented
- [ ] Disaster recovery plan is tested

## 🧪 **Testing Scenarios**

### **User Journeys**
1. **New User Onboarding**
   - [ ] Landing page loads
   - [ ] Sign up form works
   - [ ] Email verification (if enabled)
   - [ ] Dashboard loads after login
   - [ ] Onboarding emails are sent

2. **Existing User Login**
   - [ ] Login form works
   - [ ] Dashboard loads with data
   - [ ] All features are accessible
   - [ ] Data is up-to-date

3. **Trial User Experience**
   - [ ] Trial limitations are clear
   - [ ] Upgrade prompts are appropriate
   - [ ] Blur gates work correctly
   - [ ] Conversion flow is smooth

### **Error Scenarios**
- [ ] Network failures are handled
- [ ] API timeouts show appropriate messages
- [ ] Invalid data doesn't break the UI
- [ ] Authentication failures redirect properly
- [ ] Rate limiting shows user-friendly messages

## 📈 **Analytics Validation**

### **Event Tracking**
- [ ] Page views are tracked
- [ ] User interactions are logged
- [ ] Conversion events fire correctly
- [ ] Custom events are properly formatted
- [ ] Attribution data is accurate

### **Performance Metrics**
- [ ] Core Web Vitals are within targets
- [ ] Bundle size is optimized
- [ ] API response times are acceptable
- [ ] Database queries are efficient
- [ ] Caching is working properly

---

## 🎯 **Success Criteria**

- [ ] All critical user journeys work end-to-end
- [ ] No critical bugs in production
- [ ] Performance meets or exceeds targets
- [ ] Analytics data is accurate and complete
- [ ] User feedback is positive
- [ ] Conversion rates meet business goals

## 📝 **Notes**

- Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- Test on multiple devices (Desktop, Tablet, Mobile)
- Test with different network conditions
- Test with different user roles and permissions
- Document any known issues or limitations
