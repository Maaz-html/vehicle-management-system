const db = require('../utils/database');
const path = require('path');
const fs = require('fs');

// Upload documents
exports.uploadDocuments = (req, res) => {
    const { vehicle_id } = req.body;

    if (!vehicle_id) {
        return res.status(400).json({ error: 'Vehicle ID is required' });
    }

    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
    }

    const documents = [];
    let completed = 0;

    req.files.forEach((file) => {
        const fileData = {
            vehicle_id,
            filename: file.filename,
            original_filename: file.originalname,
            file_path: file.path,
            file_size: file.size
        };

        db.run(
            `INSERT INTO documents (vehicle_id, filename, original_filename, file_path, file_size)
       VALUES (?, ?, ?, ?, ?)`,
            [fileData.vehicle_id, fileData.filename, fileData.original_filename, fileData.file_path, fileData.file_size],
            function (err) {
                if (err) {
                    console.error('Error saving document:', err);
                } else {
                    documents.push({
                        id: this.lastID,
                        ...fileData
                    });
                }

                completed++;
                if (completed === req.files.length) {
                    res.status(201).json(documents);
                }
            }
        );
    });
};

// Get documents by vehicle ID
exports.getDocumentsByVehicle = (req, res) => {
    const { vehicle_id } = req.params;

    db.all(
        'SELECT * FROM documents WHERE vehicle_id = ? ORDER BY uploaded_at DESC',
        [vehicle_id],
        (err, rows) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(rows);
        }
    );
};

// Download document
exports.downloadDocument = (req, res) => {
    const { id } = req.params;

    db.get('SELECT * FROM documents WHERE id = ?', [id], (err, document) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!document) {
            return res.status(404).json({ error: 'Document not found' });
        }

        const filePath = path.resolve(document.file_path);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found on server' });
        }

        res.download(filePath, document.original_filename);
    });
};

// Delete document
exports.deleteDocument = (req, res) => {
    const { id } = req.params;

    db.get('SELECT * FROM documents WHERE id = ?', [id], (err, document) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!document) {
            return res.status(404).json({ error: 'Document not found' });
        }

        // Delete file from filesystem
        const filePath = path.resolve(document.file_path);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Delete from database
        db.run('DELETE FROM documents WHERE id = ?', [id], function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: 'Document deleted successfully' });
        });
    });
};
