import { z } from "zod";
import { router, protectedProcedure } from "./_core/trpc";
import {
  createReading,
  getReading,
  getUserReadings,
  updateReadingStatus,
  updateReadingAnalysis,
  updateReadingPdfPath,
  deleteReading,
  createImage,
  getReadingImages,
  createFeedback,
  getReadingFeedback,
} from "./faceReadingDb";
import { storagePut, storageGet } from "./storage";
import { analyzeFace } from "./faceReadingEngine";
import { TRPCError } from "@trpc/server";

export const faceReadingRouter = router({
  // Create a new reading
  createReading: protectedProcedure.mutation(async ({ ctx }) => {
    const readingId = await createReading(ctx.user.id);
    return { readingId };
  }),

  // Get user's readings
  getMyReadings: protectedProcedure.query(async ({ ctx }) => {
    const readings = await getUserReadings(ctx.user.id);
    return readings;
  }),

  // Get specific reading
  getReading: protectedProcedure
    .input(z.object({ readingId: z.string() }))
    .query(async ({ ctx, input }) => {
      const reading = await getReading(input.readingId);
      if (!reading) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Reading not found" });
      }
      if (reading.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }

      // Get images
      const images = await getReadingImages(input.readingId);

      // Parse JSON fields
      const executiveSummary = reading.executiveSummary ? JSON.parse(reading.executiveSummary) : null;
      const detailedAnalysis = reading.detailedAnalysis ? JSON.parse(reading.detailedAnalysis) : null;

      // Generate presigned URLs for images
      const imagesWithUrls = await Promise.all(
        images.map(async (img) => {
          const { url } = await storageGet(img.filePath);
          return { ...img, url };
        })
      );

      return {
        ...reading,
        executiveSummary,
        detailedAnalysis,
        images,
      };
    }),

  // Upload image for reading
  uploadImage: protectedProcedure
    .input(
      z.object({
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
          "closeup_ears",
        ]),
        imageData: z.string(), // base64 encoded
      })
    )
    .mutation(async ({ ctx, input }) => {
      const reading = await getReading(input.readingId);
      if (!reading) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Reading not found" });
      }
      if (reading.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }

      // Decode base64 image
      const imageBuffer = Buffer.from(input.imageData.split(",")[1], "base64");

      // Upload to S3
      const fileName = `readings/${input.readingId}/${input.imageType}_${Date.now()}.jpg`;
      const { url } = await storagePut(fileName, imageBuffer, "image/jpeg");

      // Save to database
      await createImage(input.readingId, input.imageType, url);

      // Update reading status
      await updateReadingStatus(input.readingId, "uploading");

      return { success: true, url };
    }),

  // Start analysis
  startAnalysis: protectedProcedure
    .input(z.object({ readingId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const reading = await getReading(input.readingId);
      if (!reading) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Reading not found" });
      }
      if (reading.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }

      // Get all images
      const images = await getReadingImages(input.readingId);
      if (images.length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No images uploaded" });
      }

      // Update status to processing
      await updateReadingStatus(input.readingId, "processing");

      // Start analysis in background (don't await)
      performAnalysis(input.readingId, images.map(img => img.filePath), ctx.user.id).catch(error => {
        console.error("Analysis failed:", error);
        updateReadingStatus(input.readingId, "failed", error.message);
      });

      return { success: true, message: "Analysis started" };
    }),

  // Delete reading
  deleteReading: protectedProcedure
    .input(z.object({ readingId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const reading = await getReading(input.readingId);
      if (!reading) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Reading not found" });
      }
      if (reading.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }

      await deleteReading(input.readingId);
      return { success: true };
    }),

  // Submit feedback
  submitFeedback: protectedProcedure
    .input(
      z.object({
        readingId: z.string(),
        overallRating: z.number().min(1).max(5),
        featureAccuracy: z.record(z.string(), z.boolean()),
        lifeAspectAccuracy: z.record(z.string(), z.boolean()),
        specificFeedback: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const reading = await getReading(input.readingId);
      if (!reading) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Reading not found" });
      }
      if (reading.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }

      await createFeedback(
        input.readingId,
        ctx.user.id,
        input.overallRating,
        JSON.stringify(input.featureAccuracy),
        JSON.stringify(input.lifeAspectAccuracy),
        input.specificFeedback || ""
      );

      return { success: true };
    }),

  // Get feedback for reading
  getFeedback: protectedProcedure
    .input(z.object({ readingId: z.string() }))
    .query(async ({ ctx, input }) => {
      const reading = await getReading(input.readingId);
      if (!reading) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Reading not found" });
      }
      if (reading.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }

      const feedback = await getReadingFeedback(input.readingId);
      if (!feedback) return null;

      return {
        ...feedback,
        featureAccuracy: JSON.parse(feedback.featureAccuracy || "{}"),
        lifeAspectAccuracy: JSON.parse(feedback.lifeAspectAccuracy || "{}"),
      };
    }),
});

// Background analysis function
async function performAnalysis(readingId: string, imageUrls: string[], userId: string) {
  try {
    // Get user to calculate age
    const { getUser } = await import("./db");
    const user = await getUser(userId);
    
    // Calculate age (default to 30 if no DOB)
    let userAge = 30;
    // Note: We'll need to add dateOfBirth to user schema later
    
    // Perform AI analysis
    const analysis = await analyzeFace(imageUrls, userAge);

    // Save results
    await updateReadingAnalysis(
      readingId,
      JSON.stringify(analysis.executiveSummary),
      JSON.stringify(analysis.detailedAnalysis)
    );
  } catch (error) {
    console.error("Analysis error:", error);
    throw error;
  }
}

