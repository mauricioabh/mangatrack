import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "No signature provided" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const userId = subscription.metadata?.userId;

        console.log("Subscription created:", {
          customerId,
          userId,
          subscriptionId: subscription.id,
        });

        if (userId) {
          await db.user.update({
            where: {
              id: userId,
            },
            data: {
              tier: "PREMIUM",
            },
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const userId = subscription.metadata?.userId;

        console.log("Subscription updated:", {
          customerId,
          userId,
          status: subscription.status,
        });

        if (userId) {
          await db.user.update({
            where: {
              id: userId,
            },
            data: {
              tier: subscription.status === "active" ? "PREMIUM" : "BASIC",
            },
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const userId = subscription.metadata?.userId;

        console.log("Subscription deleted:", { customerId, userId });

        if (userId) {
          await db.user.update({
            where: {
              id: userId,
            },
            data: {
              tier: "BASIC",
            },
          });
        }
        break;
      }

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;

        console.log("Checkout completed:", { userId, sessionId: session.id });

        // This is a fallback - the subscription.created event should handle the upgrade
        if (userId && session.mode === "subscription") {
          await db.user.update({
            where: {
              id: userId,
            },
            data: {
              tier: "PREMIUM",
            },
          });
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const subscriptionId = (invoice as unknown as Record<string, unknown>)
          .subscription as string | null;

        console.log("Payment succeeded:", { customerId, subscriptionId });

        // Handle successful recurring payments
        if (subscriptionId) {
          const subscription =
            await stripe.subscriptions.retrieve(subscriptionId);
          const userId = subscription.metadata?.userId;

          if (userId) {
            await db.user.update({
              where: {
                id: userId,
              },
              data: {
                tier: "PREMIUM",
              },
            });
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const subscriptionId = (invoice as unknown as Record<string, unknown>)
          .subscription as string | null;

        console.log("Payment failed:", { customerId, subscriptionId });

        // Handle failed payments - you might want to notify the user
        if (subscriptionId) {
          const subscription =
            await stripe.subscriptions.retrieve(subscriptionId);
          const userId = subscription.metadata?.userId;

          if (userId) {
            // You could create a notification here
            await db.notification.create({
              data: {
                userId,
                type: "SYSTEM",
                title: "Payment Failed",
                message:
                  "Your subscription payment failed. Please update your payment method.",
              },
            });
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
