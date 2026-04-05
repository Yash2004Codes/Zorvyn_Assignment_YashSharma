/**
 * Express Server Entry Point for Zorvyn Finance Dashboard.
 * 
 * Responsibilities:
 * - Environment configuration & initialization.
 * - Database migration on startup.
 * - Middleware orchestration (CORS, Rate Limiting, JSON Parsing).
 * - Route registration for Auth, Users, Records, Chat, and Dashboards.
 * - Global error handling and health monitoring.
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';

// Load environmental variables from .env.local for development and production
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { runMigrations } from './db/migrate';
import authRoutes      from './routes/auth.routes';
import userRoutes      from './routes/user.routes';
import recordRoutes    from './routes/record.routes';
import dashboardRoutes from './routes/dashboard.routes';
import chatRoutes      from './routes/chat.routes';

import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './utils/swagger';

const app  = express();
// Default port 4000 can be overridden by environment variable
const PORT = process.env.PORT || 4000;

// Resolve front-end origins (handles comma-separated values for multiple environments)
const frontendUrls = (process.env.FRONTEND_URL || '')
  .split(',')
  .map(u => u.trim())
  .filter(Boolean);

// Define allowed origins for Cross-Origin Resource Sharing (CORS)
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  ...frontendUrls,
].filter(Boolean) as string[];

console.log('✅ CORS allowed origins:', allowedOrigins);

/**
 * CORS Middleware Configuration:
 * - Restricts requests to trusted origins.
 * - Allows wildcard subdomains for platforms like Netlify and Render.
 * - Supports credentials (cookies/auth headers).
 */
app.use(cors({
  origin: (origin, callback) => {
    // Allow no-origin requests (e.g., local curl calls or platform health checks)
    if (!origin) return callback(null, true);

    const isAllowed =
      allowedOrigins.includes(origin) ||
      /\.netlify\.app$/.test(origin) ||
      /\.onrender\.com$/.test(origin) ||
      process.env.CORS_ALLOW_ALL === 'true'; // Emergency escape hatch for bypass

    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`🚫 CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));


// Body parsers for processing JSON and form-encoded data payloads
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Trust Proxy: Required for platforms like Render/Heroku where app is behind a reverse proxy.
// This ensures rate limiting and logs see the client IP, not the proxy IP.
app.set('trust proxy', 1);


// ── Rate Limiting Section ─────────────────────────────────────
// Prevents Denial of Service (DoS) and brute force attacks.

// 1. General API limiter: Scaled for high developer usage but strict in production.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15-minute window
  max: process.env.NODE_ENV === 'production' ? 500 : 2000, // Dynamic cap
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// 2. Auth Limiter: Stricter limit on login attempts to prevent automated credential testing.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15-minute window
  max: process.env.NODE_ENV === 'production' ? 30 : 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts, please try again later.' },
});
app.use('/api/auth', authLimiter);


// Basic health check for monitoring systems
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Finance API is running', status: 'ok', timestamp: new Date().toISOString() });
});


// ── Primary App Routes ─────────────────────────────────────────
app.use('/api/auth',      authRoutes);      // Login, Registration, Token verification
app.use('/api/users',     userRoutes);      // Admin-level user management
app.use('/api/records',   recordRoutes);    // Financial record CRUD operations
app.use('/api/dashboard', dashboardRoutes); // High-level aggregations & summaries
app.use('/api/chat',      chatRoutes);      // AI Assistant requests

// ── Swagger UI ────────────────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
console.log(`📖 Swagger documentation available at: http://localhost:${PORT}/api-docs`);


// Catch-all 404 Route: Returns status 404 for any undefined resource paths.
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});


// Global Error Handler: Catches unhandled promise rejections or server errors.
// Prevents exposing sensitive stack traces to users.
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});


/**
 * Startup Sequence:
 * 1. Executes PostgreSQL schema migrations.
 * 2. Seeds initial test data if database is empty.
 * 3. Starts the Express listener on the configured port.
 */
(async () => {
  try {
    console.log('⏳ Running database migrations...');
    await runMigrations(); // Ensures tables and indexes exist
    app.listen(PORT, () => {
      console.log(`🚀 Finance API server running at http://localhost:${PORT}`);
      console.log(`📋 API Baseline: http://localhost:${PORT}/api/health`);
    });
  } catch (err) {
    console.error('❌ Failed to start server due to migration error:', err);
    process.exit(1); // Fatal exit
  }
})();

export default app;
