/**
 * Utility for retrying async functions with exponential backoff.
 * Useful for handling Appwrite rate limits (429 errors).
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 500
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    // Check if it's a rate limit error (429) or a network error
    const isRateLimit = error?.code === 429;
    const isNetworkError = !error?.code && error?.message === "Network Error";
    
    if ((isRateLimit || isNetworkError) && retries > 0) {
      console.warn(`Rate limit or network error hit. Retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2); // Exponential backoff
    }
    throw error;
  }
}

/**
 * Simple in-memory cache helper
 */
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

export function getCachedData<T>(key: string): T | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data as T;
  }
  return null;
}

export function setCachedData(key: string, data: any): void {
  cache.set(key, { data, timestamp: Date.now() });
}
