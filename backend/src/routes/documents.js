const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const {
  uploadDocuments,
  getDocumentsByVehicleId,
  deleteDocument,
} = require('../controllers/documentController');

const upload = multer({
  dest: path.join(__dirname, '../../uploads'),
});

router.post('/', upload.array('documents'), uploadDocuments);
router.get('/:vehicleId', getDocumentsByVehicleId);
router.delete('/:id', deleteDocument);

module.exports = router;
