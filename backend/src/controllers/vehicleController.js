const pool = require('../utils/database');

// Get all vehicles with filters
exports.getAllVehicles = async (req, res) => {
  try {
    const { search, status, sortBy = 'date', sortOrder = 'DESC' } = req.query;

    let query = `
      SELECT v.*, 
             c.name AS client_name, 
             c.phone AS client_phone,
             (v.total_charges - v.money_paid) AS pending_amount
      FROM vehicles v
      JOIN clients c ON v.client_id = c.id
      WHERE 1=1
    `;

    const params = [];
    let idx = 1;

    // Search filter
    if (search) {
      query += ` AND (c.name ILIKE $${idx} OR v.vehicle_number ILIKE $${idx + 1})`;
      params.push(`%${search}%`, `%${search}%`);
      idx += 2;
    }

    // Status filter
    if (status) {
      query += ` AND v.process_status = $${idx}`;
      params.push(status);
      idx++;
    }

    // Sorting
    const allowedSortFields = ['date', 'money_paid', 'total_charges', 'id'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'date';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    query += ` ORDER BY v.${sortField} ${order}`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get vehicle by ID
exports.getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT v.*, 
             c.name AS client_name, 
             c.phone AS client_phone,
             (v.total_charges - v.money_paid) AS pending_amount
      FROM vehicles v
      JOIN clients c ON v.client_id = c.id
      WHERE v.id = $1
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create new vehicle
exports.createVehicle = async (req, res) => {
  try {
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

    if (!/^[A-Z0-9]{10}$/.test(vehicle_number)) {
      return res.status(400).json({
        error: 'Vehicle number must be exactly 10 alphanumeric characters (uppercase, no spaces)'
      });
    }

    const insertQuery = `
      INSERT INTO vehicles (
        client_id, vehicle_number, vehicle_model, manufacturing_year,
        work_type, date, process_status, money_paid, total_charges
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING id
    `;

    const insertResult = await pool.query(insertQuery, [
      client_id,
      vehicle_number,
      vehicle_model,
      manufacturing_year,
      work_type,
      date,
      process_status,
      money_paid,
      total_charges
    ]);

    const vehicleId = insertResult.rows[0].id;

    const fetchQuery = `
      SELECT v.*, 
             c.name AS client_name, 
             c.phone AS client_phone,
             (v.total_charges - v.money_paid) AS pending_amount
      FROM vehicles v
      JOIN clients c ON v.client_id = c.id
      WHERE v.id = $1
    `;

    const vehicle = await pool.query(fetchQuery, [vehicleId]);
    res.status(201).json(vehicle.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update vehicle
exports.updateVehicle = async (req, res) => {
  try {
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

    if (!/^[A-Z0-9]{10}$/.test(vehicle_number)) {
      return res.status(400).json({
        error: 'Vehicle number must be exactly 10 alphanumeric characters (uppercase, no spaces)'
      });
    }

    const updateQuery = `
      UPDATE vehicles SET
        client_id=$1,
        vehicle_number=$2,
        vehicle_model=$3,
        manufacturing_year=$4,
        work_type=$5,
        date=$6,
        process_status=$7,
        money_paid=$8,
        total_charges=$9,
        updated_at=NOW()
      WHERE id=$10
      RETURNING id
    `;

    const result = await pool.query(updateQuery, [
      client_id,
      vehicle_number,
      vehicle_model,
      manufacturing_year,
      work_type,
      date,
      process_status,
      money_paid,
      total_charges,
      id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const vehicle = await pool.query(
      `
      SELECT v.*, 
             c.name AS client_name, 
             c.phone AS client_phone,
             (v.total_charges - v.money_paid) AS pending_amount
      FROM vehicles v
      JOIN clients c ON v.client_id = c.id
      WHERE v.id = $1
      `,
      [id]
    );

    res.json(vehicle.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete vehicle
exports.deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query('DELETE FROM documents WHERE vehicle_id = $1', [id]);
    const result = await pool.query('DELETE FROM vehicles WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    res.json({ message: 'Vehicle deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get payment summary
exports.getPaymentSummary = async (req, res) => {
  try {
    const query = `
      SELECT 
        COUNT(*) AS total_vehicles,
        SUM(total_charges) AS total_charges,
        SUM(money_paid) AS total_paid,
        SUM(total_charges - money_paid) AS total_pending,
        SUM(CASE WHEN money_paid = 0 THEN 1 ELSE 0 END) AS unpaid_count,
        SUM(CASE WHEN money_paid > 0 AND money_paid < total_charges THEN 1 ELSE 0 END) AS partial_paid_count,
        SUM(CASE WHEN money_paid >= total_charges THEN 1 ELSE 0 END) AS fully_paid_count
      FROM vehicles
    `;

    const result = await pool.query(query);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
