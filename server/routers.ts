import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { faceReadingRouter } from "./faceReadingRouters";
import { adminRouter } from "./adminRouter";
import { aiMonitoringRouter } from "./aiMonitoringRouter";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Face reading feature
  faceReading: faceReadingRouter,

  // Admin features
  admin: adminRouter,

  // AI Monitoring
  aiMonitoring: aiMonitoringRouter,
});

export type AppRouter = typeof appRouter;
