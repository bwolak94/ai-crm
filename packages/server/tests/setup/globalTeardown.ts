import mongoose from 'mongoose';

export default async function globalTeardown(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/ai-crm-test';

  const conn = await mongoose.connect(mongoUri);
  await conn.connection.db!.dropDatabase();
  await mongoose.disconnect();
}
