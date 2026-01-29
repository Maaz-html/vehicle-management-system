const pool = require('../utils/database');

// Get all clients
exports.getAllClients = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM clients ORDER BY name'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get client by ID
exports.getClientById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM clients WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create new client
exports.createClient = async (req, res) => {
  try {
    const { name, phone } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone are required' });
    }

    // Validate phone number (exactly 10 digits)
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({
        error: 'Phone number must be exactly 10 digits'
      });
    }

    // Check if client already exists
    const existing = await pool.query(
      'SELECT * FROM clients WHERE name = $1 AND phone = $2',
      [name, phone]
    );

    if (existing.rows.length > 0) {
      return res.json(existing.rows[0]);
    }

    // Create new client
    const { comments = '' } = req.body;
    const result = await pool.query(
      'INSERT INTO clients (name, phone, comments) VALUES ($1, $2, $3) RETURNING *',
      [name, phone, comments]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update client
exports.updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone are required' });
    }

    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({
        error: 'Phone number must be exactly 10 digits'
      });
    }

    const result = await pool.query(
      `UPDATE clients
       SET name = $1, phone = $2, comments = $3, updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [name, phone, req.body.comments || '', id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete client
exports.deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    const vehicleCheck = await pool.query(
      'SELECT COUNT(*) FROM vehicles WHERE client_id = $1',
      [id]
    );

    if (parseInt(vehicleCheck.rows[0].count) > 0) {
      return res.status(400).json({
        error: 'Cannot delete client with associated vehicles. Delete vehicles first.'
      });
    }

    const result = await pool.query(
      'DELETE FROM clients WHERE id = $1',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json({ message: 'Client deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
