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

  app.get('/api/health', (_req, res) => {
    res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
  });

  app.use('/api/auth', authLimiter, authRoutes);
  app.use('/api/contacts', contactRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
