import winston from 'winston';
import { config } from '../config';

const { combine, timestamp, errors, json, colorize, printf } = winston.format;

// Custom format for development
const devFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

export const logger = winston.createLogger({
  level: config.logLevel,
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    config.isDevelopment 
      ? combine(colorize(), devFormat)
      : json()
  ),
  transports: [
    new winston.transports.Console(),
    // Add file transport for production
    ...(config.isProduction ? [
      new winston.transports.File({ 
        filename: 'logs/error.log', 
        level: 'error' 
      }),
      new winston.transports.File({ 
        filename: 'logs/combined.log' 
      })
    ] : [])
  ],
  // Don't exit on handled exceptions
  exitOnError: false,
});

// Handle uncaught exceptions and rejections
if (config.isProduction) {
  logger.exceptions.handle(
    new winston.transports.File({ filename: 'logs/exceptions.log' })
  );
  
  logger.rejections.handle(
    new winston.transports.File({ filename: 'logs/rejections.log' })
  );
}