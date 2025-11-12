#!/bin/bash

# Server Diagnostic Script
echo "🔍 Diagnosing Server Issues..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if server process is running
echo "1. Checking server process..."
if lsof -ti:3000 > /dev/null 2>&1; then
    PID=$(lsof -ti:3000)
    echo "✅ Server process running (PID: $PID)"
else
    echo "❌ No server process on port 3000"
    echo "💡 Start with: npm run dev"
    exit 1
fi

# Check server response
echo ""
echo "2. Checking server response..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>&1)
echo "Response code: $RESPONSE"

if [ "$RESPONSE" = "200" ]; then
    echo "✅ Server responding correctly"
elif [ "$RESPONSE" = "500" ]; then
    echo "⚠️  Server returning 500 error"
    echo "💡 Check server logs for errors"
    echo ""
    echo "3. Checking server logs..."
    echo "Look for errors in the terminal running 'npm run dev'"
elif [ "$RESPONSE" = "000" ]; then
    echo "❌ Server not responding"
    echo "💡 Server may have crashed"
else
    echo "⚠️  Unexpected response: $RESPONSE"
fi

# Check build
echo ""
echo "4. Checking build artifacts..."
if [ -d ".next" ]; then
    echo "✅ .next directory exists"
else
    echo "⚠️  .next directory missing"
    echo "💡 Run: npm run build"
fi

# Check environment
echo ""
echo "5. Checking environment variables..."
if [ -f ".env.local" ] || [ -f ".env" ]; then
    echo "✅ Environment file exists"
else
    echo "⚠️  No .env file found"
    echo "💡 Create .env.local with required variables"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Next Steps:"
echo "1. Check the terminal running 'npm run dev' for errors"
echo "2. Verify environment variables are set"
echo "3. Try restarting the server: pkill -f 'next dev' && npm run dev"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

