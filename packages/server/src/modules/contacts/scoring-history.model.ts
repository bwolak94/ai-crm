import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IScoringHistory extends Document {
  contactId: Types.ObjectId;
  ownerId: Types.ObjectId;
  score: number;
  previousScore: number | null;
  reasoning: string;
  signals: { positive: string[]; negative: string[] };
  recommendedAction: string;
  aiModel: string;
  tokensUsed: number;
  createdAt: Date;
}

const scoringHistorySchema = new Schema<IScoringHistory>(
  {
    contactId: { type: Schema.Types.ObjectId, ref: 'Contact', required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    previousScore: { type: Number, default: null },
    reasoning: { type: String, required: true },
    signals: {
      positive: { type: [String], default: [] },
      negative: { type: [String], default: [] },
    },
    recommendedAction: { type: String, required: true },
    aiModel: { type: String, required: true },
    tokensUsed: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
);

scoringHistorySchema.index({ contactId: 1, createdAt: -1 });
scoringHistorySchema.index({ createdAt: 1 }, { expireAfterSeconds: 180 * 24 * 60 * 60 });

export const ScoringHistoryModel = mongoose.model<IScoringHistory>(
  'ScoringHistory',
  scoringHistorySchema,
);
