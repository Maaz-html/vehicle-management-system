import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Middleware
import errorHandler from './middleware/errorHandler.js';

// Routes
import clientRoutes from './routes/clients.js';
import vehicleRoutes from './routes/vehicles.js';
import documentRoutes from './routes/documents.js';
import exportRoutes from './routes/export.js';
import authRoutes from './routes/auth.js';
import invoiceRoutes from './routes/invoices.js';
import notificationRoutes from './routes/notifications.js';

// Init database
import './utils/database.js';

const app = express();
const PORT = process.env.PORT || 5000;

/* ------------------ FIX __dirname ------------------ */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ------------------ Middleware ------------------ */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ------------------ Uploads Directory ------------------ */
const uploadsDir = path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

/* ------------------ Routes ------------------ */
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/notifications', notificationRoutes);

/* ------------------ Health Check ------------------ */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Vehicle Management System API is running'
  });
});

/* ------------------ Error Handler ------------------ */
app.use(errorHandler);

/* ------------------ Start Server ------------------ */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api`);
});

export default app;
