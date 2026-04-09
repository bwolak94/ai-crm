import mongoose from 'mongoose';

export default async function globalSetup(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/ai-crm-test';

  const conn = await mongoose.connect(mongoUri);
  const collections = await conn.connection.db!.listCollections().toArray();

  for (const col of collections) {
    await conn.connection.db!.dropCollection(col.name);
  }

  await mongoose.disconnect();
}
