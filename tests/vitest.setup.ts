const requiredTestEnv: Record<string, string> = {
  DATABASE_URL: "postgresql://test:test@localhost:5432/test",
  CLERK_SECRET_KEY: "sk_test_vitest_placeholder",
  CONSUMET_BASE_URL: "https://consumet.example.test",
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_vitest_placeholder",
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: "/sign-in",
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: "/sign-up",
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: "/dashboard",
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: "/dashboard",
  NEXT_PUBLIC_APP_URL: "http://localhost:3000",
};

for (const [key, value] of Object.entries(requiredTestEnv)) {
  process.env[key] ??= value;
}
