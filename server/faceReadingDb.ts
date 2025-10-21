import { eq, desc } from "drizzle-orm";
import { getDb } from "./db";
import { readings, images, feedback, InsertReading, InsertImage, InsertFeedback } from "../drizzle/schema";
import { randomBytes } from "crypto";

export function generateId(): string {
  return randomBytes(16).toString("hex");
}

// Reading operations
export async function createReading(userId: string): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const readingId = generateId();
  await db.insert(readings).values({
    id: readingId,
    userId,
    status: "pending",
    version: 1,
    modelVersion: "v1.0",
  });

  return readingId;
}

export async function getReading(readingId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(readings).where(eq(readings.id, readingId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getUserReadings(userId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select().from(readings).where(eq(readings.userId, userId)).orderBy(desc(readings.createdAt));
}

export async function updateReadingStatus(
  readingId: string,
  status: "pending" | "uploading" | "processing" | "completed" | "failed",
  errorMessage?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(readings)
    .set({ status, errorMessage: errorMessage || null, updatedAt: new Date() })
    .where(eq(readings.id, readingId));
}

export async function updateReadingAnalysis(
  readingId: string,
  executiveSummary: string,
  detailedAnalysis: string,
  stunningInsights?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(readings)
    .set({
      executiveSummary,
      detailedAnalysis,
      stunningInsights: stunningInsights || null,
      status: "completed",
      updatedAt: new Date(),
    })
    .where(eq(readings.id, readingId));
}

export async function updateReadingPdfPath(readingId: string, pdfPath: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(readings)
    .set({ pdfPath, updatedAt: new Date() })
    .where(eq(readings.id, readingId));
}

export async function deleteReading(readingId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Delete associated images first
  await db.delete(images).where(eq(images.readingId, readingId));
  // Delete associated feedback
  await db.delete(feedback).where(eq(feedback.readingId, readingId));
  // Delete reading
  await db.delete(readings).where(eq(readings.id, readingId));
}

// Image operations
export async function createImage(readingId: string, imageType: string, filePath: string, qualityScore?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const imageId = generateId();
  await db.insert(images).values({
    id: imageId,
    readingId,
    imageType: imageType as any,
    filePath,
    qualityScore,
  });

  return imageId;
}

export async function getReadingImages(readingId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select().from(images).where(eq(images.readingId, readingId));
}

// Feedback operations
export async function createFeedback(
  readingId: string,
  userId: string,
  overallRating: number,
  featureAccuracy: string,
  lifeAspectAccuracy: string,
  specificFeedback: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const feedbackId = generateId();
  await db.insert(feedback).values({
    id: feedbackId,
    readingId,
    userId,
    overallRating,
    featureAccuracy,
    lifeAspectAccuracy,
    specificFeedback,
  });

  return feedbackId;
}

export async function getReadingFeedback(readingId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(feedback).where(eq(feedback.readingId, readingId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getAllFeedback() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select().from(feedback).orderBy(desc(feedback.createdAt));
}

