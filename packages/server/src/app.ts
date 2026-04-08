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
import { ContactScoringService } from './modules/contacts/contact.scoring.service';
import { MongoDealRepository } from './modules/deals/deal.repository';
import { DealService } from './modules/deals/deal.service';
import { DealController } from './modules/deals/deal.controller';
import { createDealRoutes } from './modules/deals/deal.routes';
import { MongoActivityRepository } from './modules/activities/activity.repository';
import { ActivityService } from './modules/activities/activity.service';
import { ActivityController } from './modules/activities/activity.controller';
import { createActivityRoutes } from './modules/activities/activity.routes';
import { ClaudeProvider } from './ai/providers/ClaudeProvider';
import { MockAiProvider } from './ai/providers/MockAiProvider';
import { AiClient } from './ai/AiClient';
import { AiUsageTracker } from './ai/AiUsageTracker';
import { createAiRoutes } from './ai/ai.routes';
import { FollowUpService } from './ai/services/FollowUpService';
import { SentimentService } from './ai/services/SentimentService';

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

  // AI infrastructure wiring
  const aiProvider = env.ENABLE_AI
    ? new ClaudeProvider(env.ANTHROPIC_API_KEY, env.AI_MODEL)
    : new MockAiProvider(new Map());
  const usageTracker = new AiUsageTracker();
  const aiClient = new AiClient(aiProvider, usageTracker);

  // AI feature services
  const scoringService = new ContactScoringService(contactRepository, activityRepository, aiClient);
  const followUpService = new FollowUpService(contactRepository, dealRepository, activityRepository, aiClient);
  const sentimentService = new SentimentService(contactRepository, activityRepository, aiClient);

  // Wire sentiment auto-trigger into activity creation (Observer pattern)
  activityService.setSentimentService(sentimentService);

  const contactController = new ContactController(contactService, scoringService, followUpService, sentimentService);
  const contactRoutes = createContactRoutes(contactController);

  // AI usage routes
  const aiRoutes = createAiRoutes();

  app.get('/api/health', (_req, res) => {
    res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
  });

  app.use('/api/auth', authLimiter, authRoutes);
  app.use('/api/contacts', contactRoutes);
  app.use('/api/contacts/:contactId/activities', contactActivities);
  app.use('/api/deals', dealRoutes);
  app.use('/api/deals/:dealId/activities', dealActivities);
  app.use('/api/activities', activityRoutes);
  app.use('/api/ai', aiRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
