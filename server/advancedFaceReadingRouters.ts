import { z } from "zod";
import { router, protectedProcedure } from "./_core/trpc";
import {
  createAdvancedReading,
  getAdvancedReading,
  getUserAdvancedReadings,
  updateAdvancedReadingStatus,
  updateAdvancedReadingAnalysis,
  updateAdvancedReadingPdfPath,
  deleteAdvancedReading,
  createAdvancedImage,
  getAdvancedReadingImages,
  getAllAdvancedReadings,
} from "./advancedFaceReadingDb";
import { storagePut, storageGet } from "./storage";
import { analyzeAdvancedFace } from "./advancedFaceReadingEngine";
import { generateStunningInsights } from "./stunningInsightsEngine";
import { TRPCError } from "@trpc/server";
import { getUser } from "./db";

// Admin-only procedure - checks if user has admin role
const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "This feature is only available to administrators",
    });
  }
  return next({ ctx });
});

export const advancedFaceReadingRouter = router({
  // Create a new advanced reading (admin only)
  createReading: adminProcedure
    .input(z.object({
      name: z.string().optional(),
      gender: z.enum(["male", "female", "unknown"]).default("unknown"),
      dateOfBirth: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Update user's date of birth if provided
      if (input.dateOfBirth) {
        const { getDb } = await import("./db");
        const { users } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        const db = await getDb();
        if (db) {
          await db.update(users).set({ dateOfBirth: input.dateOfBirth }).where(eq(users.id, ctx.user.id));
        }
      }
      const readingId = await createAdvancedReading(ctx.user.id, input.name, input.gender);
      return { readingId };
    }),

  // Get admin's advanced readings
  getMyReadings: adminProcedure.query(async ({ ctx }) => {
    const readings = await getUserAdvancedReadings(ctx.user.id);
    return readings;
  }),

  // Get all advanced readings (admin only)
  getAllReadings: adminProcedure.query(async () => {
    const readings = await getAllAdvancedReadings();
    return readings;
  }),

  // Get specific advanced reading (admin only, can view any reading)
  getReading: adminProcedure
    .input(z.object({ readingId: z.string() }))
    .query(async ({ input }) => {
      const reading = await getAdvancedReading(input.readingId);
      if (!reading) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Advanced reading not found",
        });
      }
      return reading;
    }),

  // Upload image for advanced reading
  uploadImage: adminProcedure
    .input(z.object({
      readingId: z.string(),
      imageType: z.enum([
        "frontal_neutral",
        "frontal_smile",
        "left_profile",
        "right_profile",
        "three_quarter_left",
        "three_quarter_right",
        "closeup_eyes",
        "closeup_nose",
        "closeup_mouth",
        "closeup_left_ear",
        "closeup_right_ear",
      ]),
      imageData: z.string(), // base64 encoded image
    }))
    .mutation(async ({ ctx, input }) => {
      const reading = await getAdvancedReading(input.readingId);
      if (!reading) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Advanced reading not found",
        });
      }

      if (reading.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only upload images to your own advanced readings",
        });
      }

      // Decode base64 image
      const imageBuffer = Buffer.from(input.imageData.split(",")[1], "base64");

      // Upload to S3
      const fileName = `advanced-readings/${input.readingId}/${input.imageType}.jpg`;
      const { url } = await storagePut(fileName, imageBuffer, "image/jpeg");

      // Save image record
      await createAdvancedImage(input.readingId, input.imageType, url);

      // Update reading status to uploading
      await updateAdvancedReadingStatus(input.readingId, "uploading");

      return { success: true, imageUrl: url };
    }),

  // Get images for advanced reading
  getImages: adminProcedure
    .input(z.object({ readingId: z.string() }))
    .query(async ({ input }) => {
      const images = await getAdvancedReadingImages(input.readingId);
      return images;
    }),

  // Start advanced analysis
  startAnalysis: adminProcedure
    .input(z.object({ readingId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const reading = await getAdvancedReading(input.readingId);
      if (!reading) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Advanced reading not found",
        });
      }

      if (reading.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only analyze your own advanced readings",
        });
      }

      // Check if all 11 images are uploaded
      const images = await getAdvancedReadingImages(input.readingId);
      if (images.length < 11) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Please upload all 11 photos before starting analysis. Currently uploaded: ${images.length}/11`,
        });
      }

      // Update status to processing
      await updateAdvancedReadingStatus(input.readingId, "processing");

      // Start async analysis (don't await - let it run in background)
      performAdvancedAnalysis(input.readingId, ctx.user.id).catch((error) => {
        console.error("Advanced analysis failed:", error);
        updateAdvancedReadingStatus(input.readingId, "failed", error.message);
      });

      return { success: true, message: "Advanced analysis started" };
    }),

  // Delete advanced reading
  deleteReading: adminProcedure
    .input(z.object({ readingId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const reading = await getAdvancedReading(input.readingId);
      if (!reading) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Advanced reading not found",
        });
      }

      if (reading.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only delete your own advanced readings",
        });
      }

      await deleteAdvancedReading(input.readingId);
      return { success: true };
    }),

  // Regenerate advanced analysis
  regenerateAnalysis: adminProcedure
    .input(z.object({ readingId: z.string() }))
    .mutation(async ({ input }) => {
      const reading = await getAdvancedReading(input.readingId);
      if (!reading) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Advanced reading not found",
        });
      }

      // Update status to processing
      await updateAdvancedReadingStatus(input.readingId, "processing");

      // Start async analysis
      performAdvancedAnalysis(input.readingId, reading.userId).catch((error) => {
        console.error("Advanced analysis regeneration failed:", error);
        updateAdvancedReadingStatus(input.readingId, "failed", error.message);
      });

      return { success: true, message: "Advanced analysis regeneration started" };
    }),
});

// Background analysis function with timeout protection
async function performAdvancedAnalysis(readingId: string, userId: string) {
  const TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes for advanced analysis
  const startTime = Date.now();

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error("Advanced analysis timeout: Processing took longer than 15 minutes"));
    }, TIMEOUT_MS);
  });

  const analysisPromise = (async () => {
    try {
      // Get user info for age
      const user = await getUser(userId);
      const userAge = user?.dateOfBirth
        ? new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear()
        : 30;

      // Get reading info
      const reading = await getAdvancedReading(readingId);
      if (!reading) throw new Error("Advanced reading not found");

      // Get images
      const images = await getAdvancedReadingImages(readingId);
      const imageUrls = images.map((img) => img.filePath);

      // Perform advanced AI analysis with Claude
      console.log("Starting advanced face reading analysis with Claude API...");
      const analysis = await analyzeAdvancedFace(
        imageUrls,
        userAge,
        reading.name || undefined,
        reading.gender
      );
      console.log("Advanced face reading analysis complete!");

      // Generate stunning insights (reuse from standard system)
      console.log("Generating stunning insights...");
      const stunningInsights = await generateStunningInsights(imageUrls, userAge, reading.gender);
      console.log("Stunning insights complete!");

      // Calculate processing time
      const processingTimeSeconds = Math.floor((Date.now() - startTime) / 1000);

      // Save analysis to database
      await updateAdvancedReadingAnalysis(readingId, {
        executiveSummary: JSON.stringify(analysis.executiveSummary),
        detailedAnalysis: JSON.stringify(analysis.detailedAnalysis),
        stunningInsights: JSON.stringify(stunningInsights),
        moleAnalysis: JSON.stringify(analysis.moleAnalysis),
        compatibilityAnalysis: JSON.stringify(analysis.compatibilityAnalysis),
        decadeTimeline: JSON.stringify(analysis.decadeTimeline),
        processingTimeSeconds,
        tokensUsed: 0, // Will be tracked in future
      });

      // Generate advanced PDF report
      console.log("Generating advanced PDF report...");
      const { generateAdvancedPDF } = await import("./advancedPdfGenerator");
      const pdfBuffer = await generateAdvancedPDF({
        userName: reading.name || "User",
        readingDate: new Date().toLocaleDateString(),
        executiveSummary: analysis.executiveSummary,
        detailedAnalysis: analysis.detailedAnalysis,
        stunningInsights,
        moleAnalysis: analysis.moleAnalysis,
        compatibilityAnalysis: analysis.compatibilityAnalysis,
        decadeTimeline: analysis.decadeTimeline,
        images: images.map((img) => ({ type: img.imageType, url: img.filePath })),
      });

      // Upload PDF to S3
      const pdfFileName = `advanced-readings/${readingId}/report.pdf`;
      const { url: pdfUrl } = await storagePut(pdfFileName, pdfBuffer, "application/pdf");
      await updateAdvancedReadingPdfPath(readingId, pdfUrl);
      console.log("Advanced PDF report generated and uploaded!");

      console.log(`✅ Advanced analysis complete in ${processingTimeSeconds} seconds`);
    } catch (error) {
      console.error("❌ Advanced analysis error:", error);
      await updateAdvancedReadingStatus(
        readingId,
        "failed",
        error instanceof Error ? error.message : String(error)
      );
      throw error;
    }
  })();

  try {
    await Promise.race([analysisPromise, timeoutPromise]);
  } catch (error) {
    await updateAdvancedReadingStatus(
      readingId,
      "failed",
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
}

