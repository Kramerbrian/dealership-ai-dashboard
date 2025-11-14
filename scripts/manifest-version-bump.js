#!/usr/bin/env node

/**
 * Manifest Version Bump Script
 *
 * Automatically increments version numbers across all manifest files
 * and updates governance metadata.
 *
 * Usage:
 *   node scripts/manifest-version-bump.js
 *   node scripts/manifest-version-bump.js --dry-run
 */

const fs = require('fs');
const path = require('path');

const DRY_RUN = process.argv.includes('--dry-run');

// File paths
const MASTER_MANIFEST = path.join(__dirname, '..', 'dealershipai-master-manifest.json');
const ROADMAP_MANIFEST = path.join(__dirname, '..', 'dealershipai-roadmap-manifest.json');

/**
 * Generate version string in format: v2025.MM.DD
 */
function generateVersion() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `v${year}.${month}.${day}`;
}

/**
 * Update version in a manifest file
 */
function updateManifestVersion(filePath, newVersion) {
  try {
    // Read and parse manifest
    const content = fs.readFileSync(filePath, 'utf8');
    const manifest = JSON.parse(content);

    // Store old version
    const oldVersion = manifest.governance?.currentVersion || manifest.manifestVersion;

    // Update version fields
    const timestamp = new Date().toISOString();
    manifest.manifestVersion = timestamp.split('T')[0]; // YYYY-MM-DD format

    // Update governance section if it exists
    if (manifest.governance) {
      manifest.governance.currentVersion = newVersion;
      manifest.governance.lastUpdated = timestamp;
    }

    // Write back to file
    if (!DRY_RUN) {
      fs.writeFileSync(filePath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
    }

    return { oldVersion, newVersion, filePath: path.basename(filePath) };
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Update CHANGELOG.md with new version entry
 */
function updateChangelog(version) {
  const changelogPath = path.join(__dirname, '..', 'docs', 'CHANGELOG.md');
  const timestamp = new Date().toISOString().split('T')[0];

  const newEntry = `
## ${version} - ${timestamp}

### Changed
- Automated version bump
- Manifest metadata updated

---

`;

  try {
    let content = '';

    // Check if CHANGELOG exists
    if (fs.existsSync(changelogPath)) {
      content = fs.readFileSync(changelogPath, 'utf8');

      // Insert new entry after the title
      const lines = content.split('\n');
      const titleIndex = lines.findIndex(line => line.startsWith('# '));

      if (titleIndex !== -1) {
        lines.splice(titleIndex + 2, 0, newEntry);
        content = lines.join('\n');
      } else {
        content = newEntry + content;
      }
    } else {
      // Create new CHANGELOG
      content = `# DealershipAI Changelog

All notable changes to this project will be documented in this file.

${newEntry}`;
    }

    if (!DRY_RUN) {
      // Ensure docs directory exists
      const docsDir = path.dirname(changelogPath);
      if (!fs.existsSync(docsDir)) {
        fs.mkdirSync(docsDir, { recursive: true });
      }

      fs.writeFileSync(changelogPath, content, 'utf8');
    }

    return true;
  } catch (error) {
    console.error(`❌ Error updating CHANGELOG:`, error.message);
    return false;
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🚀 DealershipAI Manifest Version Bump\n');

  if (DRY_RUN) {
    console.log('🔍 DRY RUN MODE - No files will be modified\n');
  }

  // Generate new version
  const newVersion = generateVersion();
  console.log(`📦 New version: ${newVersion}\n`);

  // Update manifests
  const results = [];

  if (fs.existsSync(MASTER_MANIFEST)) {
    const result = updateManifestVersion(MASTER_MANIFEST, newVersion);
    if (result) results.push(result);
  }

  if (fs.existsSync(ROADMAP_MANIFEST)) {
    const result = updateManifestVersion(ROADMAP_MANIFEST, newVersion);
    if (result) results.push(result);
  }

  // Display results
  if (results.length > 0) {
    console.log('✅ Updated manifests:\n');
    results.forEach(({ filePath, oldVersion, newVersion }) => {
      console.log(`   ${filePath}`);
      console.log(`   └─ ${oldVersion || 'N/A'} → ${newVersion}\n`);
    });
  }

  // Update CHANGELOG
  if (updateChangelog(newVersion)) {
    console.log('✅ Updated CHANGELOG.md\n');
  }

  // Summary
  if (DRY_RUN) {
    console.log('💡 Run without --dry-run to apply changes');
  } else {
    console.log('🎉 Version bump complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Review changes: git diff');
    console.log(`   2. Commit: git commit -m "chore: bump version to ${newVersion}"`);
    console.log(`   3. Tag: git tag ${newVersion}`);
    console.log('   4. Push: git push origin main --tags');
  }
}

// Run script
try {
  main();
} catch (error) {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
}
