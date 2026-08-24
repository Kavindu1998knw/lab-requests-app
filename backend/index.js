import 'dotenv/config';
import express from 'express';
import { connectDatabase } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import sampleRoutes from './routes/sampleRoutes.js';
import { getSampleStats } from './controllers/sampleController.js';
import { errorHandler } from './middleware/errorMiddleware.js';

const app = express();
const port = Number(process.env.PORT) || 3000;

// CORS Middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    database: 'connected',
    architecture: 'MVC',
    timestamp: new Date().toISOString(),
  });
});

// MVC Routes
app.use('/api/auth', authRoutes);
app.use('/api/samples', sampleRoutes);
app.get('/api/stats', getSampleStats);

// Lazy Database Connection Middleware for Serverless
app.use(async (_req, _res, next) => {
  try {
    await connectDatabase();
  } catch (err) {
    console.error('Lazy DB connection error:', err);
  }
  next();
});

// Centralized Error Handler
app.use(errorHandler);

// Start Server locally if not running on Vercel
const startServer = async () => {
  await connectDatabase();
  app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 LabFlow API Server running on port ${port} in clean MVC architecture.`);
  });
};

if (!process.env.VERCEL) {
  startServer();
}

export default app;
