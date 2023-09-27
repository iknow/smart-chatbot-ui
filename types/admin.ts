import * as z from 'zod';
import { UserSchema } from './user';
import { TokenUsageCountSchema } from './llmUsage';

export const UsageReportSchema = z.object({
    user: UserSchema,
    totalPriceUSD: z.number(),
    conversions: z.number(),
    tokens: z.number(),
});

export type UsageReport = z.infer<typeof UsageReportSchema>;
