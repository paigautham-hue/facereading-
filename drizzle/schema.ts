import { int, mediumtext, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  dateOfBirth: varchar("dateOfBirth", { length: 10 }),
  credits: int("credits").default(0).notNull(), // Face reading credits
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Face Reading Tables
export const readings = mysqlTable("readings", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  name: varchar("name", { length: 255 }),
  gender: mysqlEnum("gender", ["male", "female", "unknown"]).default("unknown").notNull(),
  version: int("version").default(1).notNull(),
  modelVersion: varchar("modelVersion", { length: 64 }).default("v1.0").notNull(),
  status: mysqlEnum("status", ["pending", "uploading", "processing", "completed", "failed"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  executiveSummary: mediumtext("executiveSummary"),
  detailedAnalysis: mediumtext("detailedAnalysis"),
  stunningInsights: mediumtext("stunningInsights"),
  pdfPath: varchar("pdfPath", { length: 512 }),
  accuracyRating: int("accuracyRating"),
  errorMessage: text("errorMessage"),
});

export type Reading = typeof readings.$inferSelect;
export type InsertReading = typeof readings.$inferInsert;

export const images = mysqlTable("images", {
  id: varchar("id", { length: 64 }).primaryKey(),
  readingId: varchar("readingId", { length: 64 }).notNull(),
  imageType: mysqlEnum("imageType", [
    "frontal_neutral",
    "frontal_smile",
    "left_profile",
    "right_profile",
    "three_quarter_left",
    "three_quarter_right",
    "closeup_eyes",
    "closeup_nose",
    "closeup_mouth",
    "closeup_left_ear",
    "closeup_right_ear"
  ]).notNull(),
  filePath: varchar("filePath", { length: 512 }).notNull(),
  qualityScore: int("qualityScore"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Image = typeof images.$inferSelect;
export type InsertImage = typeof images.$inferInsert;

export const feedback = mysqlTable("feedback", {
  id: varchar("id", { length: 64 }).primaryKey(),
  readingId: varchar("readingId", { length: 64 }).notNull(),
  userId: varchar("userId", { length: 64 }).notNull(),
  overallRating: int("overallRating"),
  featureAccuracy: text("featureAccuracy"),
  lifeAspectAccuracy: text("lifeAspectAccuracy"),
  specificFeedback: text("specificFeedback"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Feedback = typeof feedback.$inferSelect;
export type InsertFeedback = typeof feedback.$inferInsert;

export const systemConfig = mysqlTable("systemConfig", {
  id: varchar("id", { length: 64 }).primaryKey(),
  key: varchar("key", { length: 128 }).notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SystemConfig = typeof systemConfig.$inferSelect;
export type InsertSystemConfig = typeof systemConfig.$inferInsert;

// AI Model Monitoring Table
export const aiModelLogs = mysqlTable("aiModelLogs", {
  id: varchar("id", { length: 64 }).primaryKey(),
  readingId: varchar("readingId", { length: 64 }),
  modelName: mysqlEnum("modelName", ["gemini-2.5-pro", "gpt-5", "grok-4"]).notNull(),
  operation: mysqlEnum("operation", ["vision_analysis", "face_reading", "stunning_insights"]).notNull(),
  status: mysqlEnum("status", ["success", "failure"]).notNull(),
  responseTime: int("responseTime"), // in milliseconds
  confidenceScore: int("confidenceScore"), // 0-100
  tokensUsed: int("tokensUsed"),
  errorMessage: text("errorMessage"),
  errorStack: text("errorStack"),
  requestData: text("requestData"),
  responseData: text("responseData"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AiModelLog = typeof aiModelLogs.$inferSelect;
export type InsertAiModelLog = typeof aiModelLogs.$inferInsert;


// Payment and Order Tables
export const orders = mysqlTable("orders", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  stripeSessionId: varchar("stripeSessionId", { length: 255 }).unique(),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).default("pending").notNull(),
  amount: int("amount").notNull(), // in cents
  currency: varchar("currency", { length: 3 }).default("usd").notNull(),
  productType: mysqlEnum("productType", ["credits", "subscription"]).notNull(),
  creditsAmount: int("creditsAmount"), // Number of credits purchased
  subscriptionPlan: varchar("subscriptionPlan", { length: 64 }),
  customerEmail: varchar("customerEmail", { length: 320 }),
  customerName: varchar("customerName", { length: 255 }),
  metadata: text("metadata"), // JSON string for additional data
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

export const subscriptions = mysqlTable("subscriptions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }).unique(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  plan: varchar("plan", { length: 64 }).notNull(), // e.g., "monthly", "yearly"
  status: mysqlEnum("status", ["active", "canceled", "past_due", "unpaid"]).default("active").notNull(),
  currentPeriodStart: timestamp("currentPeriodStart"),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  cancelAtPeriodEnd: int("cancelAtPeriodEnd").default(0).notNull(), // boolean as int
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

