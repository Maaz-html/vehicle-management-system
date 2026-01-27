const express = require('express');
const router = express.Router();
const pool = require('../utils/database');
const { generateInvoice } = require('../utils/pdfGenerator');
const auth = require('../middleware/auth');

router.get('/:vehicleId', auth, async (req, res) => {
    try {
        const { vehicleId } = req.params;

        const vehicleQuery = `
            SELECT v.*, c.name, c.phone 
            FROM vehicles v
            JOIN clients c ON v.client_id = c.id
            WHERE v.id = $1
        `;
        const result = await pool.query(vehicleQuery, [vehicleId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Vehicle not found' });
        }

        const vehicle = result.rows[0];
        const client = {
            name: vehicle.name,
            phone: vehicle.phone
        };

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice-${vehicleId}.pdf`);

        generateInvoice(vehicle, client, res);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error generating invoice' });
    }
});

module.exports = router;
