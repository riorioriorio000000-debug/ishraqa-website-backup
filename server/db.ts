import { and, desc, eq, gte, inArray, isNull, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, articleFeedback, assistantAnswerFeedback, commentReactions, commentReplies, commentReplyReactions, contentReports, contentRestrictions, servicePageMetrics, siteComments, siteMetrics, siteNotifications, siteVisitors, users, visitorFeedback, visitorNotificationPreferences } from "../drizzle/schema";
import { makeReactionId } from "../shared/interactionHelpers";
import { directCommentStatus, normalizeCommentSubmission, passesAutomaticCommentScreening } from "./commentSubmissionPolicy";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

type NotificationType = "reply" | "reaction" | "comment_published" | "comment_deleted" | "comment_reverted" | "comment_restricted" | "report_review";
type NotificationEntityType = "comment" | "reply" | "report" | "system";
type ReportReason = "abuse" | "illegal" | "profile" | "name" | "other";
type ReportVerdict = "remove_and_restrict" | "no_violation" | "needs_review";

function notificationTargetPath(pageKey: string) {
  if (pageKey.startsWith("page:")) return pageKey.slice(5) || "/";
  return `/articles/${encodeURIComponent(pageKey)}`;
}

export async function getActiveVisitorRestriction(visitorId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const [restriction] = await db.select().from(contentRestrictions)
    .where(and(eq(contentRestrictions.visitorId, visitorId), eq(contentRestrictions.isActive, true)))
    .limit(1);
  return restriction;
}

export async function getVisitorNotificationPreferences(visitorId: string) {
  const db = await getDb();
  const defaults = { reactionNotificationsEnabled: true };
  if (!db) return defaults;
  const [preferences] = await db.select({ reactionNotificationsEnabled: visitorNotificationPreferences.reactionNotificationsEnabled })
    .from(visitorNotificationPreferences)
    .where(eq(visitorNotificationPreferences.visitorId, visitorId))
    .limit(1);
  return preferences || defaults;
}

export async function updateVisitorNotificationPreferences(input: { visitorId: string; reactionNotificationsEnabled: boolean }) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حاليًا");
  await db.insert(visitorNotificationPreferences).values({
    visitorId: input.visitorId,
    reactionNotificationsEnabled: input.reactionNotificationsEnabled,
  }).onDuplicateKeyUpdate({
    set: { reactionNotificationsEnabled: input.reactionNotificationsEnabled, updatedAt: new Date() },
  });
  return { reactionNotificationsEnabled: input.reactionNotificationsEnabled };
}

export async function createVisitorNotification(input: {
  visitorId: string;
  type: NotificationType;
  title: string;
  message: string;
  targetPath?: string | null;
  entityType?: NotificationEntityType | null;
  entityId?: number | null;
}) {
  const db = await getDb();
  if (!db) return null;
  if (input.type === "reaction") {
    const preferences = await getVisitorNotificationPreferences(input.visitorId);
    if (!preferences.reactionNotificationsEnabled) return null;
  }
  await db.insert(siteNotifications).values({
    visitorId: input.visitorId,
    type: input.type,
    title: input.title.slice(0, 160),
    message: input.message.slice(0, 900),
    targetPath: input.targetPath?.slice(0, 280) || null,
    entityType: input.entityType || null,
    entityId: input.entityId ?? null,
  });
  const [created] = await db.select({ id: siteNotifications.id }).from(siteNotifications)
    .where(and(eq(siteNotifications.visitorId, input.visitorId), eq(siteNotifications.title, input.title.slice(0, 160))))
    .orderBy(desc(siteNotifications.id)).limit(1);
  return created?.id ?? null;
}

export async function getVisitorNotifications(visitorId: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(siteNotifications)
    .where(eq(siteNotifications.visitorId, visitorId))
    .orderBy(desc(siteNotifications.createdAt), desc(siteNotifications.id))
    .limit(80);
}

export async function getUnreadNotificationCount(visitorId: string) {
  const db = await getDb();
  if (!db) return { count: 0 };
  const [result] = await db.select({ count: sql<number>`count(*)` })
    .from(siteNotifications)
    .where(and(eq(siteNotifications.visitorId, visitorId), eq(siteNotifications.isRead, false)));
  return { count: Number(result?.count || 0) };
}

export async function markVisitorNotificationsRead(visitorId: string, ids?: number[]) {
  const db = await getDb();
  if (!db) return { updated: 0 };
  const normalizedIds = Array.from(new Set((ids || []).filter((id) => Number.isInteger(id) && id > 0)));
  const condition = normalizedIds.length
    ? and(eq(siteNotifications.visitorId, visitorId), inArray(siteNotifications.id, normalizedIds))
    : eq(siteNotifications.visitorId, visitorId);
  const result = await db.update(siteNotifications).set({ isRead: true }).where(condition);
  return { updated: result[0].affectedRows };
}

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function recordSiteVisit() {
  const db = await getDb();
  if (!db) return 0;
  await db.insert(siteMetrics).values({ key: "visits", value: 1 }).onDuplicateKeyUpdate({
    set: { value: sql`${siteMetrics.value} + 1` },
  });
  return getSiteVisitCount();
}

export async function getSiteVisitCount() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select().from(siteMetrics).where(eq(siteMetrics.key, "visits")).limit(1);
  return result[0]?.value ?? 0;
}

export async function recordServicePageView(pagePath: string) {
  const db = await getDb();
  if (!db) return;
  await db.insert(servicePageMetrics).values({ pagePath, views: 1 }).onDuplicateKeyUpdate({
    set: { views: sql`${servicePageMetrics.views} + 1`, updatedAt: new Date() },
  });
}

export async function getMostVisitedServicePages() {
  const db = await getDb();
  if (!db) return [];
  return db.select({ pagePath: servicePageMetrics.pagePath, views: servicePageMetrics.views, updatedAt: servicePageMetrics.updatedAt })
    .from(servicePageMetrics)
    .orderBy(desc(servicePageMetrics.views), desc(servicePageMetrics.updatedAt))
    .limit(4);
}

export async function submitVisitorFeedback(input: { rating: number; comment?: string }) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حاليًا");
  await db.insert(visitorFeedback).values({ rating: input.rating, comment: input.comment?.trim() || null, status: "published" });
  return { accepted: true as const };
}

/** Stores only anonymous quality signals and recommendation categories, not the visitor's question or answer text. */
export async function upsertAssistantAnswerFeedback(input: { id: string; rating: number; service: "cleaning" | "maintenance" | "moving" | "general"; city?: string; contentCardIds: string[]; note?: string }) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حاليًا");
  const contentCardIds = input.contentCardIds.join(",").slice(0, 512);
  await db.insert(assistantAnswerFeedback).values({
    id: input.id,
    rating: input.rating,
    service: input.service,
    city: input.city || null,
    contentCardIds,
    note: input.note?.trim() || null,
  }).onDuplicateKeyUpdate({
    set: { rating: input.rating, service: input.service, city: input.city || null, contentCardIds, note: input.note?.trim() || null, updatedAt: new Date() },
  });
  return { accepted: true as const };
}

export async function getAssistantAnswerFeedbackSummary() {
  const db = await getDb();
  if (!db) return { count: 0, average: 0, noteCount: 0 };
  const rows = await db.select({ rating: assistantAnswerFeedback.rating, note: assistantAnswerFeedback.note }).from(assistantAnswerFeedback);
  const count = rows.length;
  const total = rows.reduce((sum, row) => sum + row.rating, 0);
  return { count, average: count ? Math.round((total / count) * 10) / 10 : 0, noteCount: rows.filter((row) => Boolean(row.note?.trim())).length };
}

export async function getPublishedFeedback() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(visitorFeedback).where(eq(visitorFeedback.status, "published")).orderBy(desc(visitorFeedback.createdAt)).limit(12);
}

export async function recordAnonymousVisitor(visitorId: string) {
  const db = await getDb();
  if (!db) return 0;
  await db.insert(siteVisitors).values({ visitorId, visitCount: 1 }).onDuplicateKeyUpdate({
    set: { visitCount: sql`${siteVisitors.visitCount} + 1`, lastSeenAt: new Date() },
  });
  return getUniqueVisitorCount();
}

export async function getUniqueVisitorCount() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` }).from(siteVisitors);
  return Number(result[0]?.count ?? 0);
}

function makeArticleFeedbackId(pageKey: string, visitorId: string) {
  return `${pageKey}:${visitorId}`;
}

export async function upsertArticleFeedback(input: { pageKey: string; visitorId: string; rating: number; isPublic: boolean }) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حاليًا");
  await db.insert(articleFeedback).values({
    id: makeArticleFeedbackId(input.pageKey, input.visitorId),
    pageKey: input.pageKey,
    visitorId: input.visitorId,
    rating: input.rating,
    isPublic: input.isPublic,
  }).onDuplicateKeyUpdate({
    set: { rating: input.rating, isPublic: input.isPublic, updatedAt: new Date() },
  });
  return { accepted: true as const };
}

export async function getArticleFeedbackSummary(pageKey: string, visitorId?: string) {
  const db = await getDb();
  if (!db) return { count: 0, average: 0, ownRating: null as number | null, ownIsPublic: true };
  const published = await db.select({ rating: articleFeedback.rating })
    .from(articleFeedback)
    .where(and(eq(articleFeedback.pageKey, pageKey), eq(articleFeedback.isPublic, true)));
  const own = visitorId
    ? await db.select({ rating: articleFeedback.rating, isPublic: articleFeedback.isPublic })
      .from(articleFeedback)
      .where(and(eq(articleFeedback.pageKey, pageKey), eq(articleFeedback.visitorId, visitorId)))
      .limit(1)
    : [];
  const count = published.length;
  const average = count ? Math.round((published.reduce((sum, item) => sum + item.rating, 0) / count) * 10) / 10 : 0;
  return { count, average, ownRating: own[0]?.rating ?? null, ownIsPublic: own[0]?.isPublic ?? true };
}

export async function getArticleFeedbackSummaries(pageKeys: string[], visitorId?: string) {
  const db = await getDb();
  const keys = Array.from(new Set(pageKeys.map((key) => key.trim()).filter(Boolean)));
  const empty = Object.fromEntries(keys.map((key) => [key, { count: 0, average: 0, ownRating: null as number | null, ownIsPublic: true }]));
  if (!db || !keys.length) return empty;

  const [published, ownRatings] = await Promise.all([
    db.select({ pageKey: articleFeedback.pageKey, rating: articleFeedback.rating })
      .from(articleFeedback)
      .where(and(inArray(articleFeedback.pageKey, keys), eq(articleFeedback.isPublic, true))),
    visitorId
      ? db.select({ pageKey: articleFeedback.pageKey, rating: articleFeedback.rating, isPublic: articleFeedback.isPublic })
        .from(articleFeedback)
        .where(and(inArray(articleFeedback.pageKey, keys), eq(articleFeedback.visitorId, visitorId)))
      : Promise.resolve([]),
  ]);

  const totals = new Map<string, { count: number; total: number }>();
  for (const item of published) {
    const current = totals.get(item.pageKey) || { count: 0, total: 0 };
    totals.set(item.pageKey, { count: current.count + 1, total: current.total + item.rating });
  }
  const ownByPage = new Map(ownRatings.map((item) => [item.pageKey, item]));
  return Object.fromEntries(keys.map((key) => {
    const total = totals.get(key) || { count: 0, total: 0 };
    const own = ownByPage.get(key);
    return [key, {
      count: total.count,
      average: total.count ? Math.round((total.total / total.count) * 10) / 10 : 0,
      ownRating: own?.rating ?? null,
      ownIsPublic: own?.isPublic ?? true,
    }];
  }));
}

type VisitorOwnedCommentInput = {
  pageKey: string;
  visitorId: string;
  displayName: string;
  body: string;
  avatarKind: string;
  avatarUrl?: string | null;
};

export async function submitSiteComment(input: VisitorOwnedCommentInput) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حاليًا");
  if (await getActiveVisitorRestriction(input.visitorId)) {
    return { accepted: false as const, reason: "comment-restricted" as const };
  }
  const normalized = {
    ...normalizeCommentSubmission(input),
    visitorId: input.visitorId,
    avatarUrl: input.avatarUrl?.trim() || null,
  };
  if (!passesAutomaticCommentScreening(normalized)) return { accepted: false as const, reason: "content-not-allowed" as const };
  const existing = await db.select({ id: siteComments.id })
    .from(siteComments)
    .where(and(eq(siteComments.pageKey, normalized.pageKey), eq(siteComments.visitorId, normalized.visitorId), isNull(siteComments.deletedAt)))
    .limit(1);
  if (existing[0]) return { accepted: false as const, reason: "active-comment-exists" as const, existingCommentId: existing[0].id };
  await db.insert(siteComments).values({
    pageKey: normalized.pageKey,
    visitorId: normalized.visitorId,
    displayName: normalized.displayName,
    body: normalized.body,
    avatarKind: normalized.avatarKind,
    avatarUrl: normalized.avatarUrl,
    status: directCommentStatus,
  });
  const [created] = await db.select({ id: siteComments.id })
    .from(siteComments)
    .where(and(eq(siteComments.pageKey, normalized.pageKey), eq(siteComments.visitorId, normalized.visitorId), isNull(siteComments.deletedAt)))
    .limit(1);
  if (created?.id) {
    void createVisitorNotification({
      visitorId: normalized.visitorId,
      type: "comment_published",
      title: "تم نشر تعليقك",
      message: "أصبح تعليقك ظاهرًا للزوار ويمكنك إدارته من الصفحة نفسها.",
      targetPath: notificationTargetPath(normalized.pageKey),
      entityType: "comment",
      entityId: created.id,
    });
  }
  return { accepted: true as const, commentId: created?.id ?? null };
}

export async function updateVisitorComment(input: VisitorOwnedCommentInput & { commentId: number }) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حاليًا");
  if (await getActiveVisitorRestriction(input.visitorId)) {
    return { updated: false as const, reason: "comment-restricted" as const };
  }
  const normalized = {
    ...normalizeCommentSubmission(input),
    avatarUrl: input.avatarUrl?.trim() || null,
  };
  if (!passesAutomaticCommentScreening(normalized)) return { updated: false as const, reason: "content-not-allowed" as const };
  const existing = await db.select({ id: siteComments.id })
    .from(siteComments)
    .where(and(eq(siteComments.id, input.commentId), eq(siteComments.visitorId, input.visitorId), isNull(siteComments.deletedAt)))
    .limit(1);
  if (!existing[0]) return { updated: false as const };
  await db.update(siteComments).set({
    displayName: normalized.displayName,
    body: normalized.body,
    avatarKind: normalized.avatarKind,
    avatarUrl: normalized.avatarUrl,
    status: directCommentStatus,
    updatedAt: new Date(),
  }).where(eq(siteComments.id, input.commentId));
  return { updated: true as const };
}

export async function deleteVisitorComment(commentId: number, visitorId: string) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حاليًا");
  const existing = await db.select({ id: siteComments.id, pageKey: siteComments.pageKey })
    .from(siteComments)
    .where(and(eq(siteComments.id, commentId), eq(siteComments.visitorId, visitorId), isNull(siteComments.deletedAt)))
    .limit(1);
  if (!existing[0]) return { deleted: false as const };
  await db.update(siteComments).set({ deletedAt: new Date(), updatedAt: new Date() }).where(eq(siteComments.id, commentId));
  void createVisitorNotification({
    visitorId,
    type: "comment_deleted",
    title: "تم حذف تعليقك",
    message: "أزيل تعليقك من الصفحة. يمكنك كتابة تعليق جديد في أي وقت.",
    targetPath: notificationTargetPath(existing[0].pageKey),
    entityType: "comment",
    entityId: commentId,
  });
  return { deleted: true as const };
}

export async function submitCommentReply(input: VisitorOwnedCommentInput & { commentId: number; parentReplyId?: number | null }) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حاليًا");
  if (await getActiveVisitorRestriction(input.visitorId)) {
    return { accepted: false as const, reason: "comment-restricted" as const };
  }
  const normalized = {
    ...normalizeCommentSubmission(input),
    visitorId: input.visitorId,
    commentId: input.commentId,
    avatarUrl: input.avatarUrl?.trim() || null,
    parentReplyId: input.parentReplyId ?? null,
  };
  if (!passesAutomaticCommentScreening(normalized)) return { accepted: false as const, reason: "content-not-allowed" as const };

  const [rootComment] = await db.select({ id: siteComments.id, pageKey: siteComments.pageKey, visitorId: siteComments.visitorId })
    .from(siteComments)
    .where(and(eq(siteComments.id, normalized.commentId), eq(siteComments.pageKey, normalized.pageKey), eq(siteComments.status, "published"), isNull(siteComments.deletedAt)))
    .limit(1);
  if (!rootComment) return { accepted: false as const, reason: "comment-not-found" as const };

  let parentOwnerVisitorId = rootComment.visitorId;
  if (normalized.parentReplyId) {
    const [parentReply] = await db.select({ id: commentReplies.id, visitorId: commentReplies.visitorId })
      .from(commentReplies)
      .where(and(eq(commentReplies.id, normalized.parentReplyId), eq(commentReplies.commentId, normalized.commentId), eq(commentReplies.status, "published"), isNull(commentReplies.deletedAt)))
      .limit(1);
    if (!parentReply) return { accepted: false as const, reason: "reply-not-found" as const };
    parentOwnerVisitorId = parentReply.visitorId;
  }

  const cutoff = new Date(Date.now() - 60 * 60 * 1000);
  const replyThreadCondition = normalized.parentReplyId
    ? eq(commentReplies.parentReplyId, normalized.parentReplyId)
    : isNull(commentReplies.parentReplyId);
  const recentDuplicate = await db.select({ id: commentReplies.id }).from(commentReplies)
    .where(and(
      eq(commentReplies.commentId, normalized.commentId),
      eq(commentReplies.visitorId, normalized.visitorId),
      eq(commentReplies.body, normalized.body),
      replyThreadCondition,
      gte(commentReplies.createdAt, cutoff),
      isNull(commentReplies.deletedAt),
    ))
    .limit(1);
  if (recentDuplicate[0]) return { accepted: false as const, reason: "reply-rate-limited" as const };

  await db.insert(commentReplies).values({
    pageKey: normalized.pageKey,
    commentId: normalized.commentId,
    parentReplyId: normalized.parentReplyId,
    visitorId: normalized.visitorId,
    displayName: normalized.displayName,
    avatarKind: normalized.avatarKind,
    avatarUrl: normalized.avatarUrl,
    body: normalized.body,
    status: directCommentStatus,
  });
  const [created] = await db.select({ id: commentReplies.id }).from(commentReplies)
    .where(and(eq(commentReplies.commentId, normalized.commentId), eq(commentReplies.visitorId, normalized.visitorId), eq(commentReplies.body, normalized.body), gte(commentReplies.createdAt, cutoff)))
    .orderBy(desc(commentReplies.id)).limit(1);
  if (created?.id && parentOwnerVisitorId && parentOwnerVisitorId !== normalized.visitorId) {
    void createVisitorNotification({
      visitorId: parentOwnerVisitorId,
      type: "reply",
      title: "رد جديد على مساهمتك",
      message: `${normalized.displayName} أضاف ردًا جديدًا.`,
      targetPath: notificationTargetPath(normalized.pageKey),
      entityType: "reply",
      entityId: created.id,
    });
  }
  return { accepted: true as const, replyId: created?.id ?? null };
}

export async function getPublishedComments(pageKey: string, visitorId?: string) {
  const db = await getDb();
  if (!db) return [];
  const comments = await db.select().from(siteComments).where(and(eq(siteComments.pageKey, pageKey), eq(siteComments.status, "published"), isNull(siteComments.deletedAt))).orderBy(desc(siteComments.createdAt)).limit(30);
  if (!comments.length) return [];
  const ids = comments.map((comment) => comment.id);
  const replies = await db.select().from(commentReplies)
    .where(and(inArray(commentReplies.commentId, ids), eq(commentReplies.status, "published"), isNull(commentReplies.deletedAt)))
    .orderBy(commentReplies.createdAt)
    .limit(120);
  const reactions = await db.select({ commentId: commentReactions.commentId, reaction: commentReactions.reaction, count: sql<number>`count(*)` })
    .from(commentReactions).where(inArray(commentReactions.commentId, ids)).groupBy(commentReactions.commentId, commentReactions.reaction);
  const ownReactions = visitorId
    ? await db.select({ commentId: commentReactions.commentId, reaction: commentReactions.reaction }).from(commentReactions).where(and(inArray(commentReactions.commentId, ids), eq(commentReactions.visitorId, visitorId)))
    : [];
  const publicRatings = await db.select({ visitorId: articleFeedback.visitorId, rating: articleFeedback.rating })
    .from(articleFeedback)
    .where(and(eq(articleFeedback.pageKey, pageKey), eq(articleFeedback.isPublic, true), inArray(articleFeedback.visitorId, comments.map((comment) => comment.visitorId ?? ""))));
  const replyIds = replies.map((reply) => reply.id);
  const replyReactions = replyIds.length
    ? await db.select({ replyId: commentReplyReactions.replyId, reaction: commentReplyReactions.reaction, count: sql<number>`count(*)` })
      .from(commentReplyReactions).where(inArray(commentReplyReactions.replyId, replyIds)).groupBy(commentReplyReactions.replyId, commentReplyReactions.reaction)
    : [];
  const ownReplyReactions = visitorId && replyIds.length
    ? await db.select({ replyId: commentReplyReactions.replyId, reaction: commentReplyReactions.reaction }).from(commentReplyReactions)
      .where(and(inArray(commentReplyReactions.replyId, replyIds), eq(commentReplyReactions.visitorId, visitorId)))
    : [];
  return comments.map(({ visitorId: commentVisitorId, ...comment }) => ({
    ...comment,
    isOwner: Boolean(visitorId && commentVisitorId === visitorId),
    hearts: Number(reactions.find((item) => item.commentId === comment.id && item.reaction === "heart")?.count ?? 0),
    broken: Number(reactions.find((item) => item.commentId === comment.id && item.reaction === "broken")?.count ?? 0),
    viewerReaction: ownReactions.find((item) => item.commentId === comment.id)?.reaction ?? null,
    rating: publicRatings.find((item) => item.visitorId === commentVisitorId)?.rating ?? null,
    replies: replies.filter((reply) => reply.commentId === comment.id).map(({ visitorId: replyVisitorId, ...reply }) => ({
      ...reply,
      isOwner: Boolean(visitorId && replyVisitorId === visitorId),
      hearts: Number(replyReactions.find((item) => item.replyId === reply.id && item.reaction === "heart")?.count ?? 0),
      broken: Number(replyReactions.find((item) => item.replyId === reply.id && item.reaction === "broken")?.count ?? 0),
      viewerReaction: ownReplyReactions.find((item) => item.replyId === reply.id)?.reaction ?? null,
    })),
  }));
}

export async function setCommentReaction(input: { commentId: number; visitorId: string; reaction: "heart" | "broken" | null }) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حاليًا");
  const id = makeReactionId(input.commentId, input.visitorId);
  const [existingReaction] = await db.select({ reaction: commentReactions.reaction }).from(commentReactions).where(eq(commentReactions.id, id)).limit(1);
  const [comment] = await db.select({ visitorId: siteComments.visitorId, pageKey: siteComments.pageKey }).from(siteComments)
    .where(and(eq(siteComments.id, input.commentId), isNull(siteComments.deletedAt))).limit(1);
  if (!comment) throw new Error("التعليق غير متاح");
  if (!input.reaction) {
    await db.delete(commentReactions).where(eq(commentReactions.id, id));
    return { reaction: null };
  }
  await db.insert(commentReactions).values({ id, commentId: input.commentId, visitorId: input.visitorId, reaction: input.reaction }).onDuplicateKeyUpdate({ set: { reaction: input.reaction, updatedAt: new Date() } });
  if (comment.visitorId && comment.visitorId !== input.visitorId && existingReaction?.reaction !== input.reaction) {
    void createVisitorNotification({
      visitorId: comment.visitorId,
      type: "reaction",
      title: "تفاعل جديد على تعليقك",
      message: input.reaction === "heart" ? "أبدى أحد الزوار إعجابه بتعليقك." : "أضاف أحد الزوار تفاعلًا إلى تعليقك.",
      targetPath: notificationTargetPath(comment.pageKey),
      entityType: "comment",
      entityId: input.commentId,
    });
  }
  return { reaction: input.reaction };
}

export async function setCommentReplyReaction(input: { replyId: number; visitorId: string; reaction: "heart" | "broken" | null }) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حاليًا");
  const id = `reply:${input.replyId}:${input.visitorId}`;
  const [existingReaction] = await db.select({ reaction: commentReplyReactions.reaction }).from(commentReplyReactions).where(eq(commentReplyReactions.id, id)).limit(1);
  const [reply] = await db.select({ visitorId: commentReplies.visitorId, pageKey: commentReplies.pageKey }).from(commentReplies)
    .where(and(eq(commentReplies.id, input.replyId), isNull(commentReplies.deletedAt))).limit(1);
  if (!reply) throw new Error("الرد غير متاح");
  if (!input.reaction) {
    await db.delete(commentReplyReactions).where(eq(commentReplyReactions.id, id));
    return { reaction: null };
  }
  await db.insert(commentReplyReactions).values({ id, replyId: input.replyId, visitorId: input.visitorId, reaction: input.reaction }).onDuplicateKeyUpdate({ set: { reaction: input.reaction, updatedAt: new Date() } });
  if (reply.visitorId !== input.visitorId && existingReaction?.reaction !== input.reaction) {
    void createVisitorNotification({
      visitorId: reply.visitorId,
      type: "reaction",
      title: "تفاعل جديد على ردك",
      message: input.reaction === "heart" ? "أبدى أحد الزوار إعجابه بردك." : "أضاف أحد الزوار تفاعلًا إلى ردك.",
      targetPath: notificationTargetPath(reply.pageKey),
      entityType: "reply",
      entityId: input.replyId,
    });
  }
  return { reaction: input.reaction };
}

export async function submitContentReport(input: {
  reporterVisitorId: string;
  targetType: "comment" | "reply";
  targetId: number;
  reason: ReportReason;
  details?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حاليًا");
  const targetSource = input.targetType === "comment" ? siteComments : commentReplies;
  const [target] = await db.select({ id: targetSource.id, visitorId: targetSource.visitorId })
    .from(targetSource)
    .where(and(eq(targetSource.id, input.targetId), isNull(targetSource.deletedAt)))
    .limit(1);
  if (!target) return { created: false as const, reason: "content-not-found" as const };
  const [existing] = await db.select({ id: contentReports.id, status: contentReports.status })
    .from(contentReports)
    .where(and(eq(contentReports.reporterVisitorId, input.reporterVisitorId), eq(contentReports.targetType, input.targetType), eq(contentReports.targetId, input.targetId)))
    .limit(1);
  if (existing) return { created: false as const, reason: "already-reported" as const, reportId: existing.id, status: existing.status };

  await db.insert(contentReports).values({
    reporterVisitorId: input.reporterVisitorId,
    targetType: input.targetType,
    targetId: input.targetId,
    reason: input.reason,
    details: input.details?.trim().slice(0, 700) || null,
  });
  const [report] = await db.select({ id: contentReports.id }).from(contentReports)
    .where(and(eq(contentReports.reporterVisitorId, input.reporterVisitorId), eq(contentReports.targetType, input.targetType), eq(contentReports.targetId, input.targetId)))
    .limit(1);
  return { created: true as const, reportId: report!.id, targetOwnerVisitorId: target.visitorId };
}

export async function getReportWithContent(reportId: number) {
  const db = await getDb();
  if (!db) return null;
  const [report] = await db.select().from(contentReports).where(eq(contentReports.id, reportId)).limit(1);
  if (!report) return null;
  const targetSource = report.targetType === "comment" ? siteComments : commentReplies;
  const [target] = await db.select({
    id: targetSource.id,
    visitorId: targetSource.visitorId,
    pageKey: targetSource.pageKey,
    displayName: targetSource.displayName,
    avatarUrl: targetSource.avatarUrl,
    avatarKind: targetSource.avatarKind,
    body: targetSource.body,
    deletedAt: targetSource.deletedAt,
  }).from(targetSource).where(eq(targetSource.id, report.targetId)).limit(1);
  if (!target) return null;
  return { report, target };
}

export async function applyReportVerdict(input: { reportId: number; verdict: ReportVerdict; summary: string }) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حاليًا");
  const reportWithContent = await getReportWithContent(input.reportId);
  if (!reportWithContent) return { updated: false as const, reason: "report-not-found" as const };
  const { report, target } = reportWithContent;
  if (!target.visitorId) return { updated: false as const, reason: "content-owner-missing" as const };
  const now = new Date();
  const summary = input.summary.trim().slice(0, 900) || "اكتملت مراجعة البلاغ.";
  const isAction = input.verdict === "remove_and_restrict";
  const status = isAction ? "actioned" : input.verdict === "no_violation" ? "dismissed" : "pending";
  await db.update(contentReports).set({ status, aiVerdict: input.verdict, aiSummary: summary, reviewedAt: now, updatedAt: now }).where(eq(contentReports.id, input.reportId));

  if (isAction) {
    if (report.targetType === "comment") await db.update(siteComments).set({ deletedAt: now, status: "rejected", updatedAt: now }).where(eq(siteComments.id, report.targetId));
    else await db.update(commentReplies).set({ deletedAt: now, status: "rejected", updatedAt: now }).where(eq(commentReplies.id, report.targetId));
    await db.insert(contentRestrictions).values({ visitorId: target.visitorId, sourceReportId: report.id, reason: summary, isActive: true, restrictedAt: now, liftedAt: null, updatedAt: now })
      .onDuplicateKeyUpdate({ set: { sourceReportId: report.id, reason: summary, isActive: true, restrictedAt: now, liftedAt: null, updatedAt: now } });
    void createVisitorNotification({
      visitorId: target.visitorId,
      type: "comment_restricted",
      title: "تمت إزالة مساهمتك وتقييد النشر",
      message: summary,
      targetPath: "/notifications",
      entityType: "report",
      entityId: report.id,
    });
  } else if (input.verdict === "no_violation" && report.status === "actioned") {
    if (report.targetType === "comment") await db.update(siteComments).set({ deletedAt: null, status: "published", updatedAt: now }).where(eq(siteComments.id, report.targetId));
    else await db.update(commentReplies).set({ deletedAt: null, status: "published", updatedAt: now }).where(eq(commentReplies.id, report.targetId));
    await db.update(contentRestrictions).set({ isActive: false, liftedAt: now, updatedAt: now })
      .where(and(eq(contentRestrictions.visitorId, target.visitorId), eq(contentRestrictions.sourceReportId, report.id)));
    void createVisitorNotification({
      visitorId: target.visitorId,
      type: "comment_reverted",
      title: "تمت إعادة مساهمتك ورفع التقييد",
      message: summary,
      targetPath: notificationTargetPath(target.pageKey),
      entityType: report.targetType,
      entityId: report.targetId,
    });
  } else if (input.verdict === "no_violation") {
    void createVisitorNotification({
      visitorId: target.visitorId,
      type: "report_review",
      title: "تمت مراجعة بلاغ يخص مساهمتك",
      message: "لم تتطلب المراجعة أي إزالة أو تقييد. " + summary,
      targetPath: notificationTargetPath(target.pageKey),
      entityType: "report",
      entityId: report.id,
    });
  }

  void createVisitorNotification({
    visitorId: report.reporterVisitorId,
    type: "report_review",
    title: input.verdict === "remove_and_restrict" ? "تم اتخاذ إجراء بشأن بلاغك" : input.verdict === "no_violation" ? "تم التحقق من بلاغك" : "بلاغك يحتاج مراجعة أوسع",
    message: input.verdict === "no_violation" ? `تم التحقق ولم يُعثر على مخالفة مؤكدة. ${summary}` : summary,
    targetPath: "/notifications",
    entityType: "report",
    entityId: report.id,
  });
  return { updated: true as const, status, verdict: input.verdict };
}

export async function requestContentReportRecheck(input: { reportId: number; visitorId: string }) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حاليًا");
  const reportWithContent = await getReportWithContent(input.reportId);
  if (!reportWithContent) return { accepted: false as const, reason: "report-not-found" as const };
  const { report, target } = reportWithContent;
  if (report.reporterVisitorId !== input.visitorId && target.visitorId !== input.visitorId) return { accepted: false as const, reason: "not-report-participant" as const };
  if (!report.aiVerdict) return { accepted: false as const, reason: "not-reviewed" as const };
  if (report.recheckCount >= 2) return { accepted: false as const, reason: "recheck-limit" as const };
  await db.update(contentReports).set({ status: "recheck_requested", recheckCount: report.recheckCount + 1, updatedAt: new Date() }).where(eq(contentReports.id, report.id));
  return { accepted: true as const, reportId: report.id, recheckCount: report.recheckCount + 1 };
}

export async function getMostEngagedArticlePageKeys(pageKeys: string[]) {
  const db = await getDb();
  if (!db || !pageKeys.length) return [];
  const summaries = await db.select({ pageKey: articleFeedback.pageKey, count: sql<number>`count(*)`, average: sql<number>`avg(${articleFeedback.rating})` })
    .from(articleFeedback).where(inArray(articleFeedback.pageKey, pageKeys)).groupBy(articleFeedback.pageKey);
  const byKey = new Map(summaries.map((summary) => [summary.pageKey, { count: Number(summary.count), average: Number(summary.average) }]));
  return [...pageKeys].sort((first, second) => ((byKey.get(second)?.count ?? 0) * (byKey.get(second)?.average ?? 0)) - ((byKey.get(first)?.count ?? 0) * (byKey.get(first)?.average ?? 0)));
}
