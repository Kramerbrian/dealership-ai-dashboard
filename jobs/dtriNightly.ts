import { dtriQueue } from './dtriQueue.js';

(async () => {
  console.log('🌙 Starting DTRI nightly job scheduling...');
  
  const dealers = [
    { id: 'naples-001', verticals: ['sales', 'acquisition', 'service', 'parts'] },
    { id: 'kennesaw-002', verticals: ['sales', 'acquisition', 'service', 'parts'] }
  ];

  console.log(`📋 Scheduling jobs for ${dealers.length} dealers`);

  for (const d of dealers) {
    try {
      await dtriQueue.add('nightly_dtri', d, {
        repeat: { cron: '0 3 * * *' }, // 3 AM daily
        jobId: `nightly_dtri_${d.id}`,
        removeOnComplete: 10,
        removeOnFail: 5
      });
      console.log(`✅ Scheduled nightly DTRI job for dealer: ${d.id}`);
    } catch (error) {
      console.error(`❌ Failed to schedule job for dealer ${d.id}:`, error);
    }
  }
  
  // Schedule weekly beta recalibration (Sunday at 3 AM)
  try {
    await dtriQueue.add('beta_recalibration', {}, {
      repeat: { cron: '0 3 * * SUN' }, // Sunday at 3 AM
      jobId: 'beta_recalibration_weekly',
      removeOnComplete: 10,
      removeOnFail: 5
    });
    console.log('✅ Scheduled weekly beta recalibration (Sunday 3 AM)');
  } catch (error) {
    console.error('❌ Failed to schedule beta recalibration:', error);
  }

  console.log('🌙 All DTRI jobs scheduled (nightly + beta recalibration).');
})();
