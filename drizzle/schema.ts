import { boolean, index, int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

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

/** Aggregated first-party page views for the public service journeys; no IP address or personal profile is stored. */
export const servicePageMetrics = mysqlTable("service_page_metrics", {
  pagePath: varchar("pagePath", { length: 96 }).primaryKey(),
  views: int("views").notNull().default(0),
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

/** Anonymous quality signal for one FAQ assistant answer; answer text and visitor question are intentionally not stored. */
export const assistantAnswerFeedback = mysqlTable("assistant_answer_feedback", {
  id: varchar("id", { length: 64 }).primaryKey(),
  rating: int("rating").notNull(),
  service: mysqlEnum("service", ["cleaning", "maintenance", "moving", "general"]).notNull(),
  city: varchar("city", { length: 96 }),
  contentCardIds: varchar("contentCardIds", { length: 512 }).notNull().default(""),
  note: varchar("note", { length: 600 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AssistantAnswerFeedback = typeof assistantAnswerFeedback.$inferSelect;

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

/** Nested replies are attached to their root comment and optionally to a preceding reply. */
export const commentReplies = mysqlTable("comment_replies", {
  id: int("id").autoincrement().primaryKey(),
  pageKey: varchar("pageKey", { length: 160 }).notNull(),
  commentId: int("commentId").notNull(),
  parentReplyId: int("parentReplyId"),
  visitorId: varchar("visitorId", { length: 64 }).notNull(),
  displayName: varchar("displayName", { length: 64 }).notNull(),
  avatarKind: varchar("avatarKind", { length: 32 }).notNull().default("wave"),
  avatarUrl: varchar("avatarUrl", { length: 1024 }),
  body: text("body").notNull(),
  status: mysqlEnum("status", ["pending", "published", "rejected"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  deletedAt: timestamp("deletedAt"),
}, (table) => ({
  commentCreatedIndex: index("comment_replies_comment_created_idx").on(table.commentId, table.createdAt),
  parentReplyIndex: index("comment_replies_parent_idx").on(table.parentReplyId),
}));

/** One selectable reaction per anonymous visitor and reply. */
export const commentReplyReactions = mysqlTable("comment_reply_reactions", {
  id: varchar("id", { length: 160 }).primaryKey(),
  replyId: int("replyId").notNull(),
  visitorId: varchar("visitorId", { length: 64 }).notNull(),
  reaction: mysqlEnum("reaction", ["heart", "broken"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const siteNotifications = mysqlTable("site_notifications", {
  id: int("id").autoincrement().primaryKey(),
  visitorId: varchar("visitorId", { length: 64 }).notNull(),
  type: mysqlEnum("type", ["reply", "reaction", "comment_published", "comment_deleted", "comment_reverted", "comment_restricted", "report_review"]).notNull(),
  title: varchar("title", { length: 160 }).notNull(),
  message: varchar("message", { length: 900 }).notNull(),
  targetPath: varchar("targetPath", { length: 280 }),
  entityType: mysqlEnum("entityType", ["comment", "reply", "report", "system"]),
  entityId: int("entityId"),
  isRead: boolean("isRead").notNull().default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  visitorCreatedIndex: index("site_notifications_visitor_created_idx").on(table.visitorId, table.createdAt),
}));

/** Anonymous visitors may silence reaction alerts without hiding replies or required system/moderation notices. */
export const visitorNotificationPreferences = mysqlTable("visitor_notification_preferences", {
  visitorId: varchar("visitorId", { length: 64 }).primaryKey(),
  reactionNotificationsEnabled: boolean("reactionNotificationsEnabled").notNull().default(true),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const contentReports = mysqlTable("content_reports", {
  id: int("id").autoincrement().primaryKey(),
  reporterVisitorId: varchar("reporterVisitorId", { length: 64 }).notNull(),
  targetType: mysqlEnum("targetType", ["comment", "reply"]).notNull(),
  targetId: int("targetId").notNull(),
  reason: mysqlEnum("reason", ["abuse", "illegal", "profile", "name", "other"]).notNull(),
  details: varchar("details", { length: 700 }),
  status: mysqlEnum("status", ["pending", "actioned", "dismissed", "recheck_requested"]).notNull().default("pending"),
  aiVerdict: mysqlEnum("aiVerdict", ["remove_and_restrict", "no_violation", "needs_review"]),
  aiSummary: varchar("aiSummary", { length: 900 }),
  recheckCount: int("recheckCount").notNull().default(0),
  reviewedAt: timestamp("reviewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  reporterTargetUnique: uniqueIndex("content_reports_reporter_target_unique").on(table.reporterVisitorId, table.targetType, table.targetId),
  statusCreatedIndex: index("content_reports_status_created_idx").on(table.status, table.createdAt),
}));

/** A restriction is only active after a confirmed decision and can be lifted during recheck. */
export const contentRestrictions = mysqlTable("content_restrictions", {
  visitorId: varchar("visitorId", { length: 64 }).primaryKey(),
  sourceReportId: int("sourceReportId").notNull(),
  reason: varchar("reason", { length: 900 }).notNull(),
  isActive: boolean("isActive").notNull().default(true),
  restrictedAt: timestamp("restrictedAt").defaultNow().notNull(),
  liftedAt: timestamp("liftedAt"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  sourceReportIndex: index("content_restrictions_report_idx").on(table.sourceReportId),
}));

export type SiteComment = typeof siteComments.$inferSelect;
