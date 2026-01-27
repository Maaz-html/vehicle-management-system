const pool = require('../utils/database');
const path = require('path');
const fs = require('fs');

// Upload documents
exports.uploadDocuments = async (req, res) => {
  try {
    const { vehicle_id } = req.body;

    if (!vehicle_id) {
      return res.status(400).json({ error: 'Vehicle ID is required' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const insertQuery = `
      INSERT INTO documents (vehicle_id, file_path)
      VALUES ($1, $2)
    `;

    for (const file of req.files) {
      await pool.query(insertQuery, [
        vehicle_id,
        file.path
      ]);
    }

    res.status(201).json({
      message: 'Documents uploaded successfully',
      count: req.files.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get documents by vehicle ID
exports.getDocumentsByVehicleId = async (req, res) => {
  try {
    const { vehicleId } = req.params;

    const result = await pool.query(
      'SELECT * FROM documents WHERE vehicle_id = $1',
      [vehicleId]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete document
exports.deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM documents WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const filePath = result.rows[0].file_path;

    // Remove file from disk
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ message: 'Document deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
