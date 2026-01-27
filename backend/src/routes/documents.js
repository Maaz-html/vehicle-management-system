const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const {
  uploadDocuments,
  getDocumentsByVehicleId,
  deleteDocument,
} = require('../controllers/documentController');

// Use memory storage for Supabase upload
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

router.post('/', upload.array('documents'), uploadDocuments);
router.get('/:vehicleId', getDocumentsByVehicleId);
router.delete('/:id', deleteDocument);

module.exports = router;
