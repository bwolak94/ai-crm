import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IStageHistoryEntry {
  stage: string;
  changedAt: Date;
  changedBy: Types.ObjectId;
  previousStage: string;
  daysInPreviousStage: number;
}

export interface IDeal extends Document {
  title: string;
  contactId: Types.ObjectId;
  ownerId: Types.ObjectId;
  value: number;
  currency: string;
  stage: 'discovery' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  priority: 'low' | 'medium' | 'high';
  expectedCloseDate?: Date;
  closedAt?: Date;
  description?: string;
  notes?: string;
  stageHistory: IStageHistoryEntry[];
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PipelineSummary {
  stage: string;
  count: number;
  totalValue: number;
  avgValue: number;
  currency: string;
}

const stageHistorySchema = new Schema<IStageHistoryEntry>(
  {
    stage: { type: String, required: true },
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    previousStage: { type: String, required: true },
    daysInPreviousStage: { type: Number, required: true },
  },
  { _id: false },
);

const dealSchema = new Schema<IDeal>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    contactId: { type: Schema.Types.ObjectId, ref: 'Contact', required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    value: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD', minlength: 3, maxlength: 3 },
    stage: {
      type: String,
      enum: ['discovery', 'proposal', 'negotiation', 'closed_won', 'closed_lost'],
      default: 'discovery',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    expectedCloseDate: { type: Date },
    closedAt: { type: Date },
    description: { type: String, maxlength: 2000 },
    notes: { type: String, maxlength: 2000 },
    stageHistory: { type: [stageHistorySchema], default: [] },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// Indexes
dealSchema.index({ ownerId: 1, stage: 1 });
dealSchema.index({ contactId: 1 });
dealSchema.index({ ownerId: 1, expectedCloseDate: 1 });
dealSchema.index({ deletedAt: 1 });

// Pre-find middleware: exclude soft-deleted deals by default
function applySoftDeleteFilter(this: mongoose.Query<unknown, unknown>): void {
  const conditions = this.getFilter();
  if (conditions.deletedAt === undefined) {
    this.where({ deletedAt: null });
  }
}

dealSchema.pre('find', applySoftDeleteFilter);
dealSchema.pre('findOne', applySoftDeleteFilter);
dealSchema.pre('countDocuments', applySoftDeleteFilter);

export const DealModel = mongoose.model<IDeal>('Deal', dealSchema);
