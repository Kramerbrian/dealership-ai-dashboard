# DealershipAI Onboarding System

## Overview

The DealershipAI onboarding system provides a comprehensive, step-by-step process for new dealer clients to sign up and provide all necessary information for account setup.

## Features

### 🎯 **Multi-Step Onboarding Process**
- **Step 1: Business Information** - Basic dealership details
- **Step 2: Digital Presence** - Online presence and marketing data
- **Step 3: Goals & Preferences** - Business objectives and communication preferences
- **Step 4: Review & Complete** - Final review and account creation

### 📊 **Data Collection**
- **Business Details**: Name, contact info, address, years in business
- **Digital Assets**: Website, social media profiles, Google My Business
- **Marketing Data**: Current traffic, SEO agency, challenges
- **Goals & Preferences**: Business objectives, communication preferences

### 🔧 **Technical Features**
- **Responsive Design**: Mobile-first, works on all devices
- **Progress Tracking**: Visual progress bar and step indicators
- **Form Validation**: Real-time validation with error handling
- **API Integration**: RESTful API for data submission
- **Data Persistence**: In-memory storage with database-ready structure

## File Structure

```
dealership-ai-dashboard/
├── onboarding.dealershipai.com.html    # Main onboarding page
├── api/onboarding.js                   # Onboarding API endpoints
├── vercel.json                         # Vercel configuration
└── ONBOARDING_GUIDE.md                # This documentation
```

## API Endpoints

### POST `/api/onboarding/submit`
Submit onboarding data for a new dealership.

**Request Body:**
```json
{
  "dealershipName": "ABC Motors",
  "contactName": "John Smith",
  "email": "john@abcmotors.com",
  "phone": "+1-555-0123",
  "website": "https://abcmotors.com",
  "address": "123 Main St, City, State, ZIP",
  "yearsInBusiness": "5-10",
  "employeeCount": "11-25",
  "googleMyBusiness": "https://g.page/abcmotors",
  "facebook": "https://facebook.com/abcmotors",
  "instagram": "https://instagram.com/abcmotors",
  "yelp": "https://yelp.com/biz/abcmotors",
  "monthlyVisitors": "5000-10000",
  "seoAgency": "agency",
  "marketingChallenges": "Low website traffic and poor SEO rankings",
  "goals": ["increase-leads", "improve-seo"],
  "communication": ["email", "phone"],
  "additionalInfo": "Looking for comprehensive digital marketing solution",
  "terms": true,
  "marketing": true
}
```

**Response:**
```json
{
  "success": true,
  "onboardingId": "onboarding_1234567890_abc123def",
  "message": "Onboarding data submitted successfully",
  "nextSteps": [
    "Check your email for confirmation",
    "Our team will review your information",
    "You'll receive access to your dashboard within 24 hours"
  ]
}
```

### GET `/api/onboarding/status/:id`
Get the status of an onboarding submission.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "onboarding_1234567890_abc123def",
    "status": "pending_review",
    "dealershipName": "ABC Motors",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "nextSteps": [
      "Your information is being reviewed",
      "You'll receive an email with next steps",
      "Dashboard access will be provided within 24 hours"
    ]
  }
}
```

### GET `/api/onboarding/admin/all`
Get all onboarding records (admin only).

### PUT `/api/onboarding/admin/:id/status`
Update onboarding status (admin only).

### DELETE `/api/onboarding/admin/:id`
Delete onboarding record (admin only).

## Onboarding Steps

### Step 1: Business Information
- **Dealership Name** (required)
- **Contact Name** (required)
- **Email Address** (required)
- **Phone Number** (required)
- **Dealership Website** (required)
- **Physical Address** (required)
- **Years in Business** (required)
- **Number of Employees** (required)

### Step 2: Digital Presence
- **Google My Business Profile** (optional)
- **Facebook Page** (optional)
- **Instagram Profile** (optional)
- **Yelp Business Page** (optional)
- **Current Monthly Website Visitors** (optional)
- **Current SEO Agency/Team** (optional)
- **Current Marketing Challenges** (optional)

### Step 3: Goals & Preferences
- **Primary Business Goals** (required - at least one):
  - Increase lead generation
  - Improve search engine rankings
  - Enhance social media presence
  - Improve online reputation
  - Monitor competitors
- **Communication Preferences** (optional):
  - Email updates and reports
  - Phone calls for important updates
  - SMS alerts for urgent issues
- **Additional Information** (optional)

### Step 4: Review & Complete
- **Review all provided information**
- **Accept Terms of Service and Privacy Policy** (required)
- **Marketing communications opt-in** (optional)

## Data Storage

### Current Implementation
- **Storage**: In-memory Map for demo purposes
- **Persistence**: Data stored in `onboardingData` Map
- **Structure**: Each record has unique ID and timestamp

### Production Recommendations
- **Database**: PostgreSQL or MongoDB
- **User Management**: Integrate with Clerk or Auth0
- **Email Service**: SendGrid or AWS SES
- **CRM Integration**: Salesforce or HubSpot
- **Analytics**: Google Analytics or Mixpanel

## Status Flow

```
pending_review → approved → completed
     ↓
  rejected
```

- **pending_review**: Initial status after submission
- **approved**: Admin has reviewed and approved
- **completed**: Account created and dashboard access provided
- **rejected**: Submission rejected (with reason)

## Customization

### Styling
The onboarding page uses CSS custom properties for easy theming:
```css
:root {
  --primary-color: #007AFF;
  --secondary-color: #5856D6;
  --success-color: #34C759;
  --warning-color: #FF9500;
  --error-color: #FF3B30;
  /* ... more variables */
}
```

### Form Fields
Add new fields by:
1. Adding HTML input in the appropriate step
2. Updating the `saveCurrentStepData()` function
3. Modifying the API validation in `api/onboarding.js`

### Validation Rules
Update validation in the `validateCurrentStep()` function:
```javascript
function validateCurrentStep() {
  // Add custom validation logic here
  // Return true if valid, false if invalid
}
```

## Integration Points

### With Main Dashboard
- Onboarding data is stored in localStorage
- Dashboard can access user data via `localStorage.getItem('dealership_data')`
- Email address stored for subscription management

### With Admin Dashboard
- Admin can view all onboarding submissions
- Status management and approval workflow
- Data export capabilities

### With Stripe
- Onboarding ID can be linked to Stripe customer
- Subscription creation after approval
- Payment method collection

## Security Considerations

### Data Protection
- **Validation**: Server-side validation of all inputs
- **Sanitization**: HTML encoding for display
- **Rate Limiting**: Implement rate limiting for API endpoints
- **HTTPS**: All communications over HTTPS

### Privacy Compliance
- **GDPR**: Data collection consent and right to deletion
- **CCPA**: California privacy rights compliance
- **Data Retention**: Clear data retention policies
- **Audit Trail**: Log all data access and modifications

## Testing

### Manual Testing
1. **Form Validation**: Test all required fields
2. **Step Navigation**: Test forward/backward navigation
3. **API Integration**: Test data submission and retrieval
4. **Responsive Design**: Test on various screen sizes
5. **Error Handling**: Test network failures and validation errors

### Automated Testing
```bash
# Test onboarding API
curl -X POST http://localhost:3002/api/onboarding/submit \
  -H "Content-Type: application/json" \
  -d '{"dealershipName":"Test Dealer","contactName":"Test User","email":"test@example.com","phone":"555-0123","website":"https://test.com","address":"123 Test St","terms":true}'
```

## Deployment

### Vercel Configuration
The `vercel.json` file includes:
- **Routing**: Custom domain routing for onboarding page
- **Headers**: Security headers for all responses
- **Environment**: Production environment variables

### Environment Variables
```bash
# Required for production
NODE_ENV=production
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
DATABASE_URL=postgresql://...
EMAIL_SERVICE_API_KEY=...
```

## Monitoring & Analytics

### Key Metrics
- **Conversion Rate**: Onboarding completion rate
- **Drop-off Points**: Where users abandon the process
- **Time to Complete**: Average time to finish onboarding
- **Error Rates**: Form validation and API errors

### Logging
- **User Actions**: Step progression and form interactions
- **API Calls**: Request/response logging
- **Errors**: Detailed error logging with stack traces
- **Performance**: Response times and resource usage

## Future Enhancements

### Planned Features
- **Multi-language Support**: Internationalization
- **Progressive Web App**: Offline capability
- **Advanced Validation**: Real-time data verification
- **Integration Testing**: Automated end-to-end tests
- **Analytics Dashboard**: Onboarding metrics and insights

### Technical Improvements
- **Database Migration**: Move from in-memory to persistent storage
- **Caching**: Redis for improved performance
- **CDN**: Static asset delivery optimization
- **Microservices**: Split into separate services
- **Event Sourcing**: Audit trail and data history

## Support

For technical support or questions about the onboarding system:
- **Documentation**: This guide and inline code comments
- **API Reference**: Swagger/OpenAPI documentation
- **Issue Tracking**: GitHub issues for bug reports
- **Contact**: development@dealershipai.com
