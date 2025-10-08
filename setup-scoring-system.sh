#!/bin/bash

echo "🚀 Setting up DealershipAI Scoring System..."
echo "=============================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local from template..."
    cp env-template.txt .env.local
    echo "⚠️  Please edit .env.local and add your API keys:"
    echo "   - OPENAI_API_KEY (required for AI visibility)"
    echo "   - ANTHROPIC_API_KEY (required for AI visibility)"
    echo "   - GOOGLE_PLACES_API_KEY (required for geo trust & UGC health)"
    echo ""
    echo "   Without these keys, the system will use mock data."
else
    echo "✅ .env.local already exists"
fi

# Create src directory if it doesn't exist
if [ ! -d "src" ]; then
    echo "📁 Creating src directory structure..."
    mkdir -p src/lib/scoring
    mkdir -p src/lib/utils
    mkdir -p api
    echo "✅ Directory structure created"
else
    echo "✅ src directory already exists"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env.local and add your API keys"
echo "2. Test individual modules:"
echo "   npm run test:sgp"
echo "   npm run test:zero-click"
echo "   npm run test:geo-trust"
echo "   npm run test:ugc-health"
echo "   npm run test:ai-visibility  # ⚠️  Costs ~$0.10"
echo ""
echo "3. Test full system:"
echo "   npm run test:full-scoring   # ⚠️  Costs ~$0.12"
echo ""
echo "4. Start development server:"
echo "   npm run dev"
echo ""
echo "5. Test API endpoint:"
echo "   curl 'http://localhost:3000/api/ai-scores?origin=example.com'"
echo ""
echo "📚 Read SCORING_SYSTEM_README.md for detailed documentation"
