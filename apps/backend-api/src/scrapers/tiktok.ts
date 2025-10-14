import { logger } from '../utils/logger';

export async function getTikTokTrending(category?: string): Promise<any[]> {
  try {
    logger.info('🔍 Fetching TikTok trending data...');

  // Para desarrollo se usa datos simulados
  // En producción se debería usar la API de TikTok Research o hacer scraping
    return getMockTikTokData(category);

  } catch (error) {
    logger.error('❌ TikTok API call failed:', error);
    return getMockTikTokData(category);
  }
}

function getMockTikTokData(category?: string): any[] {
  const mockTikToks = [
    {
      title: "Baile viral #DanceChallenge2024 supera los 50M de views",
      source: 'tiktok',
      url: 'https://tiktok.com/@user/video/example1',
      excerpt: 'Nuevo challenge de baile que está rompiendo TikTok con millones de recreaciones...',
      score: 980,
      mentions: 52000000,
      tags: ['dancechallenge', 'viral', 'baile', 'trend'],
      category: 'entretenimiento',
      language: 'es',
      meta: {
        creator: '@dancemaker',
        video_views: 52000000,
        likes: 8500000,
        shares: 1200000,
        duration: 15
      }
    },
    {
      title: "Truco de cocina #CookingHack se vuelve viral",
      source: 'tiktok',
      url: 'https://tiktok.com/@chef/video/example2',
      excerpt: 'Chef revela truco secreto para hacer pasta perfecta en solo 3 minutos...',
      score: 750,
      mentions: 15000000,
      tags: ['cookinghack', 'pasta', 'chef', 'receta'],
      category: 'gastronomia',
      language: 'es',
      meta: {
        creator: '@chefpro',
        video_views: 15000000,
        likes: 2100000,
        shares: 850000,
        duration: 30
      }
    },
    {
      title: "Outfit del día #OOTD con ropa de segunda mano",
      source: 'tiktok',
      url: 'https://tiktok.com/@fashionista/video/example3',
      excerpt: 'Influencer muestra cómo crear looks increíbles con ropa vintage y sostenible...',
      score: 620,
      mentions: 8500000,
      tags: ['ootd', 'fashion', 'vintage', 'sostenible', 'thrift'],
      category: 'moda',
      language: 'es',
      meta: {
        creator: '@ecofashion',
        video_views: 8500000,
        likes: 1500000,
        shares: 320000,
        duration: 45
      }
    }
  ];

  return category ? mockTikToks.filter(t => t.category === category) : mockTikToks;
}

// Se mantiene la función original para compatibilidad con versiones anteriores
export async function scrapeTikTokTrending(): Promise<number> {
  const trends = await getTikTokTrending();
  return trends.length;
}