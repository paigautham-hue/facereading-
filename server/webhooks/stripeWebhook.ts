import { Request, Response } from "express";
import Stripe from "stripe";
import { ENV } from "../_core/env";
import { updateOrderStatus, addCreditsToUser, getOrderBySessionId } from "../dbPayments";

const stripe = new Stripe(ENV.stripeSecretKey, {
  apiVersion: "2025-10-29.clover",
});

export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"];

  if (!sig) {
    console.error("[Stripe Webhook] No signature found");
    return res.status(400).send("No signature");
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      ENV.stripeWebhookSecret
    );
  } catch (err: any) {
    console.error("[Stripe Webhook] Signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log("[Stripe Webhook] Event received:", event.type);

  // Handle the event
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("[Stripe Webhook] Payment succeeded:", paymentIntent.id);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("[Stripe Webhook] Payment failed:", paymentIntent.id);
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error("[Stripe Webhook] Error handling event:", error);
    res.status(500).send(`Webhook handler failed: ${error.message}`);
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log("[Stripe Webhook] Checkout completed:", session.id);

  // Get metadata
  const userId = session.metadata?.user_id;
  const creditsAmount = session.metadata?.credits_amount;
  const orderId = session.metadata?.order_id;

  if (!userId || !creditsAmount) {
    console.error("[Stripe Webhook] Missing metadata:", session.metadata);
    return;
  }

  // Update order status
  try {
    await updateOrderStatus(
      session.id,
      "completed",
      session.payment_intent as string
    );
    console.log("[Stripe Webhook] Order updated:", session.id);
  } catch (error) {
    console.error("[Stripe Webhook] Error updating order:", error);
  }

  // Add credits to user
  try {
    const credits = parseInt(creditsAmount, 10);
    const newBalance = await addCreditsToUser(userId, credits);
    console.log(`[Stripe Webhook] Added ${credits} credits to user ${userId}. New balance: ${newBalance}`);
  } catch (error) {
    console.error("[Stripe Webhook] Error adding credits:", error);
  }
}

