const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const errorHandler = require('./middleware/errorHandler');

// Import routes
const clientRoutes = require('./routes/clients');
const vehicleRoutes = require('./routes/vehicles');
const documentRoutes = require('./routes/documents');
const exportRoutes = require('./routes/export');

// Initialize database
require('./utils/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (for uploaded documents)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/clients', clientRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/export', exportRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Vehicle Management System API is running' });
});

// Error handler (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api`);
});

module.exports = app;
