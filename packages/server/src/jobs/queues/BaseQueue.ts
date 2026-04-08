import { Queue, QueueOptions } from 'bullmq';
import { redis } from '../../config/redis';

const DEFAULT_JOB_OPTIONS = {
  attempts: 3,
  backoff: {
    type: 'exponential' as const,
    delay: 2000,
  },
  removeOnComplete: 100,
  removeOnFail: 500,
};

export function createQueue(name: string, options?: Partial<QueueOptions>): Queue {
  return new Queue(name, {
    connection: redis,
    defaultJobOptions: DEFAULT_JOB_OPTIONS,
    ...options,
  });
}
