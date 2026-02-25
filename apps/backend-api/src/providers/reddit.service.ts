/**
 * Reddit "Rising" adapter — implements TrendProvider using Reddit's public JSON API.
 *
 * No authentication is required for public subreddits.
 * API endpoint: GET https://www.reddit.com/r/{subreddit}/rising.json
 *
 * momentumScore = (upvotes / max(hoursOld, 0.1))
 *   → measures upvotes per hour (velocity), which is a proxy for early-stage virality.
 */

import axios from 'axios';
import { logger } from '../utils/logger';
import { cache } from './cache';
import type { TrendItem, FetchOptions, TrendProvider } from './TrendProvider';

const DEFAULT_SUBREDDITS = [
  'technology',
  'worldnews',
  'gaming',
  'science',
  'music',
  'movies',
];

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

interface RedditChild {
  data: {
    id: string;
    title: string;
    selftext: string;
    url: string;
    subreddit: string;
    score: number;
    ups: number;
    upvote_ratio: number;
    num_comments: number;
    created_utc: number;
    permalink: string;
    is_video: boolean;
  };
}

interface RedditListingResponse {
  data: {
    children: RedditChild[];
  };
}

function calcMomentumScore(ups: number, createdUtc: number): number {
  const ageMs = Date.now() - createdUtc * 1000;
  const hoursOld = Math.max(ageMs / (1000 * 60 * 60), 0.1);
  return Math.round(ups / hoursOld);
}

async function fetchSubredditRising(subreddit: string, limit: number): Promise<TrendItem[]> {
  const cacheKey = `reddit:rising:${subreddit}:${limit}`;
  const cached = cache.get<TrendItem[]>(cacheKey);
  if (cached) return cached;

  const url = `https://www.reddit.com/r/${subreddit}/rising.json?limit=${limit}`;
  const response = await axios.get<RedditListingResponse>(url, {
    headers: { 'User-Agent': 'trends-mcp/1.0' },
    timeout: 10000,
  });

  const items: TrendItem[] = response.data.data.children.map((child: RedditChild) => {
    const post = child.data;
    return {
      id: `reddit_${post.id}`,
      title: post.title,
      source: 'reddit',
      url: `https://www.reddit.com${post.permalink}`,
      momentumScore: calcMomentumScore(post.ups, post.created_utc),
      type: post.is_video ? 'video' : 'keyword',
      timestamp: new Date(post.created_utc * 1000).toISOString(),
    };
  });

  cache.set(cacheKey, items, CACHE_TTL_MS);
  return items;
}

export class RedditService implements TrendProvider {
  async fetchTrends(options: FetchOptions = {}): Promise<TrendItem[]> {
    const subreddits = options.subreddits?.length
      ? options.subreddits
      : DEFAULT_SUBREDDITS;
    const perSub = Math.ceil((options.limit ?? 25) / subreddits.length);

    logger.info(`[RedditService] Fetching rising posts from ${subreddits.length} subreddits`);

    const results = await Promise.allSettled(
      subreddits.map((sub) => fetchSubredditRising(sub, perSub))
    );

    const items: TrendItem[] = [];
    results.forEach((result, i) => {
      if (result.status === 'fulfilled') {
        items.push(...result.value);
      } else {
        logger.warn(
          `[RedditService] Failed to fetch subreddit r/${subreddits[i]}:`,
          result.reason
        );
      }
    });

    return items.sort((a, b) => b.momentumScore - a.momentumScore);
  }
}

export const redditService = new RedditService();
