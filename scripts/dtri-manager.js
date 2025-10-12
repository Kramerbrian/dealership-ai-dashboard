#!/usr/bin/env node

/**
 * DTRI (Digital Trust Revenue Index) Management Script
 * 
 * This script provides comprehensive management of the DTRI job system including:
 * - Starting/stopping workers and schedulers
 * - Monitoring job status
 * - Testing individual components
 * - Managing job queues
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class DTRIManager {
  constructor() {
    this.processes = new Map();
    this.isRunning = false;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '📊',
      success: '✅',
      error: '❌',
      warning: '⚠️',
      start: '🚀'
    }[type] || '📊';
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async checkEnvironment() {
    this.log('Checking DTRI environment configuration...', 'info');
    
    const requiredEnvVars = [
      'REDIS_URL',
      'SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY',
      'OPENAI_API_KEY',
      'BASE_URL'
    ];

    const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missing.length > 0) {
      this.log(`Missing required environment variables: ${missing.join(', ')}`, 'error');
      this.log('Please check your .env.local file and ensure all DTRI variables are set', 'warning');
      return false;
    }

    this.log('Environment configuration validated', 'success');
    return true;
  }

  async startScheduler() {
    this.log('Starting DTRI Scheduler...', 'start');
    
    try {
      const schedulerProcess = spawn('npm', ['run', 'dtri:scheduler'], {
        stdio: 'inherit',
        detached: false
      });

      this.processes.set('scheduler', schedulerProcess);
      this.log('DTRI Scheduler started successfully', 'success');
      return true;
    } catch (error) {
      this.log(`Failed to start DTRI Scheduler: ${error.message}`, 'error');
      return false;
    }
  }

  async startWorker() {
    this.log('Starting DTRI Worker...', 'start');
    
    try {
      const workerProcess = spawn('npm', ['run', 'dtri:worker'], {
        stdio: 'inherit',
        detached: false
      });

      this.processes.set('worker', workerProcess);
      this.log('DTRI Worker started successfully', 'success');
      return true;
    } catch (error) {
      this.log(`Failed to start DTRI Worker: ${error.message}`, 'error');
      return false;
    }
  }

  async scheduleJobs() {
    this.log('Scheduling DTRI nightly jobs...', 'start');
    
    try {
      execSync('npm run dtri:schedule', { stdio: 'inherit' });
      this.log('DTRI nightly jobs scheduled successfully', 'success');
      return true;
    } catch (error) {
      this.log(`Failed to schedule DTRI jobs: ${error.message}`, 'error');
      return false;
    }
  }

  async testAPI() {
    this.log('Testing DTRI API endpoints...', 'start');
    
    try {
      // Test analyze endpoint
      execSync('npm run dtri:test', { stdio: 'inherit' });
      this.log('DTRI API test completed successfully', 'success');
      return true;
    } catch (error) {
      this.log(`DTRI API test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async startAll() {
    this.log('Starting complete DTRI system...', 'start');
    
    if (!(await this.checkEnvironment())) {
      return false;
    }

    const results = await Promise.all([
      this.startScheduler(),
      this.startWorker(),
      this.scheduleJobs()
    ]);

    if (results.every(result => result)) {
      this.log('DTRI system started successfully!', 'success');
      this.log('System is now processing jobs and managing schedules', 'info');
      this.isRunning = true;
      return true;
    } else {
      this.log('Failed to start DTRI system completely', 'error');
      return false;
    }
  }

  async stopAll() {
    this.log('Stopping DTRI system...', 'start');
    
    for (const [name, process] of this.processes) {
      try {
        process.kill('SIGTERM');
        this.log(`Stopped ${name}`, 'success');
      } catch (error) {
        this.log(`Error stopping ${name}: ${error.message}`, 'error');
      }
    }
    
    this.processes.clear();
    this.isRunning = false;
    this.log('DTRI system stopped', 'success');
  }

  async status() {
    this.log('DTRI System Status:', 'info');
    this.log(`Running: ${this.isRunning}`, 'info');
    this.log(`Active Processes: ${this.processes.size}`, 'info');
    
    for (const [name, process] of this.processes) {
      this.log(`- ${name}: ${process.pid ? 'Running (PID: ' + process.pid + ')' : 'Stopped'}`, 'info');
    }
  }

  showHelp() {
    console.log(`
DTRI Management Script

Usage: node scripts/dtri-manager.js <command>

Commands:
  start       Start the complete DTRI system (scheduler + worker + jobs)
  stop        Stop all DTRI processes
  status      Show current system status
  test        Test DTRI API endpoints
  schedule    Schedule nightly jobs only
  help        Show this help message

Examples:
  node scripts/dtri-manager.js start
  node scripts/dtri-manager.js status
  node scripts/dtri-manager.js test
    `);
  }
}

// Main execution
async function main() {
  const manager = new DTRIManager();
  const command = process.argv[2];

  switch (command) {
    case 'start':
      await manager.startAll();
      break;
    case 'stop':
      await manager.stopAll();
      break;
    case 'status':
      await manager.status();
      break;
    case 'test':
      await manager.testAPI();
      break;
    case 'schedule':
      await manager.scheduleJobs();
      break;
    case 'help':
    default:
      manager.showHelp();
      break;
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  const manager = new DTRIManager();
  await manager.stopAll();
  process.exit(0);
});

if (require.main === module) {
  main().catch(console.error);
}

module.exports = DTRIManager;
