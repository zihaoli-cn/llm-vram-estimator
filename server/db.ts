import { eq, like, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, gpus, modelHistory, type GPU, type InsertGPU, type ModelHistory, type InsertModelHistory } from "../drizzle/schema";
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

// GPU database functions
export async function searchGPUs(query: string): Promise<GPU[]> {
  const db = await getDb();
  if (!db) return [];
  
  const searchPattern = `%${query}%`;
  const results = await db
    .select()
    .from(gpus)
    .where(like(gpus.modelName, searchPattern))
    .limit(20);
  
  return results;
}

export async function getGPUById(id: number): Promise<GPU | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const results = await db.select().from(gpus).where(eq(gpus.id, id)).limit(1);
  return results.length > 0 ? results[0] : undefined;
}

export async function getAllGPUs(): Promise<GPU[]> {
  const db = await getDb();
  if (!db) return [];
  
  const results = await db.select().from(gpus);
  return results;
}

export async function insertGPU(gpu: InsertGPU): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.insert(gpus).values(gpu);
}

export async function bulkInsertGPUs(gpuList: InsertGPU[]): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  if (gpuList.length === 0) return;
  
  await db.insert(gpus).values(gpuList);
}

// Model history functions
export async function getUserModelHistory(userId: number, limit: number = 10): Promise<ModelHistory[]> {
  const db = await getDb();
  if (!db) return [];
  
  const results = await db
    .select()
    .from(modelHistory)
    .where(eq(modelHistory.userId, userId))
    .orderBy(desc(modelHistory.updatedAt))
    .limit(limit);
  
  return results;
}

export async function saveModelHistory(history: InsertModelHistory): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(modelHistory).values(history);
}

export async function deleteModelHistory(id: number, userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db
    .delete(modelHistory)
    .where(eq(modelHistory.id, id));
}

export async function clearUserModelHistory(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db
    .delete(modelHistory)
    .where(eq(modelHistory.userId, userId));
}
