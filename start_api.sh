#!/bin/bash

# Dealership Analytics API Startup Script
# =======================================

echo "🚀 Starting Dealership Analytics API with RBAC"
echo "=============================================="

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📋 Installing dependencies..."
pip install -r requirements.txt

# Set environment variables
export SECRET_KEY="dealership-ai-secret-key-change-in-production"
export ENVIRONMENT="development"

# Create logs directory
mkdir -p logs

echo ""
echo "🔐 Available test users:"
echo "  - admin/admin123 (Full access)"
echo "  - manager/manager123 (Management access)" 
echo "  - viewer/viewer123 (Read-only access)"
echo "  - premium/premium123 (Premium features)"
echo ""

# Start the server
echo "🌟 Starting API server..."
echo "📖 API Documentation: http://localhost:8000/docs"
echo "🔍 Health Check: http://localhost:8000/api/health"
echo ""

python api_server.py