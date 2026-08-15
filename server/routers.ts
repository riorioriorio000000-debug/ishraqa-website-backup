import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { notifyOwner } from "./_core/notification";
import { aiRouter } from "./routers/ai";
import * as db from "./db";
import { storagePut } from "./storage";
import { z } from "zod";

const avatarUploadSchema = z.object({
  visitorId: z.string().uuid(),
  name: z.string().trim().min(1).max(120),
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  dataUrl: z.string().min(32).max(2_800_000),
});

function decodeAvatarData(input: z.infer<typeof avatarUploadSchema>) {
  const prefix = `data:${input.mimeType};base64,`;
  if (!input.dataUrl.startsWith(prefix)) throw new Error("صيغة صورة الملف الشخصي غير مطابقة.");
  const encoded = input.dataUrl.slice(prefix.length);
  if (!encoded || !/^[A-Za-z0-9+/]+={0,2}$/.test(encoded)) throw new Error("تعذر قراءة صورة الملف الشخصي.");
  const data = Buffer.from(encoded, "base64");
  if (!data.length || data.length > 2_000_000) throw new Error("حجم صورة الملف الشخصي يجب ألا يتجاوز 2 ميغابايت.");
  return data;
}

function safeUploadName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "avatar";
}

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
    submit: publicProcedure.input(z.object({ rating: z.number().int().min(1).max(5), comment: z.string().trim().max(800).optional() })).mutation(({ input }) => db.submitVisitorFeedback(input)),
    submitAssistantAnswer: publicProcedure.input(z.object({ id: z.string().uuid(), rating: z.number().int().min(1).max(5), service: z.enum(["cleaning", "maintenance", "moving", "general"]), city: z.string().trim().min(2).max(96).optional(), contentCardIds: z.array(z.string().trim().min(1).max(120)).max(3), note: z.string().trim().min(2).max(600).optional() })).mutation(({ input }) => db.upsertAssistantAnswerFeedback(input)),
    assistantAnswerSummary: publicProcedure.query(() => db.getAssistantAnswerFeedbackSummary()),
  }),
  booking: router({
    submit: publicProcedure.input(z.object({
      cityDetail: z.string().trim().max(160).optional(),
      serviceDetail: z.string().trim().max(220).optional(),
      details: z.string().trim().max(700).optional(),
      dateDetail: z.string().trim().max(160).optional(),
      timeDetail: z.string().trim().max(160).optional(),
      phone: z.string().trim().max(40).optional(),
    })).mutation(async ({ input }) => {
      const value = (item?: string) => item?.trim() || "لم يُحدَّد";
      const notificationSent = await notifyOwner({
        title: "طلب خدمة جديد من موقع الإشراقة",
        content: `الخدمة: ${value(input.serviceDetail)}\nالمدينة أو الحي: ${value(input.cityDetail)}\nالموعد: ${value(input.dateDetail)} — ${value(input.timeDetail)}\nرقم التواصل: ${value(input.phone)}\nالتفاصيل: ${value(input.details)}`,
      });
      return { accepted: true as const, notificationSent };
    }),
  }),
  interactions: router({
    visitorCount: publicProcedure.query(() => db.getUniqueVisitorCount()),
    recordVisitor: publicProcedure.input(z.object({ visitorId: z.string().uuid() })).mutation(({ input }) => db.recordAnonymousVisitor(input.visitorId)),
    servicePageStats: publicProcedure.query(() => db.getMostVisitedServicePages()),
    recordServicePageView: publicProcedure.input(z.object({ pagePath: z.enum(["/services", "/calculator", "/booking", "/customer-service"]) })).mutation(({ input }) => db.recordServicePageView(input.pagePath)),
    listComments: publicProcedure.input(z.object({ pageKey: z.string().trim().min(1).max(160), visitorId: z.string().uuid().optional() })).query(({ input }) => db.getPublishedComments(input.pageKey, input.visitorId)),
    articleFeedback: publicProcedure.input(z.object({ pageKey: z.string().trim().min(1).max(160), visitorId: z.string().uuid().optional() })).query(({ input }) => db.getArticleFeedbackSummary(input.pageKey, input.visitorId)),
    articleFeedbackSummaries: publicProcedure.input(z.object({ pageKeys: z.array(z.string().trim().min(1).max(160)).min(1).max(80), visitorId: z.string().uuid().optional() })).query(({ input }) => db.getArticleFeedbackSummaries(input.pageKeys, input.visitorId)),
    submitArticleFeedback: publicProcedure.input(z.object({ pageKey: z.string().trim().min(1).max(160), visitorId: z.string().uuid(), rating: z.number().int().min(1).max(5), isPublic: z.boolean() })).mutation(({ input }) => db.upsertArticleFeedback(input)),
    uploadAvatar: publicProcedure.input(avatarUploadSchema).mutation(async ({ input }) => {
      const uploaded = await storagePut(`comment-avatars/${input.visitorId}/${Date.now()}-${safeUploadName(input.name)}`, decodeAvatarData(input), input.mimeType);
      return { url: uploaded.url };
    }),
    submitComment: publicProcedure.input(z.object({ pageKey: z.string().trim().min(1).max(160), visitorId: z.string().uuid(), displayName: z.string().trim().min(2).max(64), body: z.string().trim().min(4).max(800), avatarKind: z.enum(["wave", "spark", "leaf", "star"]).default("wave"), avatarUrl: z.string().trim().max(1024).regex(/^\/manus-storage\//).nullable().optional() })).mutation(({ input }) => db.submitSiteComment(input)),
    updateComment: publicProcedure.input(z.object({ commentId: z.number().int().positive(), pageKey: z.string().trim().min(1).max(160), visitorId: z.string().uuid(), displayName: z.string().trim().min(2).max(64), body: z.string().trim().min(4).max(800), avatarKind: z.enum(["wave", "spark", "leaf", "star"]).default("wave"), avatarUrl: z.string().trim().max(1024).regex(/^\/manus-storage\//).nullable().optional() })).mutation(({ input }) => db.updateVisitorComment(input)),
    deleteComment: publicProcedure.input(z.object({ commentId: z.number().int().positive(), visitorId: z.string().uuid() })).mutation(({ input }) => db.deleteVisitorComment(input.commentId, input.visitorId)),
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
