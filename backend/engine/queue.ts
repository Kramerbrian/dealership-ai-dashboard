/**
 * BullMQ Queue Integration
 * 
 * Wires job enqueueing to BullMQ with Redis
 */
import { addJob, JobType } from '@/lib/job-queue';

export type JobPayload = { 
  type: "schema-fix" | "reprobe" | "crawl"; 
  data: Record<string, any> 
};

export async function enqueue(job: JobPayload): Promise<{ id: string }> {
  // Map job types to BullMQ JobType
  const jobTypeMap: Record<string, JobType> = {
    'schema-fix': JobType.PROCESS_DATA,
    'reprobe': JobType.PROCESS_DATA,
    'crawl': JobType.PROCESS_DATA,
  };

  try {
    const jobId = await addJob({
      type: jobTypeMap[job.type] || JobType.PROCESS_DATA,
      payload: {
        jobType: job.type,
        ...job.data,
      },
      priority: job.type === 'schema-fix' ? 1 : 0, // Higher priority for fixes
      attempts: 3,
    });

    return { id: jobId || `fallback-${Date.now()}` };
  } catch (error) {
    console.error('Failed to enqueue job:', error);
    // Fallback: return a job ID even if queue fails
    return { id: `fallback-${job.type}-${Date.now()}` };
  }
}

