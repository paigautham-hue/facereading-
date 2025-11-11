import { eq, desc } from "drizzle-orm";
import { getDb } from "./db";
import { advancedReadings, advancedImages } from "../drizzle/schema";
import type { InsertAdvancedReading, InsertAdvancedImage } from "../drizzle/schema";
import { randomBytes } from "crypto";

// Generate unique ID
function generateId(): string {
  return randomBytes(16).toString("hex");
}

// Create a new advanced reading
export async function createAdvancedReading(
  userId: string,
  name?: string,
  gender?: "male" | "female" | "unknown"
): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const readingId = generateId();
  const newReading: InsertAdvancedReading = {
    id: readingId,
    userId,
    name: name || null,
    gender: gender || "unknown",
    status: "pending",
  };

  await db.insert(advancedReadings).values(newReading);
  return readingId;
}

// Get advanced reading by ID
export async function getAdvancedReading(readingId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(advancedReadings)
    .where(eq(advancedReadings.id, readingId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

// Get user's advanced readings
export async function getUserAdvancedReadings(userId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(advancedReadings)
    .where(eq(advancedReadings.userId, userId))
    .orderBy(desc(advancedReadings.createdAt));
}

// Update advanced reading status
export async function updateAdvancedReadingStatus(
  readingId: string,
  status: "pending" | "uploading" | "processing" | "completed" | "failed",
  errorMessage?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(advancedReadings)
    .set({
      status,
      errorMessage: errorMessage || null,
      updatedAt: new Date(),
    })
    .where(eq(advancedReadings.id, readingId));
}

// Update advanced reading analysis
export async function updateAdvancedReadingAnalysis(
  readingId: string,
  analysis: {
    executiveSummary: string;
    detailedAnalysis: string;
    stunningInsights?: string;
    moleAnalysis: string;
    compatibilityAnalysis: string;
    decadeTimeline: string;
    processingTimeSeconds?: number;
    tokensUsed?: number;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(advancedReadings)
    .set({
      executiveSummary: analysis.executiveSummary,
      detailedAnalysis: analysis.detailedAnalysis,
      stunningInsights: analysis.stunningInsights || null,
      moleAnalysis: analysis.moleAnalysis,
      compatibilityAnalysis: analysis.compatibilityAnalysis,
      decadeTimeline: analysis.decadeTimeline,
      processingTimeSeconds: analysis.processingTimeSeconds || null,
      tokensUsed: analysis.tokensUsed || null,
      status: "completed",
      updatedAt: new Date(),
    })
    .where(eq(advancedReadings.id, readingId));
}

// Update advanced reading PDF path
export async function updateAdvancedReadingPdfPath(
  readingId: string,
  pdfPath: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(advancedReadings)
    .set({
      pdfPath,
      updatedAt: new Date(),
    })
    .where(eq(advancedReadings.id, readingId));
}

// Delete advanced reading
export async function deleteAdvancedReading(readingId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Delete images first
  await db.delete(advancedImages).where(eq(advancedImages.advancedReadingId, readingId));

  // Delete reading
  await db.delete(advancedReadings).where(eq(advancedReadings.id, readingId));
}

// Create advanced image
export async function createAdvancedImage(
  advancedReadingId: string,
  imageType: string,
  filePath: string,
  qualityScore?: number
): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const imageId = generateId();
  const newImage: InsertAdvancedImage = {
    id: imageId,
    advancedReadingId,
    imageType: imageType as any,
    filePath,
    qualityScore: qualityScore || null,
  };

  await db.insert(advancedImages).values(newImage);
  return imageId;
}

// Get advanced reading images
export async function getAdvancedReadingImages(advancedReadingId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(advancedImages)
    .where(eq(advancedImages.advancedReadingId, advancedReadingId));
}

// Get all advanced readings (admin only)
export async function getAllAdvancedReadings() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(advancedReadings)
    .orderBy(desc(advancedReadings.createdAt));
}

