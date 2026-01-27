const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const {
  uploadDocuments,
  getDocumentsByVehicleId,
  deleteDocument,
} = require('../controllers/documentController');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.post('/', upload.array('documents'), uploadDocuments);
router.get('/:vehicleId', getDocumentsByVehicleId);
router.delete('/:id', deleteDocument);

module.exports = router;
