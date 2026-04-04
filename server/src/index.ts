import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { runMigrations } from './db/migrate';
import authRoutes      from './routes/auth.routes';
import userRoutes      from './routes/user.routes';
import recordRoutes    from './routes/record.routes';
import dashboardRoutes from './routes/dashboard.routes';
import chatRoutes      from './routes/chat.routes';

const app  = express();
const PORT = process.env.PORT || 4000;

// ── Run DB migrations on startup ─────────────────────────────
// (Migrated to bottom for cleaner startup sequence)


const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  process.env.FRONTEND_URL
].filter(Boolean) as string[];

app.use(cors({ 
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true 
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check for cloud platform status monitoring
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
});

// ── Rate Limiting ─────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// ── Health Check ──────────────────────────────────────────────
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Finance API is running', timestamp: new Date().toISOString() });
});

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/users',     userRoutes);
app.use('/api/records',   recordRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/chat',      chatRoutes);

// ── 404 Handler ───────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Global Error Handler ──────────────────────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// ── Start Server ──────────────────────────────────────────────
(async () => {
  try {
    console.log('⏳ Running database migrations...');
    await runMigrations();
    app.listen(PORT, () => {
      console.log(`🚀 Finance API server running at http://localhost:${PORT}`);
      console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (err) {
    console.error('❌ Failed to start server due to migration error:', err);
    process.exit(1);
  }
})();

export default app;

