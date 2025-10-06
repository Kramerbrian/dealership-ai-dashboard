#!/bin/bash

# Quick Start Script for Dealership Analytics API
# =================================================
# This script helps you get started with the API quickly

set -e

echo "🚀 Dealership Analytics API - Quick Start"
echo "=========================================="
echo ""

# Check Python version
echo "📋 Checking Python version..."
python_version=$(python3 --version 2>&1 | awk '{print $2}')
echo "✅ Python version: $python_version"
echo ""

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
    echo "✅ Virtual environment created"
else
    echo "✅ Virtual environment already exists"
fi
echo ""

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate
echo ""

# Install dependencies
echo "📥 Installing dependencies..."
pip install -q --upgrade pip
pip install -q -r requirements.txt
echo "✅ Dependencies installed"
echo ""

# Check for .env file
if [ ! -f ".env" ]; then
    echo "⚙️  Creating .env file from template..."
    cp .env.example .env
    
    # Generate a random JWT secret
    if command -v openssl &> /dev/null; then
        jwt_secret=$(openssl rand -base64 32)
        # Use sed to replace the JWT_SECRET in .env
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s|JWT_SECRET=.*|JWT_SECRET=$jwt_secret|" .env
        else
            # Linux
            sed -i "s|JWT_SECRET=.*|JWT_SECRET=$jwt_secret|" .env
        fi
        echo "✅ Generated secure JWT_SECRET"
    else
        echo "⚠️  Could not generate JWT_SECRET (openssl not found)"
        echo "   Please edit .env and set a secure JWT_SECRET"
    fi
else
    echo "✅ .env file already exists"
fi
echo ""

# Run tests (optional)
read -p "🧪 Run tests? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🧪 Running tests..."
    pytest api/tests/ -v --tb=short
    echo ""
fi

# Start the API
echo "🎯 Starting the API..."
echo ""
echo "📚 Documentation will be available at:"
echo "   - Swagger UI: http://localhost:8000/docs"
echo "   - ReDoc:      http://localhost:8000/redoc"
echo "   - Health:     http://localhost:8000/health"
echo ""
echo "🔐 To get a demo token, visit:"
echo "   POST http://localhost:8000/api/v1/auth/demo-token"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start uvicorn
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
