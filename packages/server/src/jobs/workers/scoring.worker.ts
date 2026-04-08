import { Worker, Job } from 'bullmq';
import pino from 'pino';
import { redis } from '../../config/redis';
import { ContactScoringService, BatchScoringResult } from '../../modules/contacts/contact.scoring.service';
import { AiRateLimitError } from '../../ai/errors/AiRateLimitError';

const logger = pino({ name: 'scoring-worker' });

interface ScoringJobData {
  contactIds: string[];
  ownerId: string;
}

export function createScoringWorker(scoringService: ContactScoringService): Worker<ScoringJobData, BatchScoringResult> {
  const worker = new Worker<ScoringJobData, BatchScoringResult>(
    'contact-scoring',
    async (job: Job<ScoringJobData>): Promise<BatchScoringResult> => {
      const { contactIds, ownerId } = job.data;
      logger.info({ jobId: job.id, count: contactIds.length, ownerId }, 'Scoring job started');

      try {
        const result = await scoringService.scoreBatch(contactIds, ownerId);
        logger.info(
          { jobId: job.id, succeeded: result.succeeded, failed: result.failed },
          'Scoring job completed',
        );
        return result;
      } catch (error: unknown) {
        if (error instanceof AiRateLimitError) {
          logger.warn({ jobId: job.id }, 'Rate limited — will retry via Bull backoff');
          throw error;
        }

        logger.error({ jobId: job.id, err: error }, 'Scoring job failed unexpectedly');
        return { succeeded: 0, failed: contactIds.length, errors: contactIds.map((id) => ({ contactId: id, message: (error as Error).message })) };
      }
    },
    { connection: redis, concurrency: 5 },
  );

  worker.on('completed', (job) => {
    logger.info({ jobId: job.id }, 'Scoring worker job completed');
  });

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, err }, 'Scoring worker job failed');
  });

  return worker;
}
