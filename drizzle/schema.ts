import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const siteMetrics = mysqlTable("site_metrics", {
  key: varchar("key", { length: 64 }).primaryKey(),
  value: int("value").notNull().default(0),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const visitorFeedback = mysqlTable("visitor_feedback", {
  id: int("id").autoincrement().primaryKey(),
  rating: int("rating").notNull(),
  comment: text("comment"),
  status: mysqlEnum("status", ["pending", "published", "rejected"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type VisitorFeedback = typeof visitorFeedback.$inferSelect;

/** A per-article score owned by one anonymous browser. The composite ID prevents duplicate ratings. */
export const articleFeedback = mysqlTable("article_feedback", {
  id: varchar("id", { length: 240 }).primaryKey(),
  pageKey: varchar("pageKey", { length: 160 }).notNull(),
  visitorId: varchar("visitorId", { length: 64 }).notNull(),
  rating: int("rating").notNull(),
  isPublic: boolean("isPublic").notNull().default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  articleFeedbackVisitorUnique: uniqueIndex("article_feedback_visitor_unique").on(table.pageKey, table.visitorId),
}));

export type ArticleFeedback = typeof articleFeedback.$inferSelect;

/** A browser-generated anonymous ID; no IP address, telephone number, or account is stored here. */
export const siteVisitors = mysqlTable("site_visitors", {
  visitorId: varchar("visitorId", { length: 64 }).primaryKey(),
  firstSeenAt: timestamp("firstSeenAt").defaultNow().notNull(),
  lastSeenAt: timestamp("lastSeenAt").defaultNow().onUpdateNow().notNull(),
  visitCount: int("visitCount").notNull().default(1),
});

/** Public comments remain pending until the site owner publishes them. */
export const siteComments = mysqlTable("site_comments", {
  id: int("id").autoincrement().primaryKey(),
  pageKey: varchar("pageKey", { length: 160 }).notNull(),
  /** Anonymous browser-generated ID used only to control comment ownership. */
  visitorId: varchar("visitorId", { length: 64 }),
  displayName: varchar("displayName", { length: 64 }).notNull(),
  avatarKind: varchar("avatarKind", { length: 32 }).notNull().default("wave"),
  avatarUrl: varchar("avatarUrl", { length: 1024 }),
  body: text("body").notNull(),
  status: mysqlEnum("status", ["pending", "published", "rejected"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  deletedAt: timestamp("deletedAt"),
});

/** The composite identifier guarantees one selectable reaction per anonymous visitor and comment. */
export const commentReactions = mysqlTable("comment_reactions", {
  id: varchar("id", { length: 160 }).primaryKey(),
  commentId: int("commentId").notNull(),
  visitorId: varchar("visitorId", { length: 64 }).notNull(),
  reaction: mysqlEnum("reaction", ["heart", "broken"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SiteComment = typeof siteComments.$inferSelect;
