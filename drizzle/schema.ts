import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, float } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
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

/**
 * GPU specifications table
 * Stores GPU models and their VRAM capacity
 */
export const gpus = mysqlTable("gpus", {
  id: int("id").autoincrement().primaryKey(),
  modelName: varchar("modelName", { length: 255 }).notNull(),
  manufacturer: varchar("manufacturer", { length: 100 }),
  vramCapacityGB: float("vramCapacityGB").notNull(),
  architecture: varchar("architecture", { length: 100 }),
  releaseYear: int("releaseYear"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GPU = typeof gpus.$inferSelect;
export type InsertGPU = typeof gpus.$inferInsert;

/**
 * Model configuration history table
 * Stores user's input history for quick access
 */
export const modelHistory = mysqlTable("modelHistory", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id),
  
  // Model identification
  modelName: varchar("modelName", { length: 500 }),
  modelSource: varchar("modelSource", { length: 50 }), // 'search', 'url', 'upload', 'manual'
  
  // Model parameters
  totalParameters: varchar("totalParameters", { length: 50 }),
  numLayers: int("numLayers"),
  hiddenSize: int("hiddenSize"),
  numAttentionHeads: int("numAttentionHeads"),
  numKvHeads: int("numKvHeads"),
  headDim: int("headDim"),
  attentionType: varchar("attentionType", { length: 20 }), // 'MHA', 'GQA', 'MQA'
  
  // Inference configuration
  quantization: varchar("quantization", { length: 20 }), // 'FP16', 'BF16', 'FP8', 'INT8', 'INT4'
  batchSize: int("batchSize"),
  seqLength: int("seqLength"),
  systemOverheadPercent: float("systemOverheadPercent"),
  
  // Hardware configuration
  gpuModelId: int("gpuModelId").references(() => gpus.id),
  
  // Cached config.json content
  configJson: text("configJson"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ModelHistory = typeof modelHistory.$inferSelect;
export type InsertModelHistory = typeof modelHistory.$inferInsert;
