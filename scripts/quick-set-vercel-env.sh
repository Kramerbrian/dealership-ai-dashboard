#!/bin/bash
# Quick script to set critical env vars in Vercel

# Supabase (from MCP)
vercel env add NEXT_PUBLIC_SUPABASE_URL production <<< "https://gzlgfghpkbqlhgfozjkb.supabase.co"
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6bGdmZ2hwa2JxbGhnZm96amtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzOTg1MDQsImV4cCI6MjA3MDk3NDUwNH0.0X_zVfNH9K5FBDcMl_O7yeXJYwuWvGLALwjIe5JRlqg"

echo "✅ Supabase variables set. Run the full script for Clerk keys."
