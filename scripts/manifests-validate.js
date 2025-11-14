#!/usr/bin/env node

/**
 * Manifest Validation Script
 *
 * Validates all manifests in /manifests/ directory:
 * - JSON syntax validation
 * - Required field checking
 * - Version consistency
 * - Scheduled task listing
 * - Health status reporting
 *
 * Usage:
 *   npm run manifests:validate
 *   node scripts/manifests-validate.js
 *   node scripts/manifests-validate.js --verbose
 */

const fs = require('fs');
const path = require('path');

const VERBOSE = process.argv.includes('--verbose');
const MANIFESTS_DIR = path.join(__dirname, '..', 'manifests');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

/**
 * Format output with color
 */
function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

/**
 * Validate JSON syntax and parse
 */
function loadManifest(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const manifest = JSON.parse(content);
    return { valid: true, manifest, error: null };
  } catch (error) {
    return { valid: false, manifest: null, error: error.message };
  }
}

/**
 * Validate master manifest structure
 */
function validateMasterManifest(manifest) {
  const required = [
    'manifestVersion',
    'project',
    'structure',
    'authentication',
    'deployment',
  ];

  const missing = required.filter((field) => !manifest[field]);

  if (missing.length > 0) {
    return {
      valid: false,
      errors: [`Missing required fields: ${missing.join(', ')}`],
    };
  }

  // Check for self-optimization block
  if (!manifest.selfOptimization) {
    return {
      valid: true,
      warnings: ['selfOptimization block not found (optional)'],
    };
  }

  return { valid: true, errors: [], warnings: [] };
}

/**
 * Validate roadmap manifest structure
 */
function validateRoadmapManifest(manifest) {
  const required = ['manifestVersion', 'project', 'roadmap', 'successMetrics'];

  const missing = required.filter((field) => !manifest[field]);

  if (missing.length > 0) {
    return {
      valid: false,
      errors: [`Missing required fields: ${missing.join(', ')}`],
    };
  }

  // Check for at least one quarter defined
  if (!manifest.roadmap || Object.keys(manifest.roadmap).length === 0) {
    return { valid: false, errors: ['No quarters defined in roadmap'] };
  }

  return { valid: true, errors: [], warnings: [] };
}

/**
 * Validate meta-intelligence manifest structure
 */
function validateMetaIntelligenceManifest(manifest) {
  const required = [
    'manifestVersion',
    'project',
    'systems',
    'automation',
    'observability',
  ];

  const missing = required.filter((field) => !manifest[field]);

  if (missing.length > 0) {
    return {
      valid: false,
      errors: [`Missing required fields: ${missing.join(', ')}`],
    };
  }

  return { valid: true, errors: [], warnings: [] };
}

/**
 * Extract scheduled tasks from manifest
 */
function extractScheduledTasks(manifest, manifestName) {
  const tasks = [];

  // Master manifest cron jobs
  if (manifest.deployment?.vercel?.crons) {
    manifest.deployment.vercel.crons.forEach((cron) => {
      tasks.push({
        path: cron.path,
        schedule: cron.schedule,
        source: manifestName,
      });
    });
  }

  // Self-optimization cron jobs
  if (manifest.selfOptimization?.automation?.cronJobs?.optimization) {
    manifest.selfOptimization.automation.cronJobs.optimization.forEach(
      (cron) => {
        tasks.push({
          name: cron.name,
          path: cron.path,
          schedule: cron.schedule,
          source: manifestName,
        });
      }
    );
  }

  // Meta-intelligence cron jobs
  if (manifest.automation?.vercelCrons) {
    manifest.automation.vercelCrons.forEach((cron) => {
      tasks.push({
        path: cron.path,
        schedule: cron.schedule,
        source: manifestName,
      });
    });
  }

  return tasks;
}

/**
 * Get current quarter from roadmap
 */
function getCurrentQuarter(manifest) {
  if (!manifest.roadmap) return null;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const quarter = Math.ceil(month / 3);

  const quarterKey = `Q${quarter}_${year}`;
  return manifest.roadmap[quarterKey] || null;
}

/**
 * Count active milestones in current quarter
 */
function countActiveMilestones(quarter) {
  if (!quarter || !quarter.milestones) return 0;
  return quarter.milestones.filter(
    (m) => m.status === 'in_progress' || m.status === 'completed'
  ).length;
}

/**
 * Main validation function
 */
function validateManifests() {
  console.log(colorize('\n🚀 DealershipAI Manifest Validation\n', 'cyan'));

  // Check if manifests directory exists
  if (!fs.existsSync(MANIFESTS_DIR)) {
    console.log(colorize('❌ Manifests directory not found:', 'red'), MANIFESTS_DIR);
    process.exit(1);
  }

  // Get all JSON files in manifests directory
  const files = fs
    .readdirSync(MANIFESTS_DIR)
    .filter((file) => file.endsWith('.json'));

  if (files.length === 0) {
    console.log(colorize('⚠️  No manifest files found in:', 'yellow'), MANIFESTS_DIR);
    process.exit(1);
  }

  let allValid = true;
  const results = [];
  const allTasks = [];

  // Validate each manifest
  for (const file of files) {
    const filePath = path.join(MANIFESTS_DIR, file);
    const { valid, manifest, error } = loadManifest(filePath);

    if (!valid) {
      console.log(colorize(`❌ ${file}`, 'red'));
      console.log(colorize(`   Syntax Error: ${error}`, 'red'));
      allValid = false;
      continue;
    }

    // Determine manifest type and validate structure
    let validation = { valid: true, errors: [], warnings: [] };

    if (file.includes('master')) {
      validation = validateMasterManifest(manifest);
    } else if (file.includes('roadmap')) {
      validation = validateRoadmapManifest(manifest);
    } else if (file.includes('meta-intelligence')) {
      validation = validateMetaIntelligenceManifest(manifest);
    }

    // Report validation results
    if (validation.valid) {
      console.log(colorize(`✅ ${file}`, 'green'));
      console.log(`   Version: ${manifest.manifestVersion}`);

      // Additional info based on manifest type
      if (file.includes('master')) {
        console.log(`   Status: Valid`);
        if (manifest.deployment?.vercel?.crons) {
          console.log(
            `   Cron Jobs: ${manifest.deployment.vercel.crons.length}`
          );
        }
      } else if (file.includes('roadmap')) {
        const quarter = getCurrentQuarter(manifest);
        if (quarter) {
          console.log(`   Current Quarter: ${quarter.theme || 'N/A'}`);
          console.log(`   Active Milestones: ${countActiveMilestones(quarter)}`);
        }
      } else if (file.includes('meta-intelligence')) {
        const systemCount = manifest.systems
          ? Object.keys(manifest.systems).length
          : 0;
        console.log(`   Active Systems: ${systemCount}`);
      }

      // Show warnings if any
      if (validation.warnings && validation.warnings.length > 0) {
        validation.warnings.forEach((warning) => {
          console.log(colorize(`   ⚠️  ${warning}`, 'yellow'));
        });
      }

      // Extract scheduled tasks
      const tasks = extractScheduledTasks(manifest, file);
      allTasks.push(...tasks);

      results.push({ file, valid: true });
    } else {
      console.log(colorize(`❌ ${file}`, 'red'));
      validation.errors.forEach((err) => {
        console.log(colorize(`   Error: ${err}`, 'red'));
      });
      allValid = false;
      results.push({ file, valid: false });
    }

    console.log('');
  }

  // Summary
  const validCount = results.filter((r) => r.valid).length;
  const totalCount = results.length;

  console.log(colorize('📊 Summary', 'cyan'));
  console.log(
    `   ${colorize(`${validCount}/${totalCount}`, validCount === totalCount ? 'green' : 'red')} manifests valid`
  );

  // List all scheduled tasks
  if (allTasks.length > 0 && VERBOSE) {
    console.log(colorize('\n📅 Scheduled Tasks', 'cyan'));
    allTasks.forEach((task) => {
      console.log(`   ${task.name || task.path}`);
      console.log(`   └─ Schedule: ${task.schedule}`);
      console.log(`   └─ Source: ${task.source}\n`);
    });
  } else if (allTasks.length > 0) {
    console.log(
      colorize(`\n📅 Found ${allTasks.length} scheduled tasks`, 'cyan')
    );
    console.log('   Run with --verbose to see details\n');
  }

  // Exit with appropriate code
  if (!allValid) {
    console.log(
      colorize(
        '❌ Validation failed. Please fix the errors above.\n',
        'red'
      )
    );
    process.exit(1);
  } else {
    console.log(
      colorize('✅ All manifests validated successfully!\n', 'green')
    );
    process.exit(0);
  }
}

// Run validation
try {
  validateManifests();
} catch (error) {
  console.error(colorize('❌ Fatal error:', 'red'), error.message);
  if (VERBOSE) {
    console.error(error.stack);
  }
  process.exit(1);
}
