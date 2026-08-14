import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { aiRouter } from "./routers/ai";
import * as db from "./db";
import { z } from "zod";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
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
  ai: aiRouter,
  metrics: router({
    get: publicProcedure.query(() => db.getSiteVisitCount()),
    recordVisit: publicProcedure.mutation(() => db.recordSiteVisit()),
  }),
  feedback: router({
    listPublished: publicProcedure.query(() => db.getPublishedFeedback()),
    submit: publicProcedure.input(z.object({ rating: z.number().int().min(1).max(5), comment: z.string().trim().min(10).max(800) })).mutation(({ input }) => db.submitVisitorFeedback(input)),
  }),
  interactions: router({
    visitorCount: publicProcedure.query(() => db.getUniqueVisitorCount()),
    recordVisitor: publicProcedure.input(z.object({ visitorId: z.string().uuid() })).mutation(({ input }) => db.recordAnonymousVisitor(input.visitorId)),
    listComments: publicProcedure.input(z.object({ pageKey: z.string().trim().min(1).max(160), visitorId: z.string().uuid().optional() })).query(({ input }) => db.getPublishedComments(input.pageKey, input.visitorId)),
    submitComment: publicProcedure.input(z.object({ pageKey: z.string().trim().min(1).max(160), displayName: z.string().trim().min(2).max(64), body: z.string().trim().min(4).max(800), avatarKind: z.enum(["wave", "spark", "leaf", "star"]).default("wave") })).mutation(({ input }) => db.submitSiteComment(input)),
    react: publicProcedure.input(z.object({ commentId: z.number().int().positive(), visitorId: z.string().uuid(), reaction: z.enum(["heart", "broken"]).nullable() })).mutation(({ input }) => db.setCommentReaction(input)),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
