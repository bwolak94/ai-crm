import mongoose, { Schema } from 'mongoose';
import pino from 'pino';
import { AiCompletionResponse } from './providers/IAiProvider';

const logger = pino({ name: 'ai-usage' });

const MODEL_PRICING: Record<string, { inputPer1M: number; outputPer1M: number }> = {
  'claude-sonnet-4-6': { inputPer1M: 3, outputPer1M: 15 },
  'claude-sonnet-4-5-20250514': { inputPer1M: 3, outputPer1M: 15 },
  'claude-haiku-4-5-20251001': { inputPer1M: 0.8, outputPer1M: 4 },
  'claude-opus-4-6': { inputPer1M: 15, outputPer1M: 75 },
};

const aiUsageSchema = new Schema(
  {
    feature: { type: String, required: true },
    model: { type: String, required: true },
    inputTokens: { type: Number, required: true },
    outputTokens: { type: Number, required: true },
    totalTokens: { type: Number, required: true },
    estimatedCostUsd: { type: Number, required: true },
    latencyMs: { type: Number, required: true },
    entityId: { type: String },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
);

aiUsageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });
aiUsageSchema.index({ ownerId: 1, feature: 1 });

const AiUsageModel = mongoose.model('AiUsage', aiUsageSchema);

function estimateCost(model: string, inputTokens: number, outputTokens: number): number {
  const pricing = MODEL_PRICING[model] ?? MODEL_PRICING['claude-sonnet-4-6']!;
  const inputCost = (inputTokens / 1_000_000) * pricing.inputPer1M;
  const outputCost = (outputTokens / 1_000_000) * pricing.outputPer1M;
  return Math.round((inputCost + outputCost) * 1_000_000) / 1_000_000;
}

export class AiUsageTracker {
  record(
    response: AiCompletionResponse,
    feature: string,
    ownerId: string,
    entityId?: string,
  ): void {
    const totalTokens = response.usage.inputTokens + response.usage.outputTokens;
    const estimatedCostUsd = estimateCost(
      response.model,
      response.usage.inputTokens,
      response.usage.outputTokens,
    );

    AiUsageModel.create({
      feature,
      model: response.model,
      inputTokens: response.usage.inputTokens,
      outputTokens: response.usage.outputTokens,
      totalTokens,
      estimatedCostUsd,
      latencyMs: response.latencyMs,
      entityId,
      ownerId,
    }).catch((err) => {
      logger.error({ err, feature, model: response.model }, 'Failed to record AI usage');
    });
  }
}
