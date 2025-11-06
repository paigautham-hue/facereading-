import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import Stripe from "stripe";
import { ENV } from "../_core/env";
import { getProductById, PRODUCTS } from "../products";
import { createOrder, getUserOrders, getUserCredits } from "../dbPayments";
import { nanoid } from "nanoid";

const stripe = new Stripe(ENV.stripeSecretKey, {
  apiVersion: "2025-10-29.clover",
});

export const paymentRouter = router({
  // Get all available products
  getProducts: protectedProcedure.query(() => {
    return PRODUCTS;
  }),

  // Get user's current credits
  getCredits: protectedProcedure.query(async ({ ctx }) => {
    const credits = await getUserCredits(ctx.user.id);
    return { credits };
  }),

  // Create Stripe checkout session
  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const product = getProductById(input.productId);
      if (!product) {
        throw new Error("Product not found");
      }

      // Create order record
      const orderId = await createOrder({
        userId: ctx.user.id,
        stripeSessionId: "", // Will be updated after session creation
        status: "pending",
        amount: product.price,
        currency: "usd",
        productType: "credits",
        creditsAmount: product.credits,
        customerEmail: ctx.user.email || undefined,
        customerName: ctx.user.name || undefined,
      });

      // Get origin for redirect URLs
      const origin = ctx.req.headers.origin || "http://localhost:3000";

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: product.name,
                description: product.description,
              },
              unit_amount: product.price,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/pricing`,
        customer_email: ctx.user.email || undefined,
        client_reference_id: ctx.user.id,
        metadata: {
          user_id: ctx.user.id,
          customer_email: ctx.user.email || "",
          customer_name: ctx.user.name || "",
          order_id: orderId,
          credits_amount: product.credits.toString(),
        },
        allow_promotion_codes: true,
      });

      // Update order with session ID
      const db = await import("../db").then(m => m.getDb());
      if (db) {
        const { orders } = await import("../../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        await db
          .update(orders)
          .set({ stripeSessionId: session.id })
          .where(eq(orders.id, orderId));
      }

      return {
        sessionId: session.id,
        url: session.url,
      };
    }),

  // Get user's order history
  getOrders: protectedProcedure.query(async ({ ctx }) => {
    const userOrders = await getUserOrders(ctx.user.id);
    return userOrders;
  }),

  // Verify payment session
  verifySession: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const session = await stripe.checkout.sessions.retrieve(input.sessionId);
      return {
        status: session.payment_status,
        customerEmail: session.customer_email,
      };
    }),
});

