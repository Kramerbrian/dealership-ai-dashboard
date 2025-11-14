#!/usr/bin/env ts-node

/**
 * Bundle Size Analysis
 * Compares current build size to previous build and detects regressions
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface BuildMetrics {
  timestamp: string;
  totalSize: number;
  jsSize: number;
  cssSize: number;
  imageSize: number;
  deltaPercent: number;
  previousSize: number;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const METRICS_FILE = path.join(DATA_DIR, 'build-metrics.json');
const BUILD_DIR = path.join(process.cwd(), '.next');

function getBuildSize(): { total: number; js: number; css: number; images: number } {
  try {
    if (!fs.existsSync(BUILD_DIR)) {
      console.warn('[analyze-bundle-size] Build directory not found. Run `npm run build` first.');
      return { total: 0, js: 0, css: 0, images: 0 };
    }

    let totalSize = 0;
    let jsSize = 0;
    let cssSize = 0;
    let imageSize = 0;

    function walkDir(dir: string): void {
      const files = fs.readdirSync(dir);
      files.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          walkDir(filePath);
        } else {
          const size = stat.size;
          totalSize += size;

          if (file.endsWith('.js')) jsSize += size;
          else if (file.endsWith('.css')) cssSize += size;
          else if (/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file)) imageSize += size;
        }
      });
    }

    walkDir(BUILD_DIR);

    return {
      total: totalSize,
      js: jsSize,
      css: cssSize,
      images: imageSize,
    };
  } catch (error) {
    console.error('[analyze-bundle-size] Failed to calculate build size:', error);
    return { total: 0, js: 0, css: 0, images: 0 };
  }
}

function loadPreviousMetrics(): BuildMetrics | null {
  try {
    if (!fs.existsSync(METRICS_FILE)) {
      return null;
    }
    const content = fs.readFileSync(METRICS_FILE, 'utf8');
    const metrics = JSON.parse(content);
    return Array.isArray(metrics) ? metrics[metrics.length - 1] : metrics;
  } catch (error) {
    console.warn('[analyze-bundle-size] Failed to load previous metrics:', error);
    return null;
  }
}

function calculateDelta(current: number, previous: number | null): number {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

function saveMetrics(metrics: BuildMetrics): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    // Load existing metrics array or create new
    let allMetrics: BuildMetrics[] = [];
    if (fs.existsSync(METRICS_FILE)) {
      try {
        const content = fs.readFileSync(METRICS_FILE, 'utf8');
        allMetrics = JSON.parse(content);
        if (!Array.isArray(allMetrics)) {
          allMetrics = [allMetrics];
        }
      } catch {
        allMetrics = [];
      }
    }

    // Keep only last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    allMetrics = allMetrics.filter((m) => new Date(m.timestamp) > thirtyDaysAgo);

    // Add new metrics
    allMetrics.push(metrics);

    fs.writeFileSync(METRICS_FILE, JSON.stringify(allMetrics, null, 2));
    console.log(`[analyze-bundle-size] ✅ Metrics saved to ${METRICS_FILE}`);
  } catch (error) {
    console.error('[analyze-bundle-size] Failed to save metrics:', error);
    process.exit(1);
  }
}

// Main execution
function main() {
  console.log('[analyze-bundle-size] 📦 Analyzing bundle size...');

  const previous = loadPreviousMetrics();
  const current = getBuildSize();

  if (current.total === 0) {
    console.warn('[analyze-bundle-size] ⚠️  No build found. Skipping analysis.');
    process.exit(0);
  }

  const deltaPercent = calculateDelta(current.total, previous?.total || null);

  const metrics: BuildMetrics = {
    timestamp: new Date().toISOString(),
    totalSize: current.total,
    jsSize: current.js,
    cssSize: current.css,
    imageSize: current.images,
    deltaPercent,
    previousSize: previous?.total || current.total,
  };

  saveMetrics(metrics);

  console.log(`[analyze-bundle-size] 📊 Build Metrics:`);
  console.log(`  - Total size: ${(current.total / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  - JS: ${(current.js / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  - CSS: ${(current.css / 1024).toFixed(2)} KB`);
  console.log(`  - Images: ${(current.images / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  - Delta: ${deltaPercent > 0 ? '+' : ''}${deltaPercent.toFixed(2)}%`);

  if (deltaPercent > 5) {
    console.warn(`[analyze-bundle-size] ⚠️  Bundle size increased by ${deltaPercent.toFixed(2)}% (threshold: 5%)`);
    process.exit(1);
  } else if (deltaPercent < -5) {
    console.log(`[analyze-bundle-size] ✅ Bundle size decreased by ${Math.abs(deltaPercent).toFixed(2)}%`);
  } else {
    console.log('[analyze-bundle-size] ✅ Bundle size within acceptable range');
  }
}

if (require.main === module) {
  main();
}

export { getBuildSize, calculateDelta, loadPreviousMetrics };

