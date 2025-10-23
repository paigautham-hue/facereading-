import { z } from "zod";
import { router, adminProcedure } from "./_core/trpc";
import { getAIMonitoringStats } from "./aiMonitoringService";
import { getDb } from "./db";
import { aiModelLogs } from "../drizzle/schema";
import { desc, and, gte, lte } from "drizzle-orm";

export const aiMonitoringRouter = router({
  // Get AI monitoring statistics
  getStats: adminProcedure
    .input(z.object({
      timeRange: z.enum(["1h", "24h", "7d", "30d", "all"]).default("24h"),
    }))
    .query(async ({ input }) => {
      const now = new Date();
      let start: Date;

      switch (input.timeRange) {
        case "1h":
          start = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case "24h":
          start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case "7d":
          start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "30d":
          start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          start = new Date(0); // All time
      }

      return await getAIMonitoringStats({ start, end: now });
    }),

  // Get recent AI model logs
  getRecentLogs: adminProcedure
    .input(z.object({
      limit: z.number().default(50),
      modelName: z.enum(["gemini-2.5-pro", "gpt-5", "grok-4", "all"]).default("all"),
      status: z.enum(["success", "failure", "all"]).default("all"),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      let query = db.select().from(aiModelLogs).orderBy(desc(aiModelLogs.createdAt)).limit(input.limit);

      const { eq } = await import("drizzle-orm");
      const conditions = [];
      if (input.modelName !== "all") {
        conditions.push(eq(aiModelLogs.modelName, input.modelName));
      }
      if (input.status !== "all") {
        conditions.push(eq(aiModelLogs.status, input.status));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }

      const logs = await query;
      
      return logs.map(log => ({
        ...log,
        requestData: log.requestData ? JSON.parse(log.requestData) : null,
        responseData: log.responseData ? JSON.parse(log.responseData) : null,
      }));
    }),

  // Get error logs with details
  getErrorLogs: adminProcedure
    .input(z.object({
      limit: z.number().default(20),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      const { eq } = await import("drizzle-orm");
      const errorLogs = await db
        .select()
        .from(aiModelLogs)
        .where(eq(aiModelLogs.status, "failure"))
        .orderBy(desc(aiModelLogs.createdAt))
        .limit(input.limit);

      return errorLogs;
    }),
});

