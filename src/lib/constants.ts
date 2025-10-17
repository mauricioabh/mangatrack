// Stripe Price IDs - These should be set in your environment variables
export const STRIPE_PRICE_IDS = {
  MONTHLY: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID || "",
  YEARLY: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID || "",
} as const;

// App Configuration
export const APP_CONFIG = {
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  NODE_ENV: process.env.NODE_ENV || "development",
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
