#!/bin/bash
# Script to add Mapbox API token to Vercel environment variables

MAPBOX_TOKEN="sk.eyJ1IjoiYnJpYW5rcmFtZXIiLCJhIjoiY21od3FrZG5iMDJiazJqcGl1d2hsMmRxMiJ9.3QZNNSGOELcxATdDzFTuMQ"

echo "Adding Mapbox API token to Vercel..."

# Add to Production
echo "Adding to Production..."
echo "$MAPBOX_TOKEN" | vercel env add NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN production
echo "$MAPBOX_TOKEN" | vercel env add MAPBOX_ACCESS_TOKEN production

# Add to Preview
echo "Adding to Preview..."
echo "$MAPBOX_TOKEN" | vercel env add NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN preview
echo "$MAPBOX_TOKEN" | vercel env add MAPBOX_ACCESS_TOKEN preview

# Add to Development
echo "Adding to Development..."
echo "$MAPBOX_TOKEN" | vercel env add NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN development
echo "$MAPBOX_TOKEN" | vercel env add MAPBOX_ACCESS_TOKEN development

echo "✅ Mapbox tokens added to all Vercel environments"
echo ""
echo "Next: Redeploy with 'vercel --prod' to apply changes"

