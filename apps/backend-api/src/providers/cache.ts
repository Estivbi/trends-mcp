/**
 * Lightweight in-memory cache with TTL support.
 * Prevents burning external API quotas on repeated calls within the same window.
 * Default TTL: 20 minutes (adjustable per call-site).
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const DEFAULT_TTL_MS = 20 * 60 * 1000; // 20 minutes

const store = new Map<string, CacheEntry<unknown>>();

export const cache = {
  get<T>(key: string): T | null {
    const entry = store.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      store.delete(key);
      return null;
    }
    return entry.data;
  },

  set<T>(key: string, data: T, ttlMs: number = DEFAULT_TTL_MS): void {
    store.set(key, { data, expiresAt: Date.now() + ttlMs });
  },

  /** Remove a specific key (e.g. to force a refresh). */
  invalidate(key: string): void {
    store.delete(key);
  },

  /** Clear all entries — useful in tests. */
  clear(): void {
    store.clear();
  },
};
