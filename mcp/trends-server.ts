#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

// Crear servidor MCP siguiendo mejores prácticas del video
const server = new Server(
  {
    name: 'trends-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Esquemas de validación con Zod
const GetTrendsSchema = z.object({
  category: z.string().optional(),
  date: z.string().optional(), 
  platform: z.enum(['youtube', 'reddit', 'tiktok', 'all']).optional().default('all'),
  source: z.enum(['youtube', 'twitter', 'tiktok', 'reddit', 'news']).optional(),
  subreddits: z.string().optional(), // comma-separated list, e.g. "technology,gaming"
  limit: z.number().min(1).max(100).default(20),
});

const GetTrendDetailSchema = z.object({
  id: z.string(),
});

const SearchTrendsSchema = z.object({
  query: z.string(),
  category: z.string().optional(),
});

const GenerateContentIdeasSchema = z.object({
  category: z.string().optional(),
  content_type: z.enum(['video', 'post', 'articulo']).default('video'),
  count: z.number().min(1).max(10).default(5),
});

// Handler para listar herramientas disponibles
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_trends',
        description: 'Obtiene las tendencias más populares del momento. Usa el parámetro platform para elegir la fuente (youtube, reddit, tiktok, all). Devuelve momentumScore para que puedas evaluar tendencias emergentes.',
        inputSchema: {
          type: 'object',
          properties: {
            platform: {
              type: 'string',
              enum: ['youtube', 'reddit', 'tiktok', 'all'],
              description: 'Plataforma de origen: "reddit" (usa API pública, datos reales), "tiktok" (vía Apify/RapidAPI), "youtube", o "all" para todas. Default: "all".',
            },
            subreddits: {
              type: 'string',
              description: 'Lista separada por comas de subreddits a escanear, ej: "technology,gaming,worldnews". Solo aplica cuando platform es "reddit" o "all".',
            },
            category: {
              type: 'string',
              description: 'Categoría de tendencias: moda, tecnología, entretenimiento, deportes, etc.',
            },
            date: {
              type: 'string', 
              description: 'Fecha específica en formato YYYY-MM-DD para obtener tendencias de ese día',
            },
            source: {
              type: 'string',
              enum: ['youtube', 'twitter', 'tiktok', 'reddit', 'news'],
              description: '(Legado) Fuente específica de datos. Usa "platform" en su lugar.',
            },
            limit: {
              type: 'number',
              description: 'Número máximo de tendencias a devolver (1-100, default: 20)',
              minimum: 1,
              maximum: 100,
            }
          },
        },
      },
      {
        name: 'get_trend_detail',
        description: 'Obtiene información detallada de una tendencia específica incluyendo métricas, engagement y contexto.',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'ID único de la tendencia para obtener sus detalles completos',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'search_trends', 
        description: 'Busca tendencias usando palabras clave o términos específicos en títulos y descripciones.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Término o frase de búsqueda para encontrar tendencias relacionadas',
            },
            category: {
              type: 'string',
              description: 'Categoría opcional para enfocar la búsqueda en un tema específico',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'generate_content_ideas',
        description: 'Genera ideas de contenido creativas basadas en las tendencias más actuales y virales.',
        inputSchema: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              description: 'Categoría de contenido: moda, tech, entretenimiento, etc.',
            },
            content_type: {
              type: 'string',
              enum: ['video', 'post', 'articulo'],
              description: 'Tipo de contenido a generar: video, post o artículo',
            },
            count: {
              type: 'number',
              description: 'Número de ideas a generar (1-10, default: 5)',
              minimum: 1,
              maximum: 10,
            },
          },
        },
      },
    ],
  };
});

// Handler principal para ejecutar herramientas
server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'get_trends':
        return await handleGetTrends(args);
      
      case 'get_trend_detail':
        return await handleGetTrendDetail(args);
      
      case 'search_trends':
        return await handleSearchTrends(args);
        
      case 'generate_content_ideas':
        return await handleGenerateContentIdeas(args);
        
      default:
        throw new Error(`Herramienta no encontrada: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido'
          }, null, 2)
        }
      ]
    };
  }
});

// === HANDLERS DE HERRAMIENTAS ===

async function handleGetTrends(args: any) {
  const validated = GetTrendsSchema.parse(args);
  const { category, date, platform, source, subreddits, limit } = validated;

  try {
    let items: any[] = [];
    let total = 0;

    // Use the unified provider endpoint when platform is specified (reddit/tiktok/all)
    // It returns TrendItem[] with momentumScore for early-trend evaluation
    if (platform && platform !== 'all' ? ['reddit', 'tiktok'].includes(platform) : true) {
      const unifiedUrl = new URL('http://localhost:3001/trends/unified');
      unifiedUrl.searchParams.set('platform', platform ?? 'all');
      unifiedUrl.searchParams.set('limit', limit.toString());
      if (category) unifiedUrl.searchParams.set('category', category);
      if (subreddits) unifiedUrl.searchParams.set('subreddits', subreddits);

      const unifiedResponse = await fetch(unifiedUrl.toString());
      if (unifiedResponse.ok) {
        const unifiedData = await unifiedResponse.json() as any;
        items = unifiedData.items ?? [];
        total = unifiedData.total ?? items.length;
      }
    }

    // Fallback / supplement with legacy endpoint for youtube/twitter or when unified is empty
    if (items.length === 0 || (source && !['reddit', 'tiktok'].includes(source))) {
      const legacyUrl = new URL('http://localhost:3001/trends');
      if (category) legacyUrl.searchParams.set('category', category);
      if (date) legacyUrl.searchParams.set('date', date);
      if (source) legacyUrl.searchParams.set('source', source);
      else if (platform && platform !== 'all') legacyUrl.searchParams.set('source', platform);
      legacyUrl.searchParams.set('limit', limit.toString());

      const legacyResponse = await fetch(legacyUrl.toString());
      if (legacyResponse.ok) {
        const legacyData = await legacyResponse.json() as any;
        if (items.length === 0) {
          items = legacyData.items ?? [];
          total = legacyData.total ?? items.length;
        }
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            message: `Encontradas ${total} tendencias`,
            trends: items,
            total,
            filters_applied: { 
              platform: platform ?? 'all',
              category: category || 'todas',
              date: date || 'hoy',
              source: source || 'todas las fuentes',
              subreddits: subreddits || 'default',
              limit 
            },
            momentum_note: 'momentumScore = upvotes/hora (Reddit) o playCount (TikTok). Valores más altos = tendencia más emergente.',
            timestamp: new Date().toISOString()
          }, null, 2)
        }
      ]
    };
  } catch (error) {
    throw new Error(`Error conectando con la API de tendencias: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

async function handleGetTrendDetail(args: any) {
  const validated = GetTrendDetailSchema.parse(args);
  const { id } = validated;

  try {
    const response = await fetch(`http://localhost:3001/trends/${id}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`No se encontró una tendencia con ID: ${id}`);
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const trend = await response.json() as any;

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            trend: trend,
            analysis: {
              engagement_level: getEngagementLevel(trend.score),
              viral_potential: getViralPotential(trend.mentions, trend.score),
              best_time_to_post: getBestTimeToPost(trend.source),
              recommended_hashtags: generateHashtags(trend.tags, trend.category)
            }
          }, null, 2)
        }
      ]
    };
  } catch (error) {
    throw new Error(`Error obteniendo detalle de tendencia: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

async function handleSearchTrends(args: any) {
  const validated = SearchTrendsSchema.parse(args);
  const { query, category } = validated;

  try {
    const url = new URL('http://localhost:3001/trends/search');
    url.searchParams.set('q', query);
    if (category) url.searchParams.set('category', category);

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json() as any;

    return {
      content: [
        {
          type: 'text', 
          text: JSON.stringify({
            success: true,
            message: `Búsqueda de "${query}" completada`,
            results: data.items || [],
            search_term: query,
            category_filter: category || 'todas',
            total_found: data.total || 0,
            suggestions: generateSearchSuggestions(query, data.items || [])
          }, null, 2)
        }
      ]
    };
  } catch (error) {
    throw new Error(`Error en búsqueda de tendencias: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

async function handleGenerateContentIdeas(args: any) {
  const validated = GenerateContentIdeasSchema.parse(args);
  const { category, content_type, count } = validated;

  try {
    // Obtener tendencias actuales para inspiración
    const trendsUrl = new URL('http://localhost:3001/trends');
    if (category) trendsUrl.searchParams.set('category', category);
    trendsUrl.searchParams.set('limit', '15'); // Más tendencias para mejor variedad

    const trendsResponse = await fetch(trendsUrl.toString());
    
    if (!trendsResponse.ok) {
      throw new Error(`Error obteniendo tendencias: HTTP ${trendsResponse.status}`);
    }
    
    const trendsData = await trendsResponse.json() as any;
    const trends = trendsData.items || [];

    if (trends.length === 0) {
      throw new Error('No hay tendencias disponibles para generar ideas de contenido');
    }

    // Generar ideas creativas basadas en tendencias
    const contentIdeas = trends.slice(0, count).map((trend: any, index: number) => ({
      id: index + 1,
      title: generateCreativeTitle(trend, content_type),
      concept: generateConcept(trend, content_type),
      hook: generateHook(trend, content_type),
      duration: getOptimalDuration(content_type),
      estimated_engagement: calculateEngagementPotential(trend.score),
      best_platforms: getBestPlatforms(trend.source, content_type),
      optimal_posting_time: getOptimalPostingTime(trend.source),
      hashtags: generateHashtags(trend.tags, trend.category),
      call_to_action: generateCallToAction(content_type),
      trend_context: {
        title: trend.title,
        source: trend.source,
        score: trend.score,
        category: trend.category
      }
    }));

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            message: `Generated ${count} ${content_type} ideas based on current trends`,
            content_ideas: contentIdeas,
            meta: {
              category: category || 'mixed',
              content_type: content_type,
              total_ideas: contentIdeas.length,
              based_on_trends: trends.length,
              generation_date: new Date().toISOString()
            },
            pro_tips: getContentTips(content_type, category)
          }, null, 2)
        }
      ]
    };
  } catch (error) {
    throw new Error(`Error generando ideas de contenido: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

// === FUNCIONES AUXILIARES ===

function getEngagementLevel(score: number): string {
  if (score > 800) return 'MUY ALTO (Viral)';
  if (score > 500) return 'ALTO';
  if (score > 200) return 'MEDIO'; 
  return 'BAJO';
}

function getViralPotential(mentions: number, score: number): string {
  const combinedScore = (mentions / 1000) + score;
  if (combinedScore > 1000) return 'VIRAL CONFIRMADO 🔥';
  if (combinedScore > 500) return 'ALTO POTENCIAL ⚡';
  if (combinedScore > 200) return 'POTENCIAL MODERADO 📈';
  return 'EMERGENTE 🌱';
}

function getBestTimeToPost(source: string): string {
  const timeMap: Record<string, string> = {
    tiktok: '18:00-22:00 (engagement peak)',
    youtube: '14:00-16:00 y 20:00-22:00', 
    twitter: '09:00-10:00 y 19:00-21:00',
    reddit: '06:00-08:00 y 20:00-23:00',
    news: '07:00-09:00 y 17:00-19:00'
  };
  return timeMap[source] || '18:00-21:00 (horario general)';
}

function generateCreativeTitle(trend: any, contentType: string): string {
  const templates = {
    video: [
      `🔥 ${trend.title}: Lo que NADIE te cuenta`,
      `${trend.title} - Reacción ÉPICA`,
      `VIRAL: ${trend.title} explicado en 60 segundos`,
      `¿Por qué ${trend.title} está rompiendo internet?`
    ],
    post: [
      `📈 TRENDING: ${trend.title}`,
      `🚨 ${trend.title} - Thread completo`,
      `💡 ${trend.title}: 5 cosas que debes saber`,
      `🔥 ${trend.title} - Mi opinión HOT`
    ],
    articulo: [
      `Análisis profundo: ${trend.title}`,
      `La verdad detrás de ${trend.title}`,
      `${trend.title}: Guía completa 2024`,
      `Cómo ${trend.title} está cambiando ${trend.category}`
    ]
  };
  
  const categoryTemplates = templates[contentType as keyof typeof templates] || templates.video;
  return categoryTemplates[Math.floor(Math.random() * categoryTemplates.length)] as string;
}

function generateConcept(trend: any, contentType: string): string {
  return `Contenido ${contentType} que capitaliza la tendencia "${trend.title}" desde ${trend.source}, enfocándose en ${trend.category} con un enfoque único y engagement alto.`;
}

function generateHook(trend: any, contentType: string): string {
  const hooks = {
    video: [
      `"¿Has visto lo que está pasando con ${trend.title}?"`,
      `"Todo el mundo habla de ${trend.title}, pero..."`,
      `"STOP scrolling - ${trend.title} explicado fácil"`,
      `"${trend.title} está viral por esta razón 👇"`
    ],
    post: [
      `🧵 HILO: Todo sobre ${trend.title}`,
      `⚡ BREAKING: ${trend.title} está trending`,
      `🔥 Hot take: ${trend.title}`,
      `📊 DATA: Por qué ${trend.title} importa`
    ],
    articulo: [
      `En los últimos días, ${trend.title} ha capturado la atención...`,
      `Si aún no sabes qué es ${trend.title}, aquí te explico...`,
      `El fenómeno ${trend.title} está redefiniendo...`
    ]
  };
  
  const categoryHooks = hooks[contentType as keyof typeof hooks] || hooks.video;
  return categoryHooks[Math.floor(Math.random() * categoryHooks.length)] as string;
}

function getOptimalDuration(contentType: string): string {
  const durations: Record<string, string> = {
    video: '15-60 segundos (TikTok/Shorts) o 3-8 minutos (YouTube)',
    post: '1-5 tweets/posts en thread',
    articulo: '800-1500 palabras'
  };
  return durations[contentType] || '30-60 segundos';
}

function calculateEngagementPotential(score: number): string {
  if (score > 700) return 'MUY ALTO (90-95%)';
  if (score > 400) return 'ALTO (70-85%)';  
  if (score > 200) return 'MEDIO (50-70%)';
  return 'MODERADO (30-50%)';
}

function getBestPlatforms(source: string, contentType: string): string[] {
  const platformMap: Record<string, Record<string, string[]>> = {
    tiktok: {
      video: ['TikTok', 'Instagram Reels', 'YouTube Shorts'],
      post: ['TikTok', 'Instagram', 'Twitter'],
      articulo: ['Blog', 'Medium', 'LinkedIn']
    },
    youtube: {
      video: ['YouTube', 'TikTok', 'Instagram'],
      post: ['YouTube Community', 'Twitter', 'Instagram'],
      articulo: ['Blog personal', 'Medium', 'YouTube descripción']
    },
    twitter: {
      video: ['Twitter', 'TikTok', 'Instagram Stories'],
      post: ['Twitter/X', 'LinkedIn', 'Instagram'],
      articulo: ['Thread de Twitter', 'LinkedIn', 'Newsletter']
    },
    reddit: {
      video: ['YouTube', 'TikTok', 'Reddit Video'],
      post: ['Reddit', 'Twitter', 'Discord'],
      articulo: ['Reddit post', 'Blog', 'Medium']
    }
  };
  
  return platformMap[source]?.[contentType] || ['Multiplataforma'];
}

function getOptimalPostingTime(source: string): string {
  return getBestTimeToPost(source);
}

function generateHashtags(tags: string[], category: string): string[] {
  const baseHashtags = tags.map(tag => `#${tag}`);
  const categoryHashtags = [`#${category}`, '#trending', '#viral'];
  const generalHashtags = ['#fyp', '#parati', '#contenido'];
  
  return [...baseHashtags, ...categoryHashtags, ...generalHashtags].slice(0, 8);
}

function generateCallToAction(contentType: string): string {
  const ctas: Record<string, string[]> = {
    video: [
      '¿Qué opinas? 👇 Comenta y comparte',
      'Dale LIKE si te gustó y COMPARTE con tus amigos',
      '¿Te sorprendió? Reacciona y sígueme para más'
    ],
    post: [
      '¿Estás de acuerdo? RT y cuéntame tu opinión',
      'COMPARTE si crees que más gente debería saber esto',
      '¿Qué piensas? COMENTA tu experiencia'
    ],
    articulo: [
      '¿Te resultó útil este análisis? Comparte tu opinión en los comentarios',
      'Si este artículo te ayudó, compártelo con quien creas que le puede servir'
    ]
  };
  
  const options = ctas[contentType] || ctas.video;
  if (!options || options.length === 0) {
    return '¡Comparte tu opinión en los comentarios!';
  }
  return options[Math.floor(Math.random() * options.length)] as string;
}

function getContentTips(contentType: string, category?: string): string[] {
  const tips = [
    '🎯 Usa trending hashtags, pero no más de 8',
    '⏰ Publica en horarios de alta actividad',
    '🔥 Crea hooks potentes en los primeros 3 segundos',
    '💬 Responde a TODOS los comentarios las primeras horas',
    '📊 Monitorea métricas y ajusta estrategia en tiempo real'
  ];

  if (category === 'tecnología') {
    tips.push('💻 Incluye demos o ejemplos prácticos', '🤖 Menciona impacto futuro o tendencias tech');
  }
  
  if (contentType === 'video') {
    tips.push('🎬 Usa buenos ángulos y lighting', '🎵 Música trending pero que no compita con tu voz');
  }

  return tips;
}

function generateSearchSuggestions(query: string, results: any[]): string[] {
  const relatedTerms = results.flatMap((r: any) => r.tags || [])
    .filter((tag: string) => !query.toLowerCase().includes(tag.toLowerCase()))
    .slice(0, 5);
    
  return [`${query} tutorial`, `${query} 2024`, ...relatedTerms];
}

// === INICIALIZACIÓN DEL SERVIDOR ===

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  // Log de inicio solo a stderr para no interferir con MCP
  console.error('🚀 MCP Trends Server iniciado correctamente');
  console.error('📊 Herramientas disponibles: get_trends, get_trend_detail, search_trends, generate_content_ideas');
  console.error('🔧 Transporte: STDIO (ideal para desarrollo local)');
}

// Manejo de errores y cierre limpio
process.on('SIGINT', () => {
  console.error('👋 Cerrando MCP Trends Server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.error('👋 Cerrando MCP Trends Server...');
  process.exit(0);
});

main().catch((error) => {
  console.error('❌ Error fatal iniciando MCP server:', error);
  process.exit(1);
});