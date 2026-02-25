/**
 * Standardised shape for a single trend item returned by any provider adapter.
 */
export interface TrendItem {
  id: string;
  title: string;
  source: 'tiktok' | 'youtube' | 'reddit';
  url: string;
  momentumScore: number; // velocity metric: higher = faster growing
  type: 'audio' | 'video' | 'keyword';
  timestamp: string; // ISO-8601
}

export interface FetchOptions {
  /** Subreddits (or equivalent channel/niche identifiers) to scan */
  subreddits?: string[];
  limit?: number;
  category?: string;
}

/**
 * Base interface every trend-source adapter must implement.
 * Adding a new data source = creating one file that satisfies this contract.
 */
export interface TrendProvider {
  fetchTrends(options?: FetchOptions): Promise<TrendItem[]>;
}
