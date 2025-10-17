#!/bin/bash

# DTRI-MAXIMUS 4.0 Deployment Script
# Deploys the complete DTRI-MAXIMUS Intelligence Command Center system

echo "🚀 Starting DTRI-MAXIMUS 4.0 Deployment"
echo "========================================"

# Step 1: Apply Database Migration
echo "📊 Step 1: Applying database migration..."
echo "Please copy the contents of DTRI-MAXIMUS-4.0-COMPLETE.sql"
echo "and paste it into your Supabase SQL Editor, then run it."
echo ""
echo "Press Enter when you've completed the database migration..."
read -r

# Step 2: Install Dependencies
echo "📦 Step 2: Installing dependencies..."
npm install

# Step 3: Run Tests
echo "🧪 Step 3: Running integration tests..."
node test-dtri-maximus-integration.js

# Step 4: Start Development Server
echo "🌐 Step 4: Starting development server..."
echo "Your DTRI-MAXIMUS Intelligence Command Center will be available at:"
echo "http://localhost:3000/dtri-maximus"
echo ""
echo "Press Ctrl+C to stop the server when you're done testing."
echo ""

# Start the development server
npm run dev
