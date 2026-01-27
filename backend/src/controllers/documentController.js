const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const documentController = require('../controllers/documentController');

// Multer setup
const upload = multer({
  dest: path.join(__dirname, '../../uploads'),
});

// Routes
router.post(
  '/',
  upload.array('documents'),
  documentController.uploadDocuments
);

router.get(
  '/:vehicleId',
  documentController.getDocumentsByVehicleId
);

router.delete(
  '/:id',
  documentController.deleteDocument
);

module.exports = router;
