import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/error-handler';
import { apiLimiter } from './middleware/rateLimit';
import apiRouter from './api/index';

dotenv.config();

const app: Application = express();

// Trust the first proxy hop (Render's load balancer) so req.ip is the real
// client IP — required for correct per-IP rate limiting behind the proxy.
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// CORS configuration. CORS_ORIGIN may be a comma-separated list so multiple
// front-ends can share the API (e.g. the GitHub Pages site + the mobile web
// build under pyramidfestival.com). A single value still works unchanged.
app.use(
  cors({
    origin: (process.env.CORS_ORIGIN || 'http://localhost:5173')
      .split(',')
      .map((o) => o.trim()),
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, _res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API routes (general rate-limit backstop across all endpoints)
app.use('/api', apiLimiter, apiRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Global error handler (must be last)
app.use(errorHandler);

export default app;
