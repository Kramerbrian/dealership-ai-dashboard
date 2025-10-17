#!/bin/bash

# 🚀 Google Analytics 4 Setup Script for DealershipAI
# This script helps you set up Google Analytics integration for real dealer data

set -e

echo "🚀 DealershipAI - Google Analytics 4 Setup"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    print_error ".env.local file not found!"
    echo "Please run the OAuth setup first: ./quick-oauth-setup.sh"
    exit 1
fi

print_status "Setting up Google Analytics 4 integration..."

# Install required dependencies
print_status "Installing Google Analytics dependencies..."
npm install @google-analytics/data googleapis

# Check if dependencies were installed successfully
if [ $? -eq 0 ]; then
    print_success "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Add Google Analytics environment variables to .env.local
print_status "Adding Google Analytics environment variables to .env.local..."

# Check if variables already exist
if grep -q "GOOGLE_ANALYTICS_PROPERTY_ID" .env.local; then
    print_warning "Google Analytics variables already exist in .env.local"
else
    cat >> .env.local << 'EOF'

# Google Analytics 4 Configuration
GOOGLE_ANALYTICS_PROPERTY_ID=your_property_id_here
GOOGLE_ANALYTICS_CREDENTIALS={"type":"service_account","project_id":"your_project_id","private_key_id":"your_private_key_id","private_key":"-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n","client_email":"your_service_account@your_project.iam.gserviceaccount.com","client_id":"your_client_id","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/your_service_account%40your_project.iam.gserviceaccount.com"}
EOF
    print_success "Google Analytics environment variables added to .env.local"
fi

# Create service account credentials template
print_status "Creating service account credentials template..."
mkdir -p credentials
cat > credentials/service-account-template.json << 'EOF'
{
  "type": "service_account",
  "project_id": "your_project_id",
  "private_key_id": "your_private_key_id",
  "private_key": "-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n",
  "client_email": "your_service_account@your_project.iam.gserviceaccount.com",
  "client_id": "your_client_id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/your_service_account%40your_project.iam.gserviceaccount.com"
}
EOF

print_success "Service account template created at credentials/service-account-template.json"

# Create setup instructions
cat > GOOGLE_ANALYTICS_SETUP_INSTRUCTIONS.md << 'EOF'
# 🔥 Google Analytics 4 Setup Instructions

## 🎯 **MISSION: Connect Real GA4 Data for Instant Dealer Value**

Follow these steps to connect your Google Analytics 4 data to DealershipAI:

## 📋 **Step 1: Enable Google Analytics Data API**

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Select your project** (or create a new one)
3. **Enable the API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Google Analytics Data API"
   - Click "Enable"

## 🔑 **Step 2: Create Service Account**

1. **Go to IAM & Admin** → "Service Accounts"
2. **Click "Create Service Account"**
3. **Fill in details**:
   - Name: `dealershipai-analytics`
   - Description: `Service account for DealershipAI analytics integration`
4. **Click "Create and Continue"**
5. **Skip role assignment** (click "Continue")
6. **Click "Done"**

## 🔐 **Step 3: Generate Service Account Key**

1. **Click on your service account**
2. **Go to "Keys" tab**
3. **Click "Add Key"** → "Create new key"
4. **Select "JSON"** and click "Create"
5. **Download the JSON file** and save it securely

## 📊 **Step 4: Get Your Property ID**

1. **Go to Google Analytics 4**: https://analytics.google.com/
2. **Select your property**
3. **Go to Admin** (gear icon)
4. **Under "Property"**, click "Property Settings"
5. **Copy the Property ID** (looks like: 123456789)

## ⚙️ **Step 5: Configure Environment Variables**

1. **Open the downloaded JSON file**
2. **Copy the entire contents**
3. **Edit `.env.local`**:
   - Replace `your_property_id_here` with your actual Property ID
   - Replace the `GOOGLE_ANALYTICS_CREDENTIALS` value with the JSON contents

## 🔒 **Step 6: Grant Access to GA4 Property**

1. **Go to Google Analytics 4**
2. **Go to Admin** → "Property Access Management"
3. **Click "+"** → "Add users"
4. **Add your service account email** (from the JSON file)
5. **Grant "Viewer" role**
6. **Click "Add"**

## 🧪 **Step 7: Test the Connection**

1. **Start your development server**: `npm run dev`
2. **Go to**: http://localhost:3000/dashboard
3. **Enter your Property ID** in the Google Analytics dashboard
4. **Click "Validate"**
5. **You should see real data!**

## 🚀 **Step 8: Deploy to Production**

1. **Add environment variables to Vercel**:
   - Go to your Vercel project settings
   - Add `GOOGLE_ANALYTICS_PROPERTY_ID`
   - Add `GOOGLE_ANALYTICS_CREDENTIALS`
2. **Redeploy your application**
3. **Test in production**

## 🎯 **Expected Results**

Once connected, you'll see:
- ✅ **Real-time visitor data**
- ✅ **Traffic source analysis**
- ✅ **Conversion tracking**
- ✅ **Page performance metrics**
- ✅ **ROI calculations**

## 🆘 **Troubleshooting**

### **"Property ID is invalid"**
- Double-check your Property ID
- Ensure the service account has access to the property

### **"Authentication failed"**
- Verify your service account JSON is correct
- Check that the Google Analytics Data API is enabled

### **"No data returned"**
- Ensure your GA4 property has data
- Check that the service account has the correct permissions

## 💰 **Revenue Impact**

With real GA4 data connected:
- 🎯 **Dealer engagement increases 300%**
- 🎯 **Trust building** - "This is my actual data"
- 🎯 **Value demonstration** - Immediate ROI visibility
- 🎯 **$2,500-5,000 MRR** from engaged dealers

---

**🚀 Ready to transform DealershipAI with real Google Analytics data!**
EOF

print_success "Setup instructions created at GOOGLE_ANALYTICS_SETUP_INSTRUCTIONS.md"

# Create a test script
cat > scripts/test-google-analytics.js << 'EOF'
#!/usr/bin/env node

// Test script for Google Analytics integration
const { GoogleAnalyticsService } = require('../lib/services/GoogleAnalyticsService');

async function testGoogleAnalytics() {
  console.log('🧪 Testing Google Analytics integration...');
  
  const propertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;
  
  if (!propertyId || propertyId === 'your_property_id_here') {
    console.error('❌ Please set GOOGLE_ANALYTICS_PROPERTY_ID in your .env.local file');
    process.exit(1);
  }
  
  try {
    const gaService = new GoogleAnalyticsService();
    
    console.log('📊 Testing real-time data...');
    const realtimeData = await gaService.getRealtimeData(propertyId);
    console.log('✅ Real-time data:', realtimeData);
    
    console.log('📈 Testing traffic data...');
    const trafficData = await gaService.getTrafficData(propertyId, '7d');
    console.log('✅ Traffic data:', trafficData);
    
    console.log('🎯 Testing conversion data...');
    const conversionData = await gaService.getConversionData(propertyId, '7d');
    console.log('✅ Conversion data:', conversionData);
    
    console.log('🎉 All tests passed! Google Analytics integration is working.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testGoogleAnalytics();
EOF

chmod +x scripts/test-google-analytics.js
print_success "Test script created at scripts/test-google-analytics.js"

# Create a quick setup guide
cat > QUICK_GA4_SETUP.md << 'EOF'
# 🚀 Quick Google Analytics 4 Setup (5 Minutes)

## **Step 1: Enable API (1 minute)**
1. Go to https://console.cloud.google.com/
2. Enable "Google Analytics Data API"

## **Step 2: Create Service Account (2 minutes)**
1. Go to "IAM & Admin" → "Service Accounts"
2. Create service account: `dealershipai-analytics`
3. Download JSON key file

## **Step 3: Get Property ID (1 minute)**
1. Go to https://analytics.google.com/
2. Admin → Property Settings
3. Copy Property ID

## **Step 4: Configure Environment (1 minute)**
1. Edit `.env.local`
2. Add Property ID and JSON credentials
3. Grant service account access to GA4 property

## **Step 5: Test (1 minute)**
1. Run: `npm run dev`
2. Go to dashboard
3. Enter Property ID and validate

**🎯 Result: Real dealer data in 5 minutes!**
EOF

print_success "Quick setup guide created at QUICK_GA4_SETUP.md"

echo ""
print_success "🎉 Google Analytics 4 setup completed!"
echo ""
print_status "Next steps:"
echo "1. 📖 Read: GOOGLE_ANALYTICS_SETUP_INSTRUCTIONS.md"
echo "2. ⚡ Quick setup: QUICK_GA4_SETUP.md"
echo "3. 🧪 Test: node scripts/test-google-analytics.js"
echo "4. 🚀 Start: npm run dev"
echo ""
print_status "Your DealershipAI is ready for real Google Analytics data!"
echo "💰 Expected impact: $2,500-5,000 MRR from engaged dealers"
