import { and, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, articleFeedback, assistantAnswerFeedback, commentReactions, servicePageMetrics, siteComments, siteMetrics, siteVisitors, users, visitorFeedback } from "../drizzle/schema";
import { makeReactionId } from "../shared/interactionHelpers";
import { directCommentStatus, normalizeCommentSubmission, passesAutomaticCommentScreening } from "./commentSubmissionPolicy";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

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
  return { accepted: true as const, commentId: created?.id ?? null };
}

export async function updateVisitorComment(input: VisitorOwnedCommentInput & { commentId: number }) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حاليًا");
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
  const existing = await db.select({ id: siteComments.id })
    .from(siteComments)
    .where(and(eq(siteComments.id, commentId), eq(siteComments.visitorId, visitorId), isNull(siteComments.deletedAt)))
    .limit(1);
  if (!existing[0]) return { deleted: false as const };
  await db.update(siteComments).set({ deletedAt: new Date(), updatedAt: new Date() }).where(eq(siteComments.id, commentId));
  return { deleted: true as const };
}

export async function getPublishedComments(pageKey: string, visitorId?: string) {
  const db = await getDb();
  if (!db) return [];
  const comments = await db.select().from(siteComments).where(and(eq(siteComments.pageKey, pageKey), eq(siteComments.status, "published"), isNull(siteComments.deletedAt))).orderBy(desc(siteComments.createdAt)).limit(30);
  if (!comments.length) return [];
  const ids = comments.map((comment) => comment.id);
  const reactions = await db.select({ commentId: commentReactions.commentId, reaction: commentReactions.reaction, count: sql<number>`count(*)` })
    .from(commentReactions).where(inArray(commentReactions.commentId, ids)).groupBy(commentReactions.commentId, commentReactions.reaction);
  const ownReactions = visitorId
    ? await db.select({ commentId: commentReactions.commentId, reaction: commentReactions.reaction }).from(commentReactions).where(and(inArray(commentReactions.commentId, ids), eq(commentReactions.visitorId, visitorId)))
    : [];
  const publicRatings = await db.select({ visitorId: articleFeedback.visitorId, rating: articleFeedback.rating })
    .from(articleFeedback)
    .where(and(eq(articleFeedback.pageKey, pageKey), eq(articleFeedback.isPublic, true), inArray(articleFeedback.visitorId, comments.map((comment) => comment.visitorId ?? ""))));
  return comments.map(({ visitorId: commentVisitorId, ...comment }) => ({
    ...comment,
    isOwner: Boolean(visitorId && commentVisitorId === visitorId),
    hearts: Number(reactions.find((item) => item.commentId === comment.id && item.reaction === "heart")?.count ?? 0),
    broken: Number(reactions.find((item) => item.commentId === comment.id && item.reaction === "broken")?.count ?? 0),
    viewerReaction: ownReactions.find((item) => item.commentId === comment.id)?.reaction ?? null,
    rating: publicRatings.find((item) => item.visitorId === commentVisitorId)?.rating ?? null,
  }));
}

export async function setCommentReaction(input: { commentId: number; visitorId: string; reaction: "heart" | "broken" | null }) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حاليًا");
  const id = makeReactionId(input.commentId, input.visitorId);
  if (!input.reaction) {
    await db.delete(commentReactions).where(eq(commentReactions.id, id));
    return { reaction: null };
  }
  await db.insert(commentReactions).values({ id, commentId: input.commentId, visitorId: input.visitorId, reaction: input.reaction }).onDuplicateKeyUpdate({ set: { reaction: input.reaction, updatedAt: new Date() } });
  return { reaction: input.reaction };
}
