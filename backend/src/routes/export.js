const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');
const auth = require('../middleware/auth');

router.get('/excel', auth, exportController.exportToExcel);

module.exports = router;
