# APIs Reales - Plan de Implementación

## 🎯 Prioridad: ELIMINAR Mock Data de Producción

### **📋 Plan de Ejecución: APIs Reales**

## **1. YouTube Data API v3** ⭐ EMPEZAR AQUÍ
**Tiempo estimado: 2-3 días**

### Setup:
```bash
# 1. Obtener API key (gratis hasta 10,000 requests/día)
# - Ir a Google Cloud Console
# - Crear proyecto
# - Habilitar YouTube Data API v3
# - Crear credencial API key
```

### Implementación:
```typescript
// apps/backend-api/src/scrapers/youtube.ts

import { google } from 'googleapis';

const youtube = google.youtube('v3');

export async function getRealYouTubeData(category?: string): Promise<any[]> {
  try {
    const response = await youtube.videos.list({
      key: process.env.YOUTUBE_API_KEY,
      part: ['snippet', 'statistics'],
      chart: 'mostPopular',
      regionCode: 'ES', // España
      maxResults: 25,
      videoCategoryId: getCategoryId(category)
    });

    return response.data.items?.map(video => ({
      title: video.snippet?.title,
      source: 'youtube',
      url: `https://youtube.com/watch?v=${video.id}`,
      excerpt: video.snippet?.description?.substring(0, 200),
      score: calculateScore(video.statistics),
      mentions: parseInt(video.statistics?.viewCount || '0'),
      tags: video.snippet?.tags || [],
      category: mapCategory(video.snippet?.categoryId),
      language: 'es',
      meta: {
        channelTitle: video.snippet?.channelTitle,
        publishedAt: video.snippet?.publishedAt,
        duration: video.contentDetails?.duration,
        viewCount: video.statistics?.viewCount,
        likeCount: video.statistics?.likeCount,
        commentCount: video.statistics?.commentCount
      }
    })) || [];

  } catch (error) {
    console.error('YouTube API error:', error);
    throw new Error('Failed to fetch YouTube data');
  }
}
```

---

## **2. Reddit API** ⭐ SEGUNDA PRIORIDAD  
**Tiempo estimado: 2-3 días**

### Setup:
```bash
# 1. Crear app en Reddit
# - reddit.com/prefs/apps
# - Crear "script" application
# - Obtener client_id y client_secret
```

### Implementación:
```typescript
// apps/backend-api/src/scrapers/reddit.ts

export async function getRealRedditData(category?: string): Promise<any[]> {
  try {
    // OAuth token
    const authResponse = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });

    const { access_token } = await authResponse.json();

    // Get trending posts
    const subreddit = getSubredditByCategory(category) || 'popular';
    const response = await fetch(`https://oauth.reddit.com/r/${subreddit}/hot`, {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'User-Agent': 'TrendsMCP/1.0'
      }
    });

    const data = await response.json();
    
    return data.data.children.map(post => ({
      title: post.data.title,
      source: 'reddit',
      url: `https://reddit.com${post.data.permalink}`,
      excerpt: post.data.selftext?.substring(0, 200),
      score: post.data.score,
      mentions: post.data.num_comments,
      tags: [post.data.subreddit, ...extractHashtags(post.data.title)],
      category: mapRedditCategory(post.data.subreddit),
      language: 'es',
      meta: {
        subreddit: post.data.subreddit,
        author: post.data.author,
        created_utc: post.data.created_utc,
        upvote_ratio: post.data.upvote_ratio,
        num_comments: post.data.num_comments
      }
    }));

  } catch (error) {
    console.error('Reddit API error:', error);
    throw new Error('Failed to fetch Reddit data');
  }
}
```

---

## **3. Twitter/X API v2** ⚠️ COMPLEJA
**Tiempo estimado: 3-5 días (requiere aprobación)**

### Setup:
```bash
# 1. Aplicar a Twitter Developer Account
# 2. Crear app y obtener Bearer Token
# 3. Puede tomar días en aprobar
```

### Implementación:
```typescript
// apps/backend-api/src/scrapers/twitter.ts

export async function getRealTwitterData(category?: string): Promise<any[]> {
  try {
    const response = await fetch('https://api.twitter.com/2/tweets/search/recent', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
        'Content-Type': 'application/json'
      },
      params: new URLSearchParams({
        query: buildTwitterQuery(category),
        'tweet.fields': 'public_metrics,created_at,author_id',
        'max_results': '25'
      })
    });

    const data = await response.json();
    
    return data.data?.map(tweet => ({
      title: tweet.text.substring(0, 100) + '...',
      source: 'twitter',
      url: `https://twitter.com/user/status/${tweet.id}`,
      excerpt: tweet.text,
      score: calculateTwitterScore(tweet.public_metrics),
      mentions: tweet.public_metrics.retweet_count + tweet.public_metrics.reply_count,
      tags: extractHashtags(tweet.text),
      category: 'social',
      language: 'es',
      meta: {
        retweet_count: tweet.public_metrics.retweet_count,
        like_count: tweet.public_metrics.like_count,
        reply_count: tweet.public_metrics.reply_count,
        created_at: tweet.created_at
      }
    })) || [];

  } catch (error) {
    console.error('Twitter API error:', error);
    throw new Error('Failed to fetch Twitter data');
  }
}
```

---

## **4. TikTok Data** 🔧 ALTERNATIVAS
**Tiempo estimado: 4-7 días (más complejo)**

### Opciones:
1. **TikTok Research API** (limitado, requiere aprobación académica)
2. **Web Scraping** con Puppeteer (más riesgoso pero funcional)
3. **TikTok Creative Center** (datos públicos limitados)

### Implementación Scraping:
```typescript
// apps/backend-api/src/scrapers/tiktok.ts
import puppeteer from 'puppeteer';

export async function getRealTikTokData(category?: string): Promise<any[]> {
  const browser = await puppeteer.launch({ headless: true });
  
  try {
    const page = await browser.newPage();
    await page.goto('https://www.tiktok.com/discover', { waitUntil: 'networkidle2' });
    
    const trends = await page.evaluate(() => {
      // Extraer datos del DOM de TikTok
      const trendElements = document.querySelectorAll('[data-e2e="discover-item"]');
      return Array.from(trendElements).map(el => ({
        // Parsear datos de trending hashtags
      }));
    });

    return trends.map(trend => ({
      title: trend.hashtag,
      source: 'tiktok',
      url: `https://tiktok.com/tag/${trend.hashtag}`,
      excerpt: `Hashtag trending: ${trend.hashtag}`,
      score: trend.viewCount || 0,
      mentions: trend.videoCount || 0,
      tags: [trend.hashtag],
      category: 'entretenimiento',
      language: 'es',
      meta: {
        viewCount: trend.viewCount,
        videoCount: trend.videoCount
      }
    }));

  } finally {
    await browser.close();
  }
}
```

---

## **🔧 Arquitectura con Cache Inteligente**

```typescript
// apps/backend-api/src/services/cacheService.ts

class APICache {
  private cache = new Map<string, { data: any[], timestamp: number }>();
  private CACHE_DURATION = {
    youtube: 30 * 60 * 1000,  // 30 min
    reddit: 15 * 60 * 1000,   // 15 min  
    twitter: 5 * 60 * 1000,   // 5 min
    tiktok: 60 * 60 * 1000    // 1 hour (scraping lento)
  };

  async getOrFetch(platform: string, category: string, fetcher: () => Promise<any[]>): Promise<any[]> {
    const key = `${platform}-${category}`;
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION[platform]) {
      return cached.data;
    }

    try {
      const fresh = await fetcher();
      this.cache.set(key, { data: fresh, timestamp: Date.now() });
      return fresh;
    } catch (error) {
      // Devolver cache expirado si API falla
      return cached?.data || [];
    }
  }
}
```

---

## **📋 Cronograma Sugerido**

### **Semana 1:**
- ✅ **Día 1-2**: YouTube API (más fácil)
- ✅ **Día 3-4**: Reddit API  
- ✅ **Día 5**: Cache system y testing

### **Semana 2:**
- ✅ **Día 1-3**: Twitter API (si aprobado) o alternativa
- ✅ **Día 4-5**: TikTok scraping o Creative Center
- ✅ **Día 6-7**: Integración y optimización

### **🎯 Objetivo:** Eliminar completamente mock data para producción

¿Empezamos con YouTube API que es la más sencilla?