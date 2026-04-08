import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import { env } from './config/env';
import { globalLimiter, authLimiter } from './shared/middleware/rateLimiter';
import { errorHandler } from './shared/middleware/errorHandler';
import { notFound } from './shared/middleware/notFound';
import { MongoUserRepository } from './modules/auth/user.repository';
import { AuthService } from './modules/auth/auth.service';
import { AuthController } from './modules/auth/auth.controller';
import { createAuthRoutes } from './modules/auth/auth.routes';
import { MongoContactRepository } from './modules/contacts/contact.repository';
import { ContactService } from './modules/contacts/contact.service';
import { ContactController } from './modules/contacts/contact.controller';
import { createContactRoutes } from './modules/contacts/contact.routes';
import { MongoDealRepository } from './modules/deals/deal.repository';
import { DealService } from './modules/deals/deal.service';
import { DealController } from './modules/deals/deal.controller';
import { createDealRoutes } from './modules/deals/deal.routes';
import { MongoActivityRepository } from './modules/activities/activity.repository';
import { ActivityService } from './modules/activities/activity.service';
import { ActivityController } from './modules/activities/activity.controller';
import { createActivityRoutes } from './modules/activities/activity.routes';

export function createApp(): express.Express {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());
  app.use(pinoHttp({ enabled: env.NODE_ENV !== 'test' }));
  app.use(globalLimiter);

  // Auth DI wiring
  const userRepository = new MongoUserRepository();
  const authService = new AuthService(userRepository);
  const authController = new AuthController(authService);
  const authRoutes = createAuthRoutes(authController);

  // Contact DI wiring
  const contactRepository = new MongoContactRepository();
  const contactService = new ContactService(contactRepository);
  const contactController = new ContactController(contactService);
  const contactRoutes = createContactRoutes(contactController);

  // Deal DI wiring
  const dealRepository = new MongoDealRepository();
  const dealService = new DealService(dealRepository);
  const dealController = new DealController(dealService);
  const dealRoutes = createDealRoutes(dealController);

  // Activity DI wiring (cross-module: depends on contact + deal repositories)
  const activityRepository = new MongoActivityRepository();
  const activityService = new ActivityService(activityRepository, contactRepository, dealRepository);
  const activityController = new ActivityController(activityService);
  const { contactActivities, dealActivities, activities: activityRoutes } = createActivityRoutes(activityController);

  app.get('/api/health', (_req, res) => {
    res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
  });

  app.use('/api/auth', authLimiter, authRoutes);
  app.use('/api/contacts', contactRoutes);
  app.use('/api/contacts/:contactId/activities', contactActivities);
  app.use('/api/deals', dealRoutes);
  app.use('/api/deals/:dealId/activities', dealActivities);
  app.use('/api/activities', activityRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
