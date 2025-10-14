import axios from 'axios';
import { logger } from '../utils/logger';

interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  url: string;
  subreddit: string;
  author: string;
  score: number;
  ups: number;
  num_comments: number;
  created_utc: number;
  upvote_ratio: number;
}

const SUBREDDIT_CATEGORIES: Record<string, string> = {
  'funny': 'comedia',
  'gaming': 'gaming',
  'worldnews': 'noticias',
  'technology': 'tecnologia',
  'science': 'ciencia',
  'music': 'musica',
  'movies': 'pelicula',
  'television': 'entretenimiento',
  'sports': 'deportes',
  'food': 'gastronomia',
  'fashion': 'moda',
  'travel': 'viajes',
  'fitness': 'salud',
  'DIY': 'howto',
  'lifehacks': 'howto',
  'todayilearned': 'educacion'
};

export async function getRedditTrending(category?: string): Promise<any[]> {
  try {
    logger.info('🔍 Fetching Reddit trending data...');

  // Para desarrollo se usan datos simulados
  // En producción se puede usar la API de Reddit o hacer scraping
    return getMockRedditData(category);

  } catch (error) {
    logger.error('❌ Reddit API call failed:', error);
    return getMockRedditData(category);
  }
}

function getMockRedditData(category?: string): any[] {
  const mockPosts = [
    {
      title: "TIL que el 90% de desarrolladores usan Stack Overflow",
      source: 'reddit',
      url: 'https://reddit.com/r/todayilearned/example1',
      excerpt: 'Increíble estadística sobre cómo los desarrolladores resuelven problemas...',
      score: 720,
      mentions: 15000,
      tags: ['til', 'programacion', 'stackoverflow'],
      category: 'educacion',
      language: 'es',
      meta: {
        subreddit: 'todayilearned',
        author: 'user123',
        num_comments: 340,
        upvote_ratio: 0.92
      }
    },
    {
      title: "Nuevo bug en WhatsApp permite leer mensajes eliminados",
      source: 'reddit',
      url: 'https://reddit.com/r/technology/example2',
      excerpt: 'Investigadores descubren vulnerabilidad en la app de mensajería...',
      score: 850,
      mentions: 12000,
      tags: ['whatsapp', 'security', 'bug', 'privacidad'],
      category: 'tecnologia',
      language: 'es',
      meta: {
        subreddit: 'technology',
        author: 'security_expert',
        num_comments: 280,
        upvote_ratio: 0.89
      }
    },
    {
      title: "Streamer gana 50,000€ en una sola partida de poker online",
      source: 'reddit',
      url: 'https://reddit.com/r/gaming/example3',
      excerpt: 'Increíble jugada en directo que se volvió viral en Twitch...',
      score: 650,
      mentions: 8500,
      tags: ['twitch', 'poker', 'streaming', 'viral'],
      category: 'gaming',
      language: 'es',
      meta: {
        subreddit: 'gaming',
        author: 'poker_fan',
        num_comments: 190,
        upvote_ratio: 0.94
      }
    }
  ];

  return category ? mockPosts.filter(p => p.category === category) : mockPosts;
}

// Se mantiene la función original para compatibilidad con versiones anteriores
export async function scrapeRedditTrending(): Promise<number> {
  const trends = await getRedditTrending();
  return trends.length;
}