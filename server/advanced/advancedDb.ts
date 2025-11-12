/**
 * Database Helpers for Advanced Reading System
 * 
 * Completely isolated from standard reading database operations
 */

import { eq } from "drizzle-orm";
import { getDb } from "../db";
import {
  advancedReadings,
  advancedImages,
  advancedAnalysis,
  type InsertAdvancedReading,
  type InsertAdvancedImage,
  type InsertAdvancedAnalysis,
  type AdvancedReading,
  type AdvancedImage,
  type AdvancedAnalysis,
} from "../../drizzle/schema";

// ============================================================================
// Advanced Readings
// ============================================================================

export async function createAdvancedReading(data: InsertAdvancedReading): Promise<AdvancedReading> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(advancedReadings).values(data);
  const result = await db.select().from(advancedReadings).where(eq(advancedReadings.id, data.id!)).limit(1);
  
  if (!result.length) throw new Error("Failed to create advanced reading");
  return result[0];
}

export async function getAdvancedReading(id: string): Promise<AdvancedReading | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(advancedReadings).where(eq(advancedReadings.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserAdvancedReadings(userId: string): Promise<AdvancedReading[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(advancedReadings).where(eq(advancedReadings.userId, userId));
}

export async function updateAdvancedReadingStatus(
  id: string,
  status: "pending" | "uploading" | "processing" | "completed" | "failed",
  errorMessage?: string
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(advancedReadings)
    .set({
      status,
      ...(errorMessage ? { errorMessage } : {}),
      ...(status === "completed" ? { completedAt: new Date() } : {}),
    })
    .where(eq(advancedReadings.id, id));
}

export async function deleteAdvancedReading(id: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Delete analysis first (foreign key)
  await db.delete(advancedAnalysis).where(eq(advancedAnalysis.readingId, id));
  
  // Delete images
  await db.delete(advancedImages).where(eq(advancedImages.readingId, id));
  
  // Delete reading
  await db.delete(advancedReadings).where(eq(advancedReadings.id, id));
}

// ============================================================================
// Advanced Images
// ============================================================================

export async function createAdvancedImage(data: InsertAdvancedImage): Promise<AdvancedImage> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(advancedImages).values(data);
  const result = await db.select().from(advancedImages).where(eq(advancedImages.id, data.id!)).limit(1);
  
  if (!result.length) throw new Error("Failed to create advanced image");
  return result[0];
}

export async function getAdvancedReadingImages(readingId: string): Promise<AdvancedImage[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(advancedImages).where(eq(advancedImages.readingId, readingId));
}

// ============================================================================
// Advanced Analysis
// ============================================================================

export async function createAdvancedAnalysis(data: InsertAdvancedAnalysis): Promise<AdvancedAnalysis> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(advancedAnalysis).values(data);
  const result = await db.select().from(advancedAnalysis).where(eq(advancedAnalysis.id, data.id!)).limit(1);
  
  if (!result.length) throw new Error("Failed to create advanced analysis");
  return result[0];
}

export async function getAdvancedAnalysis(readingId: string): Promise<AdvancedAnalysis | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(advancedAnalysis).where(eq(advancedAnalysis.readingId, readingId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateAdvancedAnalysisPdf(readingId: string, pdfPath: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(advancedAnalysis)
    .set({ pdfPath })
    .where(eq(advancedAnalysis.readingId, readingId));
}

