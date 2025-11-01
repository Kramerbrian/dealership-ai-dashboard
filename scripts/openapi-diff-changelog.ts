#!/usr/bin/env ts-node

/**
 * OpenAPI Diff Changelog Generator
 *
 * Automatically detects changes between OpenAPI versions and updates
 * the x-schema-changelog section in openapi/pulse.yaml
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface OpenAPISpec {
  openapi: string;
  info: {
    version: string;
    'x-schema-changelog'?: ChangelogEntry[];
  };
  paths?: Record<string, any>;
  components?: {
    schemas?: Record<string, any>;
  };
}

interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
}

const OPENAPI_FILE = path.join(__dirname, '../openapi/pulse.yaml');

function loadYaml(content: string): OpenAPISpec {
  // Simple YAML parser for our purposes
  // In production, use js-yaml library
  try {
    const yaml = require('js-yaml');
    return yaml.load(content) as OpenAPISpec;
  } catch {
    console.error('js-yaml not available, using simple parser');
    return JSON.parse(content); // Fallback
  }
}

function saveYaml(spec: OpenAPISpec): string {
  try {
    const yaml = require('js-yaml');
    return yaml.dump(spec, { lineWidth: -1, noRefs: true });
  } catch {
    return JSON.stringify(spec, null, 2);
  }
}

function getCurrentSpec(): OpenAPISpec {
  const content = fs.readFileSync(OPENAPI_FILE, 'utf-8');
  return loadYaml(content);
}

function getPreviousSpec(): OpenAPISpec | null {
  try {
    // Get the previous version from git
    const previousContent = execSync(
      `git show HEAD~1:${path.relative(process.cwd(), OPENAPI_FILE)}`,
      { encoding: 'utf-8' }
    );
    return loadYaml(previousContent);
  } catch (error) {
    console.log('No previous version found in git history');
    return null;
  }
}

function detectChanges(current: OpenAPISpec, previous: OpenAPISpec | null): string[] {
  const changes: string[] = [];

  if (!previous) {
    changes.push('Initial OpenAPI specification');
    return changes;
  }

  // Check for new/removed paths
  const currentPaths = Object.keys(current.paths || {});
  const previousPaths = Object.keys(previous.paths || {});

  const newPaths = currentPaths.filter(p => !previousPaths.includes(p));
  const removedPaths = previousPaths.filter(p => !currentPaths.includes(p));

  newPaths.forEach(path => {
    changes.push(`Added endpoint: ${path}`);
  });

  removedPaths.forEach(path => {
    changes.push(`Removed endpoint: ${path}`);
  });

  // Check for new/removed schemas
  const currentSchemas = Object.keys(current.components?.schemas || {});
  const previousSchemas = Object.keys(previous.components?.schemas || {});

  const newSchemas = currentSchemas.filter(s => !previousSchemas.includes(s));
  const removedSchemas = previousSchemas.filter(s => !currentSchemas.includes(s));

  newSchemas.forEach(schema => {
    changes.push(`Added schema: ${schema}`);
  });

  removedSchemas.forEach(schema => {
    changes.push(`Removed schema: ${schema}`);
  });

  // Check for modified schemas (property additions)
  currentSchemas.forEach(schemaName => {
    if (!previousSchemas.includes(schemaName)) return;

    const currentSchema = current.components?.schemas?.[schemaName];
    const previousSchema = previous.components?.schemas?.[schemaName];

    const currentProps = Object.keys(currentSchema?.properties || {});
    const previousProps = Object.keys(previousSchema?.properties || {});

    const newProps = currentProps.filter(p => !previousProps.includes(p));
    const removedProps = previousProps.filter(p => !currentProps.includes(p));

    newProps.forEach(prop => {
      changes.push(`Added property '${prop}' to ${schemaName}`);
    });

    removedProps.forEach(prop => {
      changes.push(`Removed property '${prop}' from ${schemaName}`);
    });
  });

  return changes;
}

function updateChangelog(spec: OpenAPISpec, changes: string[]): OpenAPISpec {
  if (changes.length === 0) {
    console.log('No changes detected');
    return spec;
  }

  const newEntry: ChangelogEntry = {
    version: spec.info.version,
    date: new Date().toISOString().split('T')[0],
    changes
  };

  // Initialize changelog if it doesn't exist
  if (!spec.info['x-schema-changelog']) {
    spec.info['x-schema-changelog'] = [];
  }

  // Check if this version already has a changelog entry
  const existingIndex = spec.info['x-schema-changelog'].findIndex(
    entry => entry.version === spec.info.version
  );

  if (existingIndex >= 0) {
    // Update existing entry
    spec.info['x-schema-changelog'][existingIndex] = newEntry;
  } else {
    // Add new entry at the beginning
    spec.info['x-schema-changelog'].unshift(newEntry);
  }

  return spec;
}

function main() {
  console.log('🔍 Detecting OpenAPI changes...\n');

  const currentSpec = getCurrentSpec();
  const previousSpec = getPreviousSpec();

  const changes = detectChanges(currentSpec, previousSpec);

  if (changes.length === 0) {
    console.log('✅ No changes detected');
    process.exit(0);
  }

  console.log('📝 Changes detected:');
  changes.forEach(change => console.log(`  - ${change}`));
  console.log();

  const updatedSpec = updateChangelog(currentSpec, changes);
  const yamlContent = saveYaml(updatedSpec);

  fs.writeFileSync(OPENAPI_FILE, yamlContent, 'utf-8');

  console.log('✅ Changelog updated successfully');
  console.log(`📦 Version: ${updatedSpec.info.version}`);
  console.log(`📅 Date: ${new Date().toISOString().split('T')[0]}`);
}

if (require.main === module) {
  main();
}

export { detectChanges, updateChangelog };
