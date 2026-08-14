import { desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, commentReactions, siteComments, siteMetrics, siteVisitors, users, visitorFeedback } from "../drizzle/schema";
import { and, inArray } from "drizzle-orm";
import { makeReactionId } from "../shared/interactionHelpers";
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

export async function submitVisitorFeedback(input: { rating: number; comment: string }) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حاليًا");
  await db.insert(visitorFeedback).values({ rating: input.rating, comment: input.comment.trim(), status: "published" });
  return { accepted: true as const };
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

export async function submitSiteComment(input: { pageKey: string; displayName: string; body: string; avatarKind: string }) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حاليًا");
  await db.insert(siteComments).values({
    pageKey: input.pageKey,
    displayName: input.displayName.trim(),
    body: input.body.trim(),
    avatarKind: input.avatarKind,
    status: "published",
  });
  return { accepted: true as const };
}

export async function getPublishedComments(pageKey: string, visitorId?: string) {
  const db = await getDb();
  if (!db) return [];
  const comments = await db.select().from(siteComments).where(and(eq(siteComments.pageKey, pageKey), eq(siteComments.status, "published"))).orderBy(desc(siteComments.createdAt)).limit(30);
  if (!comments.length) return [];
  const ids = comments.map((comment) => comment.id);
  const reactions = await db.select({ commentId: commentReactions.commentId, reaction: commentReactions.reaction, count: sql<number>`count(*)` })
    .from(commentReactions).where(inArray(commentReactions.commentId, ids)).groupBy(commentReactions.commentId, commentReactions.reaction);
  const ownReactions = visitorId
    ? await db.select({ commentId: commentReactions.commentId, reaction: commentReactions.reaction }).from(commentReactions).where(and(inArray(commentReactions.commentId, ids), eq(commentReactions.visitorId, visitorId)))
    : [];
  return comments.map((comment) => ({
    ...comment,
    hearts: Number(reactions.find((item) => item.commentId === comment.id && item.reaction === "heart")?.count ?? 0),
    broken: Number(reactions.find((item) => item.commentId === comment.id && item.reaction === "broken")?.count ?? 0),
    viewerReaction: ownReactions.find((item) => item.commentId === comment.id)?.reaction ?? null,
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
