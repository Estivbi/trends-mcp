import { Router, Request, Response } from 'express';
import { getTrends, getTrendById } from '../services/trendsService';
import { body, query, validationResult } from 'express-validator';

const router = Router();

// Validation middleware
const validateGetTrends = [
  query('date').optional().isISO8601().withMessage('Date must be in ISO8601 format'),
  query('category').optional().isString().trim().escape(),
  query('source').optional().isIn(['youtube', 'twitter', 'tiktok', 'reddit', 'news']),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('offset').optional().isInt({ min: 0 }).toInt(),
  query('language').optional().isString().isLength({ min: 2, max: 5 })
];

// GET /api/trends - Get trends with filters
router.get('/', validateGetTrends, async (req: Request, res: Response) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      date,
      category,
      source,
      limit = 20,
      offset = 0,
      language = 'es'
    } = req.query;

    const result = await getTrends({
      date: date as string,
      category: category as string,
      source: source as string,
      limit: Number(limit),
      offset: Number(offset),
      language: language as string
    });

    return res.json({
      success: true,
      data: result.items,
      pagination: {
        total: result.total,
        limit: Number(limit),
        offset: Number(offset),
        hasMore: result.total > Number(offset) + Number(limit)
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch trends',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/trends/:id - Get trend by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id || id.length !== 24) {
      return res.status(400).json({
        success: false,
        error: 'Invalid trend ID'
      });
    }

    const trend = await getTrendById(id);
    
    if (!trend) {
      return res.status(404).json({
        success: false,
        error: 'Trend not found'
      });
    }

    return res.json({
      success: true,
      data: trend
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch trend',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;