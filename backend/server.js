import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';


import { testConnection } from './config/db.js';
import { seedDatabase } from './seed.js';

import authRoutes from './routes/auth.js';
import customerRoutes from './routes/customers.js';
import chitRoutes from './routes/chits.js';
import transactionRoutes from './routes/transactions.js';
import savedRecordRoutes from './routes/savedRecords.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', authRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/chits', chitRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/saved-records', savedRecordRoutes);


// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'DreamWay Credit Management API is running' });
});

// Serve frontend static build files if deployed on cPanel together
const possiblePaths = [
  path.join(__dirname, 'public'),
  path.join(__dirname, 'dist'),
  path.join(__dirname, '../frontend/dist')
];
const frontendDistPath = possiblePaths.find(p => fs.existsSync(path.join(p, 'index.html'))) || path.join(__dirname, 'public');
app.use(express.static(frontendDistPath));

app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    const indexPath = path.join(frontendDistPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(200).send('DreamWay Credit Management API is active.');
    }
  }
});


// Start Server & Auto-Seed Database
app.listen(PORT, async () => {
  console.log(`====================================================`);
  console.log(`🚀 DreamWay Server running on http://localhost:${PORT}`);
  console.log(`====================================================`);

  const dbConnected = await testConnection();
  if (dbConnected) {
    await seedDatabase();
  } else {
    console.log('ℹ️ Running in memory mode until MySQL credentials are configured.');
  }
});
