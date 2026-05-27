import Stripe from "stripe";

let stripeInstance: Stripe | undefined;

function getStripeClient(): Stripe {
  if (stripeInstance) {
    return stripeInstance;
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }

  stripeInstance = new Stripe(secretKey, {
    apiVersion: "2025-09-30.clover",
    typescript: true,
  });

  return stripeInstance;
}

/** Lazy Stripe client (avoids build-time failure when env is not set). */
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop, receiver) {
    const client = getStripeClient();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function"
      ? (value as (...args: unknown[]) => unknown).bind(client)
      : value;
  },
});

export const STRIPE_PRICE_IDS = {
  PREMIUM_MONTHLY: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID || "",
  PREMIUM_YEARLY: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID || "",
} as const;

/**
 * Create a Stripe checkout session for premium subscription
 * @param userId - User ID
 * @param priceId - Stripe price ID
 * @param successUrl - Success redirect URL
 * @param cancelUrl - Cancel redirect URL
 * @returns Promise<Stripe.Checkout.Session>
 */
export async function createCheckoutSession(
  userId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
) {
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
    },
  });

  return session;
}

/**
 * Create a Stripe customer portal session
 * @param customerId - Stripe customer ID
 * @param returnUrl - Return URL after portal session
 * @returns Promise<Stripe.BillingPortal.Session>
 */
export async function createPortalSession(
  customerId: string,
  returnUrl: string
) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}
