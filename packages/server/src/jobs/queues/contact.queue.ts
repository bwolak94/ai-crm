import { Job } from 'bullmq';
import pino from 'pino';
import { createQueue } from './BaseQueue';
import { ContactModel } from '../../modules/contacts/contact.model';

const logger = pino({ name: 'contact-scoring-queue' });

export const contactScoringQueue = createQueue('contact-scoring');

export async function addScoringJob(
  contactId: string,
  ownerId: string,
  priority?: number,
): Promise<Job> {
  const job = await contactScoringQueue.add(
    'score-contact',
    { contactId, ownerId },
    { priority },
  );
  logger.info({ jobId: job.id, contactId }, 'Scoring job added');
  return job;
}

export async function scheduleNightlyScoring(): Promise<void> {
  const BATCH_SIZE = 10;
  const BATCH_DELAY_MS = 1000;

  const contacts = await ContactModel.find({ deletedAt: null })
    .select('_id ownerId')
    .lean<Array<{ _id: string; ownerId: string }>>();

  logger.info({ count: contacts.length }, 'Scheduling nightly scoring');

  for (let i = 0; i < contacts.length; i += BATCH_SIZE) {
    const batch = contacts.slice(i, i + BATCH_SIZE);
    const jobs = batch.map((contact) => ({
      name: 'score-contact',
      data: { contactId: String(contact._id), ownerId: String(contact.ownerId) },
      opts: { delay: Math.floor(i / BATCH_SIZE) * BATCH_DELAY_MS },
    }));

    await contactScoringQueue.addBulk(jobs);
  }

  logger.info({ totalJobs: contacts.length }, 'Nightly scoring scheduled');
}
