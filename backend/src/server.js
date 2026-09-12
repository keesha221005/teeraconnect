import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import apiRouter from './routes/api.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend client
app.use(cors({
  origin: '*', // For development, allow any origin. Can be locked down later.
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-role']
}));

app.use(express.json({ limit: '10mb' })); // support base64 images
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Load API routes
app.use('/api', apiRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Error Handler] Caught error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Bind server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`================================================`);
  console.log(`TeeraConnect Backend Server running on port ${PORT}`);
  console.log(`Health Check: http://localhost:${PORT}/health`);
  console.log(`API Endpoints base: http://localhost:${PORT}/api`);
  console.log(`================================================`);
});
