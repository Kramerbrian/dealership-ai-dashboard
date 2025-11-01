#!/bin/bash
echo "Clearing DNS cache on macOS..."
echo "You'll need to enter your password:"
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
echo "✅ DNS cache cleared!"
echo ""
echo "Now checking DNS with fresh queries..."
