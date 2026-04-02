import mongoose, { Document, Schema } from 'mongoose';

export interface IContact extends Document {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  title?: string;
  status: 'lead' | 'prospect' | 'customer' | 'churned';
  tags: string[];
  aiScore?: {
    value: number;
    scoredAt: Date;
    reasoning: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const contactSchema = new Schema<IContact>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    company: { type: String, trim: true },
    title: { type: String, trim: true },
    status: {
      type: String,
      enum: ['lead', 'prospect', 'customer', 'churned'],
      default: 'lead',
    },
    tags: { type: [String], default: [] },
    aiScore: {
      value: { type: Number },
      scoredAt: { type: Date },
      reasoning: { type: String },
    },
  },
  { timestamps: true },
);

contactSchema.index({ email: 1 }, { unique: true });
contactSchema.index({ status: 1 });
contactSchema.index({ company: 1 });
contactSchema.index({ 'aiScore.value': -1 });

export const ContactModel = mongoose.model<IContact>('Contact', contactSchema);
