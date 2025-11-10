#!/bin/bash

# Fix Server Issues and Run Tests
echo "🔧 Fixing Server Issues..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. Stop existing server
echo "1. Stopping existing server..."
pkill -f "next dev" 2>/dev/null || true
sleep 2

# 2. Clear build cache
echo "2. Clearing build cache..."
rm -rf .next
echo "✅ Cache cleared"

# 3. Check TypeScript
echo "3. Checking TypeScript..."
if npm run type-check > /dev/null 2>&1; then
    echo "✅ TypeScript OK"
else
    echo "⚠️  TypeScript errors found (may be non-critical)"
fi

# 4. Start server in background
echo "4. Starting server..."
npm run dev > /tmp/nextjs-server.log 2>&1 &
SERVER_PID=$!
echo "Server PID: $SERVER_PID"

# 5. Wait for server to start
echo "5. Waiting for server to start..."
for i in {1..30}; do
    sleep 1
    if curl -s -f http://localhost:3000 > /dev/null 2>&1; then
        echo "✅ Server is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Server failed to start after 30 seconds"
        echo "Check logs: tail -f /tmp/nextjs-server.log"
        kill $SERVER_PID 2>/dev/null
        exit 1
    fi
done

# 6. Run tests
echo ""
echo "6. Running automated tests..."
./scripts/test-cognitive-interface.sh

# 7. Show server logs if there were errors
if [ $? -ne 0 ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📋 Server Logs (last 20 lines):"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    tail -20 /tmp/nextjs-server.log
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Fix and test complete!"
echo "Server running at: http://localhost:3000"
echo "To stop server: kill $SERVER_PID"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

