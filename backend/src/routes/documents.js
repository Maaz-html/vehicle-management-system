const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const upload = require('../middleware/upload');

router.post('/upload', upload.array('documents', 10), documentController.uploadDocuments);
router.get('/vehicle/:vehicle_id', documentController.getDocumentsByVehicle);
router.get('/:id/download', documentController.downloadDocument);
router.delete('/:id', documentController.deleteDocument);

module.exports = router;
