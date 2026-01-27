const pool = require('../utils/database');
const fs = require('fs');

// Upload documents
const uploadDocuments = async (req, res) => {
  try {
    const { vehicle_id } = req.body;

    if (!vehicle_id) {
      return res.status(400).json({ error: 'Vehicle ID is required' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    for (const file of req.files) {
      await pool.query(
        'INSERT INTO documents (vehicle_id, file_path, original_filename, file_size) VALUES ($1, $2, $3, $4)',
        [vehicle_id, file.filename, file.originalname, file.size]
      );
    }

    res.status(201).json({ message: 'Documents uploaded successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get documents by vehicle ID
const getDocumentsByVehicleId = async (req, res) => {
  try {
    const { vehicleId } = req.params;

    const result = await pool.query(
      'SELECT * FROM documents WHERE vehicle_id = $1',
      [vehicleId]
    );

    const documents = result.rows.map(doc => ({
      ...doc,
      url: `${req.protocol}://${req.get('host')}/uploads/${doc.file_path}`
    }));

    res.json(documents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete document
const deleteDocument = async (req, res) => {
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
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ message: 'Document deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  uploadDocuments,
  getDocumentsByVehicleId,
  deleteDocument,
};
