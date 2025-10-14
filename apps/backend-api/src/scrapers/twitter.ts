import { logger } from '../utils/logger';

export async function getTwitterTrending(category?: string): Promise<any[]> {
  try {
    logger.info('🔍 Fetching Twitter/X trending data...');

  // Para desarrollo se usan datos simulados
  // En producción se puede usar la API de Twitter v2 o hacer scraping
    return getMockTwitterData(category);

  } catch (error) {
    logger.error('❌ Twitter API call failed:', error);
    return getMockTwitterData(category);
  }
}

function getMockTwitterData(category?: string): any[] {
  const mockTweets = [
    {
      title: "#OpenAI lanza GPT-5 con capacidades multimodales",
      source: 'twitter',
      url: 'https://twitter.com/openai/status/example1',
      excerpt: 'La nueva versión de GPT puede procesar texto, imágenes, audio y video simultáneamente...',
      score: 950,
      mentions: 45000,
      tags: ['openai', 'gpt5', 'ia', 'multimodal'],
      category: 'tecnologia',
      language: 'es',
      meta: {
        tweet_volume: 45000,
        hashtags: ['#OpenAI', '#GPT5', '#IA'],
        trending_region: 'España'
      }
    },
    {
      title: "#ElClasico trending por la polémica del VAR",
      source: 'twitter',
      url: 'https://twitter.com/trending/elclasico',
      excerpt: 'Miles de usuarios debaten sobre las decisiones arbitrales en el partido...',
      score: 870,
      mentions: 38000,
      tags: ['elclasico', 'var', 'futbol', 'real-madrid', 'barcelona'],
      category: 'deportes',
      language: 'es',
      meta: {
        tweet_volume: 38000,
        hashtags: ['#ElClasico', '#VAR', '#RealMadrid'],
        trending_region: 'España'
      }
    },
    {
      title: "#BlackFriday2024 - Ofertas que arrasan en redes",
      source: 'twitter',
      url: 'https://twitter.com/trending/blackfriday',
      excerpt: 'Las mejores ofertas del Black Friday generan miles de interacciones...',
      score: 680,
      mentions: 25000,
      tags: ['blackfriday', 'ofertas', 'descuentos', 'compras'],
      category: 'moda',
      language: 'es',
      meta: {
        tweet_volume: 25000,
        hashtags: ['#BlackFriday2024', '#Ofertas', '#Descuentos'],
        trending_region: 'España'
      }
    }
  ];

  return category ? mockTweets.filter(t => t.category === category) : mockTweets;
}

// Se mantiene la función original para compatibilidad con versiones anteriores
export async function scrapeTwitterTrending(): Promise<number> {
  const trends = await getTwitterTrending();
  return trends.length;
}