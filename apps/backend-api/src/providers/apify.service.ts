/**
 * Apify / RapidAPI adapter — structure for TikTok & Instagram trending data.
 *
 * This adapter is intentionally lightweight: it calls a configurable external
 * HTTP endpoint and normalises the response to TrendItem[].
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  HOW TO ACTIVATE                                                        │
 * │  1. Set APIFY_API_KEY (or RAPIDAPI_KEY) in your .env file.              │
 * │  2. Replace the TODO endpoint below with your Apify Actor run URL       │
 * │     or the RapidAPI endpoint for TikTok trending.                       │
 * │  3. Adjust the response mapping in `normalise()` to match the payload.  │
 * └─────────────────────────────────────────────────────────────────────────┘
 */

import axios from 'axios';
import { logger } from '../utils/logger';
import { cache } from './cache';
import type { TrendItem, FetchOptions, TrendProvider } from './TrendProvider';

const CACHE_TTL_MS = 20 * 60 * 1000; // 20 minutes

// TODO: replace with your Apify Actor run URL or RapidAPI TikTok endpoint
const APIFY_ENDPOINT =
  process.env.APIFY_ENDPOINT ?? '';

// TODO: set APIFY_API_KEY or RAPIDAPI_KEY in your environment
const APIFY_API_KEY = process.env.APIFY_API_KEY ?? '';

/** Normalise a single raw record from the external API into a TrendItem. */
function normalise(raw: Record<string, unknown>, index: number): TrendItem {
  // TODO: adjust field mapping to match the actual Apify / RapidAPI payload
  return {
    id: `tiktok_${(raw['id'] as string | undefined) ?? index}`,
    title:
      (raw['title'] as string | undefined) ??
      (raw['desc'] as string | undefined) ??
      'Untitled',
    source: 'tiktok',
    url: (raw['webVideoUrl'] as string | undefined) ?? (raw['url'] as string | undefined) ?? '',
    momentumScore: Number((raw['playCount'] as number | undefined) ?? (raw['views'] as number | undefined) ?? 0),
    type: 'audio', // TikTok trends are primarily audio-driven
    timestamp:
      (raw['createTime'] as string | undefined) ??
      new Date().toISOString(),
  };
}

export class ApifyService implements TrendProvider {
  async fetchTrends(options: FetchOptions = {}): Promise<TrendItem[]> {
    if (!APIFY_ENDPOINT) {
      logger.warn(
        '[ApifyService] APIFY_ENDPOINT not configured — skipping TikTok/IG fetch. ' +
        'Set APIFY_ENDPOINT and APIFY_API_KEY in your .env to enable this adapter.'
      );
      return [];
    }

    const cacheKey = `apify:trends:${options.category ?? 'all'}:${options.limit ?? 25}`;
    const cached = cache.get<TrendItem[]>(cacheKey);
    if (cached) return cached;

    logger.info('[ApifyService] Fetching TikTok/IG trends from external endpoint');

    // Generic HTTP call — works for Apify run results or any RapidAPI endpoint
    const response = await axios.get<Record<string, unknown>[]>(APIFY_ENDPOINT, {
      headers: {
        'Content-Type': 'application/json',
        // TODO: swap header name if using RapidAPI ('x-rapidapi-key')
        Authorization: `Bearer ${APIFY_API_KEY}`,
      },
      params: {
        // TODO: add niche / keyword params supported by your chosen Actor
        limit: options.limit ?? 25,
        ...(options.category ? { category: options.category } : {}),
      },
      timeout: 15000,
    });

    const rawItems: Record<string, unknown>[] = Array.isArray(response.data)
      ? response.data
      : [];

    const items = rawItems.map(normalise);
    cache.set(cacheKey, items, CACHE_TTL_MS);
    return items;
  }
}

export const apifyService = new ApifyService();
