const pool = require('../utils/database');
const { createNotification } = require('../controllers/notificationController');

// Get all vehicles with filters
exports.getAllVehicles = async (req, res) => {
  try {
    const { search, status, client_id, startDate, endDate, sortBy = 'date', sortOrder = 'DESC' } = req.query;

    let query = `
      SELECT v.*, 
             c.name AS client_name, 
             c.phone AS client_phone,
             (v.total_charges - v.money_paid) AS pending_amount,
             (SELECT COUNT(*) FROM documents WHERE vehicle_id = v.id) AS doc_count
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

    // Client filter
    if (client_id) {
      query += ` AND v.client_id = $${idx}`;
      params.push(client_id);
      idx++;
    }

    // Date range filter
    if (startDate) {
      query += ` AND v.date >= $${idx}`;
      params.push(startDate);
      idx++;
    }
    if (endDate) {
      query += ` AND v.date <= $${idx}`;
      params.push(endDate);
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
      total_charges = 0,
      notes = ''
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
        work_type, date, process_status, money_paid, total_charges, notes
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING id
    `;

    const insertResult = await pool.query(insertQuery, [
      client_id,
      vehicle_number,
      vehicle_model,
      manufacturing_year,
      JSON.stringify(Array.isArray(work_type) ? work_type : [work_type]),
      date,
      process_status,
      money_paid,
      total_charges,
      notes
    ]);

    const vehicleId = insertResult.rows[0].id;

    await createNotification(
      'VEHICLE_CREATED',
      `New vehicle ${vehicle_number} registered.`,
      vehicleId
    );

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
      total_charges,
      notes
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
        notes=$10,
        updated_at=NOW()
      WHERE id=$11
      RETURNING id
    `;

    const result = await pool.query(updateQuery, [
      client_id,
      vehicle_number,
      vehicle_model,
      manufacturing_year,
      JSON.stringify(Array.isArray(work_type) ? work_type : [work_type]),
      date,
      process_status,
      money_paid,
      total_charges,
      notes,
      id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    // Check for status change or creation to trigger notification
    // Ideally we would compare with old status, but for now let's just notify on update
    // To be more precise, we can fetch the old vehicle before update, but let's keep it simple
    await createNotification(
      'VEHICLE_UPDATE',
      `Vehicle ${vehicle_number} details updated. Status: ${process_status}`,
      id
    );

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
