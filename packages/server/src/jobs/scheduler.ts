import { schedule, ScheduledTask } from 'node-cron';
import pino from 'pino';
import { contactScoringQueue } from './queues/contact.queue';
import { IContactRepository } from '../modules/contacts/contact.repository';

const logger = pino({ name: 'scheduler' });

const BATCH_SIZE = 50;
const BATCH_DELAY_MS = 100;

export function scheduleNightlyScoring(contactRepository: IContactRepository): ScheduledTask {
  return schedule('0 2 * * *', async () => {
    logger.info('Nightly scoring started');

    try {
      const ownerIds = await contactRepository.findAllOwnerIds();
      let totalQueued = 0;

      for (const ownerId of ownerIds) {
        const contactIds = await contactRepository.findIdsByOwner(ownerId);

        for (let i = 0; i < contactIds.length; i += BATCH_SIZE) {
          const batch = contactIds.slice(i, i + BATCH_SIZE);
          await contactScoringQueue.add(
            'score-batch',
            { contactIds: batch, ownerId },
            { delay: Math.floor(totalQueued / BATCH_SIZE) * BATCH_DELAY_MS },
          );
          totalQueued += batch.length;
        }
      }

      logger.info({ totalQueued, ownerCount: ownerIds.length }, 'Nightly scoring scheduled');
    } catch (err) {
      logger.error({ err }, 'Nightly scoring scheduling failed');
    }
  });
}
