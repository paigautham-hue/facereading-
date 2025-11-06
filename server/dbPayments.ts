import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { orders, subscriptions, users, type InsertOrder, type InsertSubscription } from "../drizzle/schema";
import { nanoid } from "nanoid";

/**
 * Database helpers for payment and order management
 */

// Order Management
export async function createOrder(orderData: Omit<InsertOrder, "id">): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const orderId = nanoid();
  await db.insert(orders).values({
    id: orderId,
    ...orderData,
  });

  return orderId;
}

export async function getOrderBySessionId(sessionId: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(orders)
    .where(eq(orders.stripeSessionId, sessionId))
    .limit(1);

  return result[0] || null;
}

export async function updateOrderStatus(
  sessionId: string,
  status: "pending" | "completed" | "failed" | "refunded",
  paymentIntentId?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateData: any = { status };
  if (status === "completed") {
    updateData.completedAt = new Date();
  }
  if (paymentIntentId) {
    updateData.stripePaymentIntentId = paymentIntentId;
  }

  await db
    .update(orders)
    .set(updateData)
    .where(eq(orders.stripeSessionId, sessionId));
}

export async function getUserOrders(userId: string) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(orders.createdAt);

  return result;
}

// Credits Management
export async function addCreditsToUser(userId: string, creditsToAdd: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get current credits
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user[0]) throw new Error("User not found");

  const newCredits = (user[0].credits || 0) + creditsToAdd;

  await db
    .update(users)
    .set({ credits: newCredits })
    .where(eq(users.id, userId));

  return newCredits;
}

export async function deductCreditsFromUser(userId: string, creditsToDeduct: number): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get current credits
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user[0]) throw new Error("User not found");

  const currentCredits = user[0].credits || 0;
  if (currentCredits < creditsToDeduct) {
    return false; // Not enough credits
  }

  const newCredits = currentCredits - creditsToDeduct;

  await db
    .update(users)
    .set({ credits: newCredits })
    .where(eq(users.id, userId));

  return true;
}

export async function getUserCredits(userId: string): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user[0]?.credits || 0;
}

// Subscription Management
export async function createSubscription(subData: Omit<InsertSubscription, "id">): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const subId = nanoid();
  await db.insert(subscriptions).values({
    id: subId,
    ...subData,
  });

  return subId;
}

export async function getUserSubscription(userId: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  return result[0] || null;
}

