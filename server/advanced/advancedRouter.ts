/**
 * Advanced Reading tRPC Router (Admin-Only)
 * 
 * All procedures require admin role - completely isolated from standard reading routes
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../_core/trpc";
import { nanoid } from "nanoid";
import {
  createAdvancedReading,
  getAdvancedReading,
  getUserAdvancedReadings,
  updateAdvancedReadingStatus,
  createAdvancedImage,
  getAdvancedReadingImages,
  createAdvancedAnalysis,
  getAdvancedAnalysis,
  updateAdvancedAnalysisPdf,
} from "./advancedDb";
import { performAdvancedAnalysis } from "./advancedEngine";
import { storagePut } from "../storage";
import { generateAdvancedPDF } from "./advancedPdfGenerator";
import { getReading, getReadingImages } from "../faceReadingDb";

// Admin-only procedure wrapper
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required for advanced readings",
    });
  }
  return next({ ctx });
});

export const advancedReadingRouter = router({
  // Create advanced reading from existing standard reading
  createFromStandard: adminProcedure
    .input(z.object({ standardReadingId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Get standard reading
      const standardReading = await getReading(input.standardReadingId);
      if (!standardReading) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Standard reading not found" });
      }
      if (standardReading.status !== "completed") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Can only enhance completed readings" });
      }

      // Get standard reading images
      const standardImages = await getReadingImages(input.standardReadingId);
      if (standardImages.length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No images found for this reading" });
      }

      // Create advanced reading
      const advancedReadingId = nanoid();
      
      // Map gender from standard reading (unknown → other)
      const gender = standardReading.gender === "unknown" ? "other" : standardReading.gender as "male" | "female" | "other";
      
      const advancedReading = await createAdvancedReading({
        id: advancedReadingId,
        userId: ctx.user.id,
        name: standardReading.name || "Unknown",
        gender,
        dateOfBirth: standardReading.dateOfBirth || undefined,
        status: "processing",
      });

      // Copy images to advanced reading (reference same S3 URLs)
      for (const img of standardImages) {
        await createAdvancedImage({
          id: nanoid(),
          readingId: advancedReadingId,
          imageType: img.imageType,
          filePath: img.filePath,
        });
      }

      // Get image URLs for analysis
      const imageUrls = standardImages.map((img) => img.filePath);

      // Start advanced analysis in background
      performAdvancedAnalysis({
        name: standardReading.name,
        gender: standardReading.gender,
        dateOfBirth: standardReading.dateOfBirth || undefined,
        imageUrls,
      })
        .then(async (result) => {
          // Generate PDF
          const pdfBuffer = await generateAdvancedPDF({
            name: standardReading.name,
            gender: standardReading.gender,
            dateOfBirth: standardReading.dateOfBirth || undefined,
            createdAt: new Date(advancedReading.createdAt).toLocaleDateString(),
            executiveSummary: result.executiveSummary,
            detailedAnalysis: result.detailedAnalysis,
            stunningInsights: result.stunningInsights,
            moleAnalysis: result.moleAnalysis,
            compatibilityAnalysis: result.compatibilityAnalysis,
            decadeTimeline: result.decadeTimeline,
          });

          // Upload PDF to S3
          const { url: pdfUrl } = await storagePut(
            `advanced-readings/${advancedReadingId}/report.pdf`,
            pdfBuffer,
            "application/pdf"
          );

          // Save analysis to database
          await createAdvancedAnalysis({
            id: nanoid(),
            readingId: advancedReadingId,
            executiveSummary: JSON.stringify(result.executiveSummary),
            detailedAnalysis: JSON.stringify(result.detailedAnalysis),
            stunningInsights: JSON.stringify(result.stunningInsights),
            moleAnalysis: JSON.stringify(result.moleAnalysis),
            compatibilityAnalysis: JSON.stringify(result.compatibilityAnalysis),
            decadeTimeline: JSON.stringify(result.decadeTimeline),
            pdfPath: pdfUrl,
          });

          // Update reading status
          await updateAdvancedReadingStatus(advancedReadingId, "completed");
        })
        .catch(async (error) => {
          console.error("[Advanced Analysis Error]", error);
          await updateAdvancedReadingStatus(
            advancedReadingId,
            "failed",
            error.message
          );
        });

      return { advancedReadingId, message: "Advanced reading created and analysis started" };
    }),

  // Create new advanced reading
  create: adminProcedure
    .input(
      z.object({
        name: z.string(),
        gender: z.enum(["male", "female", "other"]),
        dateOfBirth: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const readingId = nanoid();
      
      const reading = await createAdvancedReading({
        id: readingId,
        userId: ctx.user.id,
        name: input.name,
        gender: input.gender,
        dateOfBirth: input.dateOfBirth,
        status: "pending",
      });

      return reading;
    }),

  // Upload image for advanced reading
  uploadImage: adminProcedure
    .input(
      z.object({
        readingId: z.string(),
        imageType: z.string(),
        imageData: z.string(), // base64
        mimeType: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const imageId = nanoid();
      const buffer = Buffer.from(input.imageData, "base64");
      
      // Upload to S3
      const { key, url } = await storagePut(
        `advanced-readings/${input.readingId}/${imageId}.jpg`,
        buffer,
        input.mimeType
      );

      // Save to database
      const image = await createAdvancedImage({
        id: imageId,
        readingId: input.readingId,
        imageType: input.imageType,
        filePath: url,
      });

      return image;
    }),

  // Start advanced analysis (background job)
  startAnalysis: adminProcedure
    .input(z.object({ readingId: z.string() }))
    .mutation(async ({ input }) => {
      const reading = await getAdvancedReading(input.readingId);
      if (!reading) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Reading not found" });
      }

      // Update status to processing
      await updateAdvancedReadingStatus(input.readingId, "processing");

      // Get all images
      const images = await getAdvancedReadingImages(input.readingId);
      const imageUrls = images.map((img) => img.filePath);

      // Perform analysis in background (don't await)
      performAdvancedAnalysis({
        name: reading.name,
        gender: reading.gender,
        dateOfBirth: reading.dateOfBirth || undefined,
        imageUrls,
      })
        .then(async (result) => {
          // Generate PDF
          const pdfBuffer = await generateAdvancedPDF({
            name: reading.name,
            gender: reading.gender,
            dateOfBirth: reading.dateOfBirth || undefined,
            createdAt: new Date(reading.createdAt).toLocaleDateString(),
            executiveSummary: result.executiveSummary,
            detailedAnalysis: result.detailedAnalysis,
            stunningInsights: result.stunningInsights,
            moleAnalysis: result.moleAnalysis,
            compatibilityAnalysis: result.compatibilityAnalysis,
            decadeTimeline: result.decadeTimeline,
          });

          // Upload PDF to S3
          const { url: pdfUrl } = await storagePut(
            `advanced-readings/${input.readingId}/report.pdf`,
            pdfBuffer,
            "application/pdf"
          );

          // Save analysis to database
          await createAdvancedAnalysis({
            id: nanoid(),
            readingId: input.readingId,
            executiveSummary: JSON.stringify(result.executiveSummary),
            detailedAnalysis: JSON.stringify(result.detailedAnalysis),
            stunningInsights: JSON.stringify(result.stunningInsights),
            moleAnalysis: JSON.stringify(result.moleAnalysis),
            compatibilityAnalysis: JSON.stringify(result.compatibilityAnalysis),
            decadeTimeline: JSON.stringify(result.decadeTimeline),
            pdfPath: pdfUrl,
          });

          // Update reading status
          await updateAdvancedReadingStatus(input.readingId, "completed");
        })
        .catch(async (error) => {
          console.error("[Advanced Analysis Error]", error);
          await updateAdvancedReadingStatus(
            input.readingId,
            "failed",
            error.message
          );
        });

      return { success: true, message: "Analysis started" };
    }),

  // Get all advanced readings for current user
  list: adminProcedure.query(async ({ ctx }) => {
    return await getUserAdvancedReadings(ctx.user.id);
  }),

  // Get single advanced reading with analysis
  get: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const reading = await getAdvancedReading(input.id);
      if (!reading) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Reading not found" });
      }

      const analysis = await getAdvancedAnalysis(input.id);
      const images = await getAdvancedReadingImages(input.id);

      return {
        reading,
        analysis: analysis
          ? {
              ...analysis,
              executiveSummary: JSON.parse(analysis.executiveSummary || "{}"),
              detailedAnalysis: JSON.parse(analysis.detailedAnalysis || "{}"),
              stunningInsights: JSON.parse(analysis.stunningInsights || "{}"),
              moleAnalysis: JSON.parse(analysis.moleAnalysis || "{}"),
              compatibilityAnalysis: JSON.parse(analysis.compatibilityAnalysis || "{}"),
              decadeTimeline: JSON.parse(analysis.decadeTimeline || "{}"),
            }
          : null,
        images,
      };
    }),
});

