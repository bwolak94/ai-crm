import { Router } from 'express';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';
import { ContactRepository } from './contact.repository';
import { validateRequest } from '../../shared/middleware/validateRequest';
import { authenticate } from '../../shared/middleware/authenticate';
import { ContactCreateSchema, ContactUpdateSchema } from '@ai-crm/shared';

const router: ReturnType<typeof Router> = Router();
const contactRepository = new ContactRepository();
const contactService = new ContactService(contactRepository);
const contactController = new ContactController(contactService);

router.use(authenticate);

router.get('/', contactController.index);
router.get('/:id', contactController.show);
router.post('/', validateRequest(ContactCreateSchema), contactController.store);
router.put('/:id', validateRequest(ContactUpdateSchema), contactController.update);
router.delete('/:id', contactController.destroy);

export { router as contactRoutes };
