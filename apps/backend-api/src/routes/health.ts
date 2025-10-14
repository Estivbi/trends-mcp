import { Router } from 'express';

const router = Router();

// Endpoint principal de salud
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API de Tendencias MCP está funcionando',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    arquitectura: 'Sin base de datos - API directa'
  });
});

// Endpoint de estado de la arquitectura sin base de datos
router.get('/architecture', (req, res) => {
  res.json({
    success: true,
    architecture: {
      type: 'API directa sin base de datos',
      scrapers: ['YouTube', 'Reddit', 'Twitter', 'TikTok'],
      data_source: 'Mock data en tiempo real',
      mcp_integration: 'Servidor MCP STDIO disponible',
      status: 'Operativo'
    },
    timestamp: new Date().toISOString()
  });
});

export default router;