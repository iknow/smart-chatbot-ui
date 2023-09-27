import { UsageReport } from "@/types/admin";
import { getDb } from "./storage";

export async function getLlmUsageReport(start: Date, end: Date): Promise<UsageReport[]> {
    console.info("getLlmUsageReport", start, end)
    const db = await getDb();
    const result = await db.collection("userLlmUsage")
        .aggregate<UsageReport>([
            {
                $match: {
                    date: {
                        $gte: start,
                        $lt: end,
                    }
                }
            },
            {
                $group: {
                    _id: "$userId",
                    totalPriceUSD: {
                        $sum: "$totalPriceUSD"
                    },
                    conversions: {
                        $count: {},
                    },
                    tokens: {
                        $sum: "$tokens.total",
                    },
                }
            },
            {
                $lookup: {
                    from: 'users', // join with users collection
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: {
                    path: "$user",
                }
            }
        ]).toArray();
    console.info("getLlmUsageReport result", result.length)
    return result;
}
