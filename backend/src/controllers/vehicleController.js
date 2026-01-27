const db = require('../utils/database');

// Get all vehicles with filters
exports.getAllVehicles = (req, res) => {
    const { search, status, sortBy = 'date', sortOrder = 'DESC' } = req.query;

    let query = `
    SELECT v.*, c.name as client_name, c.phone as client_phone,
           (v.total_charges - v.money_paid) as pending_amount
    FROM vehicles v
    JOIN clients c ON v.client_id = c.id
    WHERE 1=1
  `;
    const params = [];

    // Search filter
    if (search) {
        query += ' AND (c.name LIKE ? OR v.vehicle_number LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
    }

    // Status filter
    if (status) {
        query += ' AND v.process_status = ?';
        params.push(status);
    }

    // Sorting
    const allowedSortFields = ['date', 'money_paid', 'total_charges', 'id'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'date';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    query += ` ORDER BY v.${sortField} ${order}`;

    db.all(query, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
};

// Get vehicle by ID
exports.getVehicleById = (req, res) => {
    const { id } = req.params;

    const query = `
    SELECT v.*, c.name as client_name, c.phone as client_phone,
           (v.total_charges - v.money_paid) as pending_amount
    FROM vehicles v
    JOIN clients c ON v.client_id = c.id
    WHERE v.id = ?
  `;

    db.get(query, [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Vehicle not found' });
        }
        res.json(row);
    });
};

// Create new vehicle
exports.createVehicle = (req, res) => {
    const {
        client_id,
        vehicle_number,
        vehicle_model,
        manufacturing_year,
        work_type,
        date,
        process_status = 'Pending',
        money_paid = 0,
        total_charges = 0
    } = req.body;

    if (!client_id || !vehicle_number || !date) {
        return res.status(400).json({
            error: 'Client ID, vehicle number, and date are required'
        });
    }

    // Validate vehicle number (exactly 10 alphanumeric characters, uppercase)
    if (!/^[A-Z0-9]{10}$/.test(vehicle_number)) {
        return res.status(400).json({
            error: 'Vehicle number must be exactly 10 alphanumeric characters (uppercase, no spaces)'
        });
    }

    db.run(
        `INSERT INTO vehicles (
      client_id, vehicle_number, vehicle_model, manufacturing_year,
      work_type, date, process_status, money_paid, total_charges
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            client_id, vehicle_number, vehicle_model, manufacturing_year,
            work_type, date, process_status, money_paid, total_charges
        ],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            // Get the created vehicle with client details
            db.get(
                `SELECT v.*, c.name as client_name, c.phone as client_phone,
                (v.total_charges - v.money_paid) as pending_amount
         FROM vehicles v
         JOIN clients c ON v.client_id = c.id
         WHERE v.id = ?`,
                [this.lastID],
                (err, vehicle) => {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }
                    res.status(201).json(vehicle);
                }
            );
        }
    );
};

// Update vehicle
exports.updateVehicle = (req, res) => {
    const { id } = req.params;
    const {
        client_id,
        vehicle_number,
        vehicle_model,
        manufacturing_year,
        work_type,
        date,
        process_status,
        money_paid,
        total_charges
    } = req.body;

    if (!client_id || !vehicle_number || !date) {
        return res.status(400).json({
            error: 'Client ID, vehicle number, and date are required'
        });
    }

    // Validate vehicle number (exactly 10 alphanumeric characters, uppercase)
    if (!/^[A-Z0-9]{10}$/.test(vehicle_number)) {
        return res.status(400).json({
            error: 'Vehicle number must be exactly 10 alphanumeric characters (uppercase, no spaces)'
        });
    }

    db.run(
        `UPDATE vehicles SET
      client_id = ?, vehicle_number = ?, vehicle_model = ?,
      manufacturing_year = ?, work_type = ?, date = ?,
      process_status = ?, money_paid = ?, total_charges = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`,
        [
            client_id, vehicle_number, vehicle_model, manufacturing_year,
            work_type, date, process_status, money_paid, total_charges, id
        ],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Vehicle not found' });
            }

            // Get updated vehicle with client details
            db.get(
                `SELECT v.*, c.name as client_name, c.phone as client_phone,
                (v.total_charges - v.money_paid) as pending_amount
         FROM vehicles v
         JOIN clients c ON v.client_id = c.id
         WHERE v.id = ?`,
                [id],
                (err, vehicle) => {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }
                    res.json(vehicle);
                }
            );
        }
    );
};

// Delete vehicle
exports.deleteVehicle = (req, res) => {
    const { id } = req.params;

    // Delete associated documents first
    db.run('DELETE FROM documents WHERE vehicle_id = ?', [id], (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        db.run('DELETE FROM vehicles WHERE id = ?', [id], function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Vehicle not found' });
            }
            res.json({ message: 'Vehicle deleted successfully' });
        });
    });
};

// Get payment summary
exports.getPaymentSummary = (req, res) => {
    const query = `
    SELECT 
      COUNT(*) as total_vehicles,
      SUM(total_charges) as total_charges,
      SUM(money_paid) as total_paid,
      SUM(total_charges - money_paid) as total_pending,
      SUM(CASE WHEN money_paid = 0 THEN 1 ELSE 0 END) as unpaid_count,
      SUM(CASE WHEN money_paid > 0 AND money_paid < total_charges THEN 1 ELSE 0 END) as partial_paid_count,
      SUM(CASE WHEN money_paid >= total_charges THEN 1 ELSE 0 END) as fully_paid_count
    FROM vehicles
  `;

    db.get(query, [], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(row);
    });
};
