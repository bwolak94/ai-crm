import { Queue, Worker, Job } from 'bullmq';
import pino from 'pino';
import { redis } from '../../config/redis';

const logger = pino({ name: 'contact-queue' });

export const contactQueue = new Queue('contact-processing', {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

export const contactWorker = new Worker(
  'contact-processing',
  async (job: Job) => {
    logger.info({ jobId: job.id, type: job.name }, 'Processing contact job');

    switch (job.name) {
      case 'score-contact':
        logger.info({ contactId: job.data.contactId }, 'AI scoring placeholder — ready for integration');
        break;
      case 'enrich-contact':
        logger.info({ contactId: job.data.contactId }, 'Contact enrichment placeholder — ready for integration');
        break;
      default:
        logger.warn({ jobName: job.name }, 'Unknown job type');
    }
  },
  { connection: redis },
);

contactWorker.on('completed', (job) => {
  logger.info({ jobId: job.id }, 'Job completed');
});

contactWorker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, err }, 'Job failed');
});
