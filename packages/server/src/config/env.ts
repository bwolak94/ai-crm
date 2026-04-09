import { cleanEnv, str, port, bool, num } from 'envalid';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from package dir first, then monorepo root as fallback
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

export const env = cleanEnv(process.env, {
  PORT: port({ default: 4000 }),
  NODE_ENV: str({ choices: ['development', 'test', 'production'] as const }),
  MONGODB_URI: str(),
  MONGODB_URI_TEST: str({ default: '' }),
  JWT_SECRET: str(),
  JWT_ACCESS_EXPIRES: str({ default: '15m' }),
  JWT_REFRESH_EXPIRES: str({ default: '7d' }),
  REDIS_URL: str(),
  CLIENT_URL: str({ default: 'http://localhost:5173' }),
  ANTHROPIC_API_KEY: str({ default: '' }),
  AI_MODEL: str({ default: 'claude-sonnet-4-6' }),
  AI_MAX_TOKENS: num({ default: 1024 }),
  ENABLE_AI: bool({ default: false }),
});
