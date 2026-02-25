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
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

const store = new Map<string, CacheEntry<unknown>>();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cleanupTimer: any = (globalThis as any).setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.expiresAt) {
      store.delete(key);
    }
  }
}, CLEANUP_INTERVAL_MS);

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

  /** Stop the background cleanup interval — call this in tests or on graceful shutdown. */
  destroy(): void {
    if (cleanupTimer !== null) {
      (globalThis as any).clearInterval(cleanupTimer); // eslint-disable-line @typescript-eslint/no-explicit-any
      cleanupTimer = null;
    }
  },
};
