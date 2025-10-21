import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

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
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Face Reading Tables
export const readings = mysqlTable("readings", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  version: int("version").default(1).notNull(),
  modelVersion: varchar("modelVersion", { length: 64 }).default("v1.0").notNull(),
  status: mysqlEnum("status", ["pending", "uploading", "processing", "completed", "failed"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  executiveSummary: text("executiveSummary"),
  detailedAnalysis: text("detailedAnalysis"),
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
    "closeup_ears"
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
