import { QueueScheduler } from 'bullmq';
import { dtriQueue } from './dtriQueue.js';

export const scheduler = new QueueScheduler('dtri_jobs', {
  connection: { url: process.env.REDIS_URL! }
});

scheduler.waitUntilReady().then(() => {
  console.log('📅 DTRI Scheduler Ready');
  console.log('🕐 Scheduler will manage recurring jobs and ensure proper execution');
});

scheduler.on('error', (err) => {
  console.error('❌ DTRI Scheduler error:', err);
});

export default scheduler;
