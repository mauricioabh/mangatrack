// Mock configuration - easily toggle between real and mock data
export const MOCK_CONFIG = {
  // Set to true to use MSW mock data, false to use real database
  USE_MOCK_DATA:
    process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_USE_MOCK === "true",

  // Alternative: Use localStorage to toggle in browser
  getUseMockData: (): boolean => {
    if (typeof window === "undefined") return false;

    // Check localStorage first, then fallback to env var
    const stored = localStorage.getItem("use-mock-data");
    if (stored !== null) {
      return stored === "true";
    }

    // Fallback to environment variable
    return process.env.NEXT_PUBLIC_USE_MOCK === "true";
  },

  setUseMockData: (useMock: boolean): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem("use-mock-data", useMock.toString());
  },
};



