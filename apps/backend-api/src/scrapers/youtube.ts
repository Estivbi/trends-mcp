import axios from 'axios';
import { config } from '../config';
import { logger } from '../utils/logger';

interface YouTubeTrendingVideo {
  id: string;
  snippet: {
    title: string;
    description: string;
    channelTitle: string;
    publishedAt: string;
    tags?: string[];
    categoryId: string;
  };
  statistics: {
    viewCount: string;
    likeCount: string;
    commentCount: string;
  };
}

const CATEGORY_MAPPING: Record<string, string> = {
  '1': 'pelicula',
  '2': 'vehiculos',
  '10': 'musica',
  '15': 'mascotas',
  '17': 'deportes',
  '19': 'viajes',
  '20': 'gaming',
  '22': 'gente',
  '23': 'comedia',
  '24': 'entretenimiento',
  '25': 'noticias',
  '26': 'howto',
  '27': 'educacion',
  '28': 'ciencia'
};

// Nueva función que devuelve datos de tendencias directamente
export async function getYouTubeTrending(category?: string): Promise<any[]> {
  try {
    const apiKey = config.youtubeApiKey;
    
    if (!apiKey) {
      logger.warn('YouTube API key not configured, using mock data');
      return getMockYouTubeData(category);
    }

    logger.info('🔍 Fetching YouTube trending data...');

    const response = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
      params: {
        part: 'snippet,statistics',
        chart: 'mostPopular',
        regionCode: 'ES',
        maxResults: 20,
        key: apiKey
      }
    });

    const videos = response.data.items as YouTubeTrendingVideo[];
    const trends: any[] = [];

    for (const video of videos) {
      try {
        const views = parseInt(video.statistics.viewCount) || 0;
        const likes = parseInt(video.statistics.likeCount) || 0;
        const comments = parseInt(video.statistics.commentCount) || 0;

        if (views < 10000) continue;

        const videoCategory = CATEGORY_MAPPING[video.snippet.categoryId] || 'entretenimiento';
        
        // Filter by category if specified
        if (category && videoCategory !== category) continue;

        const score = calculateYouTubeScore(views, likes, comments);

        trends.push({
          title: video.snippet.title,
          source: 'youtube',
          url: `https://www.youtube.com/watch?v=${video.id}`,
          excerpt: video.snippet.description.slice(0, 300),
          score,
          mentions: views,
          tags: video.snippet.tags || [],
          category: videoCategory,
          language: 'es',
          meta: {
            channel: video.snippet.channelTitle,
            publishedAt: video.snippet.publishedAt,
            categoryId: video.snippet.categoryId,
            statistics: video.statistics
          }
        });
        
      } catch (error) {
        logger.error(`Error processing YouTube video ${video.id}:`, error);
      }
    }

    return trends.sort((a, b) => b.score - a.score);

  } catch (error) {
    logger.error('❌ YouTube API call failed:', error);
    return getMockYouTubeData(category);
  }
}

// Datos simulados para desarrollo o como respaldo
function getMockYouTubeData(category?: string): any[] {
  const mockVideos = [
    {
      title: "Tutorial de React 2024 - Lo más nuevo",
      source: 'youtube',
      url: 'https://youtube.com/watch?v=example1',
      excerpt: 'Aprende React desde cero con las últimas funcionalidades de React 19...',
      score: 850,
      mentions: 125000,
      tags: ['react', 'javascript', 'tutorial', '2024'],
      category: 'educacion',
      language: 'es',
      meta: {
        channel: 'TechChannel',
        publishedAt: new Date().toISOString(),
        statistics: { viewCount: '125000', likeCount: '5200', commentCount: '340' }
      }
    },
    {
      title: "IA revoluciona el gaming - ChatGPT en videojuegos",
      source: 'youtube',
      url: 'https://youtube.com/watch?v=example2',
      excerpt: 'Cómo la inteligencia artificial está cambiando los videojuegos para siempre...',
      score: 920,
      mentions: 98000,
      tags: ['ia', 'gaming', 'chatgpt', 'tecnologia'],
      category: 'gaming',
      language: 'es',
      meta: {
        channel: 'GameTech',
        publishedAt: new Date().toISOString(),
        statistics: { viewCount: '98000', likeCount: '4100', commentCount: '280' }
      }
    },
    {
      title: "Nuevas tendencias de moda 2024",
      source: 'youtube',
      url: 'https://youtube.com/watch?v=example3',
      excerpt: 'Las tendencias de moda que dominarán este año según los influencers...',
      score: 720,
      mentions: 75000,
      tags: ['moda', '2024', 'tendencias', 'estilo'],
      category: 'moda',
      language: 'es',
      meta: {
        channel: 'FashionTrends',
        publishedAt: new Date().toISOString(),
        statistics: { viewCount: '75000', likeCount: '3100', commentCount: '190' }
      }
    }
  ];

  return category ? mockVideos.filter(v => v.category === category) : mockVideos;
}

function calculateYouTubeScore(views: number, likes: number, comments: number): number {
  // Engagement rate calculation
  const engagementRate = (likes + comments) / views;
  const baseScore = Math.log10(views + 1) * 10;
  const engagementBoost = engagementRate * 1000;
  
  return Math.round(baseScore + engagementBoost);
}

// Se mantiene la función original para compatibilidad con versiones anteriores
export async function scrapeYouTubeTrending(): Promise<number> {
  const trends = await getYouTubeTrending();
  return trends.length;
}