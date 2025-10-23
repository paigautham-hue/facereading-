import { getDb } from "./db";
import { aiModelLogs } from "../drizzle/schema";
import { nanoid } from "nanoid";

export type ModelName = "gemini-2.5-pro" | "gpt-5" | "grok-4";
export type Operation = "vision_analysis" | "face_reading" | "stunning_insights";
export type LogStatus = "success" | "failure";

export interface AIModelLogData {
  readingId?: string;
  modelName: ModelName;
  operation: Operation;
  status: LogStatus;
  responseTime?: number;
  confidenceScore?: number;
  tokensUsed?: number;
  errorMessage?: string;
  errorStack?: string;
  requestData?: any;
  responseData?: any;
}

/**
 * Log AI model performance to database
 */
export async function logAIModelPerformance(data: AIModelLogData): Promise<void> {
  try {
    const db = await getDb();
    if (!db) {
      console.error("Database not available for AI monitoring");
      return;
    }

    await db.insert(aiModelLogs).values({
      id: nanoid(),
      readingId: data.readingId,
      modelName: data.modelName,
      operation: data.operation,
      status: data.status,
      responseTime: data.responseTime,
      confidenceScore: data.confidenceScore,
      tokensUsed: data.tokensUsed,
      errorMessage: data.errorMessage,
      errorStack: data.errorStack,
      requestData: data.requestData ? JSON.stringify(data.requestData) : null,
      responseData: data.responseData ? JSON.stringify(data.responseData) : null,
    });
  } catch (error) {
    console.error("Failed to log AI model performance:", error);
  }
}

/**
 * Wrapper function to monitor AI model calls
 */
export async function monitoredAICall<T>(
  modelName: ModelName,
  operation: Operation,
  readingId: string | undefined,
  fn: () => Promise<T>,
  extractConfidence?: (result: T) => number
): Promise<T> {
  const startTime = Date.now();
  
  try {
    const result = await fn();
    const responseTime = Date.now() - startTime;
    const confidenceScore = extractConfidence ? extractConfidence(result) : undefined;

    // Log success
    await logAIModelPerformance({
      readingId,
      modelName,
      operation,
      status: "success",
      responseTime,
      confidenceScore,
      responseData: result,
    });

    return result;
  } catch (error: any) {
    const responseTime = Date.now() - startTime;

    // Log failure
    await logAIModelPerformance({
      readingId,
      modelName,
      operation,
      status: "failure",
      responseTime,
      errorMessage: error.message || "Unknown error",
      errorStack: error.stack,
    });

    throw error;
  }
}

/**
 * Get AI monitoring statistics
 */
export async function getAIMonitoringStats(timeRange?: { start: Date; end: Date }) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const { sql, and, gte, lte, count, avg, sum } = await import("drizzle-orm");
  
  let query = db.select().from(aiModelLogs);
  
  if (timeRange) {
    query = query.where(
      and(
        gte(aiModelLogs.createdAt, timeRange.start),
        lte(aiModelLogs.createdAt, timeRange.end)
      )
    ) as any;
  }

  const logs = await query;

  // Calculate statistics per model
  const stats = {
    "gemini-2.5-pro": calculateModelStats(logs.filter(l => l.modelName === "gemini-2.5-pro")),
    "gpt-5": calculateModelStats(logs.filter(l => l.modelName === "gpt-5")),
    "grok-4": calculateModelStats(logs.filter(l => l.modelName === "grok-4")),
  };

  return {
    stats,
    recentLogs: logs.slice(0, 100), // Last 100 logs
    totalLogs: logs.length,
  };
}

function calculateModelStats(logs: any[]) {
  const total = logs.length;
  const successes = logs.filter(l => l.status === "success").length;
  const failures = logs.filter(l => l.status === "failure").length;
  const successRate = total > 0 ? (successes / total) * 100 : 0;
  
  const responseTimes = logs
    .filter(l => l.responseTime !== null)
    .map(l => l.responseTime as number);
  const avgResponseTime = responseTimes.length > 0
    ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
    : 0;

  const confidenceScores = logs
    .filter(l => l.confidenceScore !== null)
    .map(l => l.confidenceScore as number);
  const avgConfidence = confidenceScores.length > 0
    ? confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length
    : 0;

  const byOperation = {
    vision_analysis: logs.filter(l => l.operation === "vision_analysis").length,
    face_reading: logs.filter(l => l.operation === "face_reading").length,
    stunning_insights: logs.filter(l => l.operation === "stunning_insights").length,
  };

  return {
    total,
    successes,
    failures,
    successRate: Math.round(successRate * 10) / 10,
    avgResponseTime: Math.round(avgResponseTime),
    avgConfidence: Math.round(avgConfidence * 10) / 10,
    byOperation,
  };
}

