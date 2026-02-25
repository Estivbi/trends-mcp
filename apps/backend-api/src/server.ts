import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { logger } from './utils/logger';
import { config } from './config';

// Importar servicios de API (sin base de datos)
import { getYouTubeTrending } from './scrapers/youtube';
import { getRedditTrending } from './scrapers/reddit';
import { getTwitterTrending } from './scrapers/twitter';
import { getTikTokTrending } from './scrapers/tiktok';

// Importar adaptadores de la nueva arquitectura de proveedores
import { redditService } from './providers/reddit.service';
import { apifyService } from './providers/apify.service';
import type { TrendItem } from './providers/TrendProvider';

async function startServer() {
  try {
    const app = express();

    // Middleware de seguridad y CORS
    app.use(helmet());
    app.use(cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:4321',
      credentials: true
    }));
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true }));

    // Limitación de velocidad (rate limiting)
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: 100 // límite de 100 solicitudes por IP cada 15 minutos
    });
    app.use(limiter);

    // Logging de solicitudes
    app.use((req, res, next) => {
      logger.info(`${req.method} ${req.path}`, { 
        ip: req.ip, 
        userAgent: req.get('User-Agent') 
      });
      next();
    });

    // Endpoint de salud
    app.get('/health', (req, res) => {
      res.json({
        success: true,
        service: 'Servidor API de Tendencias',
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        architecture: 'Llamadas directas a API (sin base de datos)'
      });
    });

    // === ENDPOINTS DE API DE TENDENCIAS EN VIVO ===

    // GET /trends - Obtener contenido trending de todas las plataformas
    app.get('/trends', async (req, res) => {
      try {
        const { 
          category, 
          source, 
          limit = '20',
          date 
        } = req.query;

        logger.info('Fetching live trends', { category, source, limit, date });

        const limitNum = Math.min(parseInt(limit as string), 100);
        const results: any[] = [];

        // Obtener de las fuentes solicitadas o todas las fuentes
        const sources = source ? [source] : ['youtube', 'reddit', 'twitter', 'tiktok'];

        for (const platform of sources) {
          try {
            let platformTrends: any[] = [];

            switch (platform) {
              case 'youtube':
                platformTrends = await getYouTubeTrending(category as string);
                break;
              case 'reddit':
                platformTrends = await getRedditTrending(category as string);
                break;
              case 'twitter':
                platformTrends = await getTwitterTrending(category as string);
                break;
              case 'tiktok':
                platformTrends = await getTikTokTrending(category as string);
                break;
            }

            // Add platform identifier and limit results per platform
            const platformResults = platformTrends
              .slice(0, Math.ceil(limitNum / sources.length))
              .map(trend => ({
                ...trend,
                source: platform,
                id: `${platform}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
              }));

            results.push(...platformResults);
          } catch (error) {
            logger.error(`Error fetching ${platform} trends:`, error);
            // Continue with other platforms even if one fails
          }
        }

        // Sort by score/engagement and limit
        const sortedResults = results
          .sort((a, b) => (b.score || 0) - (a.score || 0))
          .slice(0, limitNum);

        res.json({
          success: true,
          items: sortedResults,
          total: sortedResults.length,
          sources: sources,
          timestamp: new Date().toISOString(),
          architecture: 'live_api_calls'
        });

      } catch (error) {
        logger.error('Error in /trends endpoint:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to fetch trends',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // GET /trends/unified - Feed unificado usando los adaptadores TrendProvider
    // Acepta ?platform=youtube|reddit|tiktok|all y devuelve TrendItem[] con momentumScore
    app.get('/trends/unified', async (req, res) => {
      try {
        const {
          platform = 'all',
          subreddits,
          limit = '25',
          category,
        } = req.query;

        const limitNum = Math.min(parseInt(limit as string, 10), 100);
        const subredditList = subreddits
          ? (subreddits as string).split(',').map((s) => s.trim()).filter(Boolean)
          : undefined;

        const opts = {
          limit: limitNum,
          ...(subredditList ? { subreddits: subredditList } : {}),
          ...(category ? { category: category as string } : {}),
        };

        const fetches: Promise<TrendItem[]>[] = [];

        if (platform === 'reddit' || platform === 'all') {
          fetches.push(redditService.fetchTrends(opts).catch((err) => {
            logger.error('[/trends/unified] Reddit fetch failed:', err);
            return [];
          }));
        }

        if (platform === 'tiktok' || platform === 'all') {
          fetches.push(apifyService.fetchTrends(opts).catch((err) => {
            logger.error('[/trends/unified] Apify/TikTok fetch failed:', err);
            return [];
          }));
        }

        const settled = await Promise.all(fetches);
        const allItems: TrendItem[] = ([] as TrendItem[]).concat(...settled);

        const sorted = allItems
          .sort((a, b) => b.momentumScore - a.momentumScore)
          .slice(0, limitNum);

        return res.json({
          success: true,
          items: sorted,
          total: sorted.length,
          platform,
          timestamp: new Date().toISOString(),
        });

      } catch (error) {
        logger.error('Error in /trends/unified endpoint:', error);
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch unified trends',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    // GET /trends/search - Buscar tendencias en todas las plataformas
    app.get('/trends/search', async (req, res) => {
      try {
        const { q: query, category, limit = '10' } = req.query;

        if (!query) {
          return res.status(400).json({
            success: false,
            error: 'Query parameter "q" is required'
          });
        }

        logger.info('Searching trends', { query, category, limit });

        // Fetch all trends and filter by query
        const allTrends: any[] = [];
        const sources = ['youtube', 'reddit', 'twitter', 'tiktok'];

        for (const platform of sources) {
          try {
            let platformTrends: any[] = [];

            switch (platform) {
              case 'youtube':
                platformTrends = await getYouTubeTrending(category as string);
                break;
              case 'reddit':
                platformTrends = await getRedditTrending(category as string);
                break;
              case 'twitter':
                platformTrends = await getTwitterTrending(category as string);
                break;
              case 'tiktok':
                platformTrends = await getTikTokTrending(category as string);
                break;
            }

            allTrends.push(...platformTrends.map(trend => ({
              ...trend,
              source: platform,
              id: `${platform}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            })));
          } catch (error) {
            logger.error(`Error fetching ${platform} for search:`, error);
          }
        }

        // Filter by search query
        const queryLower = (query as string).toLowerCase();
        const filteredTrends = allTrends.filter(trend => 
          trend.title?.toLowerCase().includes(queryLower) ||
          trend.excerpt?.toLowerCase().includes(queryLower) ||
          trend.tags?.some((tag: string) => tag.toLowerCase().includes(queryLower))
        );

        const limitNum = parseInt(limit as string);
        const results = filteredTrends
          .sort((a, b) => (b.score || 0) - (a.score || 0))
          .slice(0, limitNum);

        res.json({
          success: true,
          items: results,
          total: results.length,
          query: query,
          searched_sources: sources.length,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        logger.error('Error in /trends/search endpoint:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to search trends',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // GET /trends/:id - Obtener detalle de tendencia (implementación mock)
    app.get('/trends/:id', async (req, res) => {
      try {
        const { id } = req.params;
        
        // Parse platform from ID
        const platform = id.split('_')[0];
        
        logger.info('Fetching trend detail', { id, platform });

        // Para el MVP, devolvemos datos mock detallados
        // En producción, podrías llamar APIs específicas para más detalles
        const mockTrend = {
          id,
          title: `Detailed view for trend ${id}`,
          source: platform,
          url: `https://${platform}.com/example`,
          excerpt: `This is a detailed view of the trend from ${platform}. In a real implementation, this would fetch more detailed information from the platform's API.`,
          score: Math.floor(Math.random() * 1000) + 500,
          mentions: Math.floor(Math.random() * 50000) + 10000,
          tags: ['example', 'trending', platform],
          category: 'general',
          language: 'es',
          firstSeen: new Date(Date.now() - Math.random() * 86400000).toISOString(),
          lastSeen: new Date().toISOString(),
          meta: {
            platform_specific_data: `Data from ${platform}`,
            engagement_rate: Math.random() * 100,
            viral_coefficient: Math.random() * 10
          }
        };

        res.json({
          success: true,
          data: mockTrend,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        logger.error('Error in /trends/:id endpoint:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to fetch trend details',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // 404 handler
    app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.originalUrl,
        available_endpoints: [
          'GET /health',
          'GET /trends',
          'GET /trends/unified',
          'GET /trends/search',
          'GET /trends/:id'
        ]
      });
    });

    // Error handler
    app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
      logger.error('Unhandled error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
    });

    // Start server
    const server = app.listen(config.server.port || 3000, () => {
      logger.info(`🚀 Server running on port ${config.port}`);
      logger.info(`📝 Environment: ${config.nodeEnv}`);
      logger.info(`🔗 CORS origin: ${config.corsOrigin}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        logger.info('Process terminated');
      });
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received. Shutting down gracefully...');
      server.close(() => {
        logger.info('Process terminated');
      });
    });

  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();