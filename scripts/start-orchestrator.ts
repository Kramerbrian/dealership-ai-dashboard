#!/usr/bin/env ts-node

/**
 * Start Orchestrator 3.0 for autonomous project completion
 *
 * Usage: npx ts-node scripts/start-orchestrator.ts
 */

import { createDealershipAIOrchestrator } from '../lib/agent/orchestrator3';

async function main() {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  🚀 Orchestrator 3.0 - Autonomous Project Completion');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');

  try {
    // Create orchestrator
    const orchestrator = createDealershipAIOrchestrator();

    // Initialize (generate task plan)
    console.log('📋 Generating task plan...');
    await orchestrator.initialize();

    const state = orchestrator.getState();

    console.log('');
    console.log('✅ Task plan generated!');
    console.log('');
    console.log(`Goal: ${state.goal.objective}`);
    console.log(`Total tasks: ${state.totalTasks}`);
    console.log(`Confidence: ${(state.confidence * 100).toFixed(1)}%`);
    console.log('');

    // Show task breakdown
    console.log('📊 Task Breakdown:');
    console.log('');

    const tasksByPriority = {
      critical: state.tasks.filter(t => t.priority === 'critical'),
      high: state.tasks.filter(t => t.priority === 'high'),
      medium: state.tasks.filter(t => t.priority === 'medium'),
      low: state.tasks.filter(t => t.priority === 'low'),
    };

    console.log(`  Critical: ${tasksByPriority.critical.length} tasks`);
    console.log(`  High:     ${tasksByPriority.high.length} tasks`);
    console.log(`  Medium:   ${tasksByPriority.medium.length} tasks`);
    console.log(`  Low:      ${tasksByPriority.low.length} tasks`);
    console.log('');

    // Show first 5 tasks
    console.log('🎯 First 5 Tasks:');
    console.log('');
    state.tasks.slice(0, 5).forEach((task, i) => {
      const priorityEmoji = {
        critical: '🔴',
        high: '🟠',
        medium: '🟡',
        low: '🟢',
      };
      console.log(`  ${i + 1}. ${priorityEmoji[task.priority]} ${task.title}`);
      console.log(`     ${task.description}`);
      console.log('');
    });

    // Start autonomous execution
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  🤖 Starting Autonomous Execution');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log('Orchestrator is now running autonomously...');
    console.log('Press Ctrl+C to stop.');
    console.log('');

    await orchestrator.start();

    // Final report
    const finalState = orchestrator.getState();

    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  🎉 Orchestration Complete!');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log(`✅ Completed: ${finalState.completedTasks}/${finalState.totalTasks} tasks`);
    console.log(`📊 Progress: ${finalState.overallProgress}%`);
    console.log(`🎯 Confidence: ${(finalState.confidence * 100).toFixed(1)}%`);
    console.log('');

    const failedTasks = finalState.tasks.filter(t => t.status === 'failed');
    if (failedTasks.length > 0) {
      console.log(`⚠️  Failed tasks: ${failedTasks.length}`);
      failedTasks.forEach(task => {
        console.log(`  - ${task.title}: ${task.error}`);
      });
      console.log('');
    }

    console.log('📝 Full execution log:');
    console.log('');
    finalState.logs.slice(-10).forEach(log => {
      const emoji = {
        info: 'ℹ️',
        warn: '⚠️',
        error: '❌',
        success: '✅',
      };
      console.log(`  ${emoji[log.level]} ${log.message}`);
    });
    console.log('');

    console.log('🚀 DealershipAI is now at 100% completion!');
    console.log('');

    process.exit(0);
  } catch (error: any) {
    console.error('');
    console.error('❌ Orchestrator failed:', error.message);
    console.error('');
    console.error(error.stack);
    console.error('');
    process.exit(1);
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('');
  console.log('⏸️  Orchestrator stopped by user');
  console.log('');
  process.exit(0);
});

// Run
main();
