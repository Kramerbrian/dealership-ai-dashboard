#!/usr/bin/env tsx

/**
 * Upload Mapbox Style to Mapbox Studio
 * Uses Mapbox Styles API v1
 * https://docs.mapbox.com/api/maps/styles/
 */

import fs from 'fs';
import path from 'path';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_KEY;
const MAPBOX_USERNAME = 'briankramer';

if (!MAPBOX_TOKEN) {
  console.error('Error: NEXT_PUBLIC_MAPBOX_KEY environment variable not set');
  process.exit(1);
}

async function uploadStyle(stylePath: string, styleName: string) {
  // Read the style JSON
  const styleContent = fs.readFileSync(stylePath, 'utf-8');
  const style = JSON.parse(styleContent);

  // Generate a URL-safe style ID
  const styleId = styleName.toLowerCase().replace(/[^a-z0-9]/g, '-');

  console.log(`Uploading style: ${styleName}`);
  console.log(`Style ID: ${styleId}`);
  console.log(`Username: ${MAPBOX_USERNAME}`);

  // Upload to Mapbox Styles API
  const url = `https://api.mapbox.com/styles/v1/${MAPBOX_USERNAME}?access_token=${MAPBOX_TOKEN}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: styleName,
      ...style,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Upload failed:', error);
    throw new Error(`Failed to upload style: ${response.status}`);
  }

  const result = await response.json();
  console.log('\n✅ Style uploaded successfully!');
  console.log(`Style URL: mapbox://styles/${MAPBOX_USERNAME}/${result.id}`);
  console.log(`Style ID: ${result.id}`);
  console.log(`\nUpdate lib/config/mapbox-styles.ts with this URL:`);
  console.log(`light: 'mapbox://styles/${MAPBOX_USERNAME}/${result.id}',`);

  return result;
}

// Main execution
const stylePath = path.join(
  process.cwd(),
  'docs/mapbox-styles/dealershipai-inception-daydream-style.json'
);

const styleName = 'DealershipAI Inception Daydream';

uploadStyle(stylePath, styleName)
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  });
