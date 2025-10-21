import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "./db";
import { readings, users, feedback, images } from "../drizzle/schema";
import { eq, desc, count, sql } from "drizzle-orm";

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

export const adminRouter = router({
  // Get dashboard statistics
  getStats: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    }

    // Total users
    const totalUsersResult = await db.select({ count: count() }).from(users);
    const totalUsers = totalUsersResult[0]?.count || 0;

    // Total readings
    const totalReadingsResult = await db.select({ count: count() }).from(readings);
    const totalReadings = totalReadingsResult[0]?.count || 0;

    // Completed readings
    const completedReadingsResult = await db
      .select({ count: count() })
      .from(readings)
      .where(eq(readings.status, "completed"));
    const completedReadings = completedReadingsResult[0]?.count || 0;

    // Processing readings
    const processingReadingsResult = await db
      .select({ count: count() })
      .from(readings)
      .where(eq(readings.status, "processing"));
    const processingReadings = processingReadingsResult[0]?.count || 0;

    // Failed readings
    const failedReadingsResult = await db
      .select({ count: count() })
      .from(readings)
      .where(eq(readings.status, "failed"));
    const failedReadings = failedReadingsResult[0]?.count || 0;

    // Total feedback
    const totalFeedbackResult = await db.select({ count: count() }).from(feedback);
    const totalFeedback = totalFeedbackResult[0]?.count || 0;

    // Average rating
    const avgRatingResult = await db
      .select({ avg: sql<number>`AVG(${feedback.overallRating})` })
      .from(feedback);
    const avgRating = avgRatingResult[0]?.avg || 0;

    // Total images
    const totalImagesResult = await db.select({ count: count() }).from(images);
    const totalImages = totalImagesResult[0]?.count || 0;

    return {
      totalUsers,
      totalReadings,
      completedReadings,
      processingReadings,
      failedReadings,
      totalFeedback,
      avgRating: Math.round(avgRating * 10) / 10,
      totalImages,
      completionRate: totalReadings > 0 ? Math.round((completedReadings / totalReadings) * 100) : 0,
    };
  }),

  // Get all readings with user info
  getAllReadings: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        status: z.enum(["pending", "processing", "completed", "failed"]).optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      }

      let query = db
        .select({
          reading: readings,
          user: {
            id: users.id,
            name: users.name,
            email: users.email,
          },
        })
        .from(readings)
        .leftJoin(users, eq(readings.userId, users.id))
        .orderBy(desc(readings.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      if (input.status) {
        query = query.where(eq(readings.status, input.status)) as any;
      }

      const results = await query;

      return results.map((r) => ({
        ...r.reading,
        user: r.user,
      }));
    }),

  // Get all users
  getAllUsers: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      }

      const usersList = await db
        .select()
        .from(users)
        .orderBy(desc(users.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      // Get reading counts for each user
      const usersWithCounts = await Promise.all(
        usersList.map(async (user) => {
          const readingCountResult = await db
            .select({ count: count() })
            .from(readings)
            .where(eq(readings.userId, user.id));
          const readingCount = readingCountResult[0]?.count || 0;

          return {
            ...user,
            readingCount,
          };
        })
      );

      return usersWithCounts;
    }),

  // Get all feedback
  getAllFeedback: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      }

      const feedbackList = await db
        .select({
          feedback: feedback,
          reading: {
            id: readings.id,
            version: readings.version,
          },
          user: {
            id: users.id,
            name: users.name,
            email: users.email,
          },
        })
        .from(feedback)
        .leftJoin(readings, eq(feedback.readingId, readings.id))
        .leftJoin(users, eq(readings.userId, users.id))
        .orderBy(desc(feedback.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return feedbackList.map((f) => ({
        ...f.feedback,
        featureAccuracy: JSON.parse(f.feedback.featureAccuracy || "{}"),
        lifeAspectAccuracy: JSON.parse(f.feedback.lifeAspectAccuracy || "{}"),
        reading: f.reading,
        user: f.user,
      }));
    }),

  // Delete reading (admin only)
  deleteReading: adminProcedure
    .input(
      z.object({
        readingId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      }

      // Delete associated images
      await db.delete(images).where(eq(images.readingId, input.readingId));

      // Delete associated feedback
      await db.delete(feedback).where(eq(feedback.readingId, input.readingId));

      // Delete reading
      await db.delete(readings).where(eq(readings.id, input.readingId));

      return { success: true };
    }),

  // Update user role
  updateUserRole: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        role: z.enum(["user", "admin"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      }

      await db.update(users).set({ role: input.role }).where(eq(users.id, input.userId));

      return { success: true };
    }),
});

