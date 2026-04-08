import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IActivity extends Document {
  contactId: Types.ObjectId;
  dealId?: Types.ObjectId;
  ownerId: Types.ObjectId;
  type: 'call' | 'email' | 'note' | 'meeting' | 'task';
  title: string;
  body?: string;
  scheduledAt?: Date;
  completedAt?: Date;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const activitySchema = new Schema<IActivity>(
  {
    contactId: { type: Schema.Types.ObjectId, ref: 'Contact', required: true },
    dealId: { type: Schema.Types.ObjectId, ref: 'Deal' },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['call', 'email', 'note', 'meeting', 'task'],
      required: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    body: { type: String, maxlength: 5000 },
    scheduledAt: { type: Date },
    completedAt: { type: Date },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

activitySchema.index({ contactId: 1, createdAt: -1 });
activitySchema.index({ ownerId: 1, type: 1, createdAt: -1 });
activitySchema.index({ dealId: 1, createdAt: -1 });

export const ActivityModel = mongoose.model<IActivity>('Activity', activitySchema);
