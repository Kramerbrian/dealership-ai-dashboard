#!/usr/bin/env node
/**
 * Read and parse the master deployment manifest
 * Used by CI/CD workflows and deployment scripts
 */

const fs = require('fs');
const path = require('path');

const MANIFEST_PATH = path.join(process.cwd(), 'manifests/dealershipai-deploy-master.json');

function readManifest() {
  try {
    if (!fs.existsSync(MANIFEST_PATH)) {
      throw new Error(`Manifest not found: ${MANIFEST_PATH}`);
    }
    const content = fs.readFileSync(MANIFEST_PATH, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Failed to read manifest: ${error.message}`);
    process.exit(1);
  }
}

function getDeployTargets(manifest) {
  return Object.keys(manifest.deployTargets || {});
}

function getWorkflowSequence(manifest) {
  return manifest.workflowSequence || [];
}

function getSuccessCriteria(manifest) {
  return manifest.successCriteria || {};
}

function getPostDeployChecks(manifest) {
  return manifest.postDeployChecks || [];
}

// CLI interface
if (require.main === module) {
  const manifest = readManifest();
  const command = process.argv[2];

  switch (command) {
    case 'targets':
      console.log(JSON.stringify(getDeployTargets(manifest), null, 2));
      break;
    case 'sequence':
      console.log(JSON.stringify(getWorkflowSequence(manifest), null, 2));
      break;
    case 'criteria':
      console.log(JSON.stringify(getSuccessCriteria(manifest), null, 2));
      break;
    case 'checks':
      console.log(JSON.stringify(getPostDeployChecks(manifest), null, 2));
      break;
    case 'full':
    default:
      console.log(JSON.stringify(manifest, null, 2));
      break;
  }
}

module.exports = {
  readManifest,
  getDeployTargets,
  getWorkflowSequence,
  getSuccessCriteria,
  getPostDeployChecks,
};

