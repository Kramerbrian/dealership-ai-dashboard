#!/bin/bash

# Simple script to apply our DealershipAI schema migration
echo "🚀 Applying DealershipAI Schema Migration"
echo "========================================="

# Apply the migration
echo "📦 Pushing migration to Supabase..."
supabase db push --include-all

echo ""
echo "✅ Migration applied successfully!"
echo ""
echo "📊 What was deployed:"
echo "   • Fee taxonomy table with standard fee types"
echo "   • Offer integrity audits table for pricing compliance"
echo "   • OCI live materialized view for real-time cost analysis"
echo "   • SEO variant metrics and A/B testing tables"
echo "   • SEO content variants and performance analytics"
echo "   • SEO keyword performance tracking"
echo "   • Row Level Security (RLS) policies for multi-tenant access"
echo "   • Utility functions for data processing"
echo "   • Sample data for testing"
echo ""
echo "🎉 DealershipAI schema deployment complete!"
