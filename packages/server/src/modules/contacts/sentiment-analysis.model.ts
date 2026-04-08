import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ISentimentAnalysis extends Document {
  contactId: Types.ObjectId;
  ownerId: Types.ObjectId;
  activityId?: Types.ObjectId;
  sentiment: 'positive' | 'neutral' | 'at-risk';
  confidence: number;
  reasoning: string;
  flags: string[];
  createdAt: Date;
}

const sentimentAnalysisSchema = new Schema<ISentimentAnalysis>(
  {
    contactId: { type: Schema.Types.ObjectId, ref: 'Contact', required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    activityId: { type: Schema.Types.ObjectId, ref: 'Activity' },
    sentiment: {
      type: String,
      enum: ['positive', 'neutral', 'at-risk'],
      required: true,
    },
    confidence: { type: Number, required: true, min: 0, max: 1 },
    reasoning: { type: String, required: true },
    flags: { type: [String], default: [] },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
);

sentimentAnalysisSchema.index({ contactId: 1, createdAt: -1 });
sentimentAnalysisSchema.index({ createdAt: 1 }, { expireAfterSeconds: 180 * 24 * 60 * 60 });

export const SentimentAnalysisModel = mongoose.model<ISentimentAnalysis>(
  'SentimentAnalysis',
  sentimentAnalysisSchema,
);
