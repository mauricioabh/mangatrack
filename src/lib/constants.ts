import { env } from "@/env";

// Stripe Price IDs - These should be set in your environment variables
export const STRIPE_PRICE_IDS = {
  MONTHLY: env.STRIPE_PREMIUM_MONTHLY_PRICE_ID || "",
  YEARLY: env.STRIPE_PREMIUM_YEARLY_PRICE_ID || "",
} as const;

// App Configuration
export const APP_CONFIG = {
  APP_URL: env.NEXT_PUBLIC_APP_URL,
  NODE_ENV: env.NODE_ENV,
} as const;

// Subscription Plans
export const SUBSCRIPTION_PLANS = {
  MONTHLY: {
    priceId: STRIPE_PRICE_IDS.MONTHLY,
    price: 9.99,
    interval: "month",
    label: "Monthly",
    description: "$9.99/month",
  },
  YEARLY: {
    priceId: STRIPE_PRICE_IDS.YEARLY,
    price: 99.99,
    interval: "year",
    label: "Yearly",
    description: "$99.99/year",
    savings: "Save 17%",
  },
} as const;
