import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Servidor (puerto 3001 para no conflictar con MCP en desarrollo)
  server: {
    port: parseInt(process.env.PORT || '3001')
  },
  port: parseInt(process.env.PORT || '3001'),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // JWT
  jwtSecret: process.env.JWT_SECRET || 'fallback-secret-change-in-production',
  
  // CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:4321',
  
  // Rate limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  
  // LLM APIs
  openaiApiKey: process.env.OPENAI_API_KEY,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  
  // MCP
  mcpSecret: process.env.MCP_SECRET || 'default-mcp-secret',
  mcpServerUrl: process.env.MCP_SERVER_URL || 'http://localhost:4000',
  
  // Social Media APIs
  youtubeApiKey: process.env.YOUTUBE_API_KEY,
  twitterBearerToken: process.env.TWITTER_BEARER_TOKEN,
  redditClientId: process.env.REDDIT_CLIENT_ID,
  redditClientSecret: process.env.REDDIT_CLIENT_SECRET,
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
  
  // Development
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production'
};