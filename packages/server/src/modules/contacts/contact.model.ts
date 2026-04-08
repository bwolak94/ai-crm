import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IContact extends Document {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  title?: string;
  status: 'lead' | 'prospect' | 'customer' | 'churned';
  tags: string[];
  notes?: string;
  customFields: Record<string, unknown>;
  ownerId: Types.ObjectId;
  aiScore?: {
    value: number;
    scoredAt: Date;
    reasoning: string;
    signals: { positive: string[]; negative: string[] };
  };
  sentiment?: 'positive' | 'neutral' | 'at-risk';
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}

const contactSchema = new Schema<IContact>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    company: { type: String, trim: true, maxlength: 100 },
    title: { type: String, trim: true, maxlength: 100 },
    status: {
      type: String,
      enum: ['lead', 'prospect', 'customer', 'churned'],
      default: 'lead',
    },
    tags: { type: [String], default: [] },
    notes: { type: String, maxlength: 2000 },
    customFields: { type: Schema.Types.Mixed, default: {} },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    aiScore: {
      type: {
        value: { type: Number, min: 0, max: 100 },
        scoredAt: { type: Date },
        reasoning: { type: String },
        signals: {
          positive: { type: [String], default: [] },
          negative: { type: [String], default: [] },
        },
      },
      sparse: true,
    },
    sentiment: {
      type: String,
      enum: ['positive', 'neutral', 'at-risk'],
      sparse: true,
    },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// Indexes
contactSchema.index({ email: 1, ownerId: 1 }, { unique: true });
contactSchema.index({ ownerId: 1, status: 1 });
contactSchema.index({ ownerId: 1, company: 1 });
contactSchema.index({ 'aiScore.value': -1, ownerId: 1 });
contactSchema.index({ deletedAt: 1 });
contactSchema.index({ name: 'text', email: 'text', company: 'text' });

// Pre-find middleware: exclude soft-deleted contacts by default
function applySoftDeleteFilter(this: mongoose.Query<unknown, unknown>): void {
  const conditions = this.getFilter();
  if (conditions.deletedAt === undefined) {
    this.where({ deletedAt: null });
  }
}

contactSchema.pre('find', applySoftDeleteFilter);
contactSchema.pre('findOne', applySoftDeleteFilter);
contactSchema.pre('countDocuments', applySoftDeleteFilter);

// Virtual
contactSchema.virtual('isDeleted').get(function (this: IContact): boolean {
  return this.deletedAt !== null;
});

contactSchema.set('toObject', { virtuals: true });
contactSchema.set('toJSON', { virtuals: true });

export const ContactModel = mongoose.model<IContact>('Contact', contactSchema);
