import { validateAdminAccess } from '../context';
import { procedure, router } from '../trpc';
import { z } from 'zod';
import { getLlmUsageReport } from '@/utils/server/admin';

export const admin = router({
    usageReport: procedure
        .input(z.object({ start: z.number(), end: z.number() }))
        .query(async ({ ctx, input }) => {
            await validateAdminAccess(ctx);
            let start = new Date(input.start);
            let end = new Date(input.end);
            return getLlmUsageReport(start, end);
        })
})
