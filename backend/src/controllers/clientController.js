const db = require('../utils/database');

// Get all clients
exports.getAllClients = (req, res) => {
    db.all('SELECT * FROM clients ORDER BY name', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
};

// Get client by ID
exports.getClientById = (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM clients WHERE id = ?', [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Client not found' });
        }
        res.json(row);
    });
};

// Create new client
exports.createClient = (req, res) => {
    const { name, phone } = req.body;

    if (!name || !phone) {
        return res.status(400).json({ error: 'Name and phone are required' });
    }

    // Validate phone number (exactly 10 digits)
    if (!/^\d{10}$/.test(phone)) {
        return res.status(400).json({ error: 'Phone number must be exactly 10 digits' });
    }

    // Check if client already exists
    db.get('SELECT * FROM clients WHERE name = ? AND phone = ?', [name, phone], (err, existingClient) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (existingClient) {
            return res.json(existingClient); // Return existing client
        }

        // Create new client
        db.run(
            'INSERT INTO clients (name, phone) VALUES (?, ?)',
            [name, phone],
            function (err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.status(201).json({
                    id: this.lastID,
                    name,
                    phone
                });
            }
        );
    });
};

// Update client
exports.updateClient = (req, res) => {
    const { id } = req.params;
    const { name, phone } = req.body;

    if (!name || !phone) {
        return res.status(400).json({ error: 'Name and phone are required' });
    }

    // Validate phone number (exactly 10 digits)
    if (!/^\d{10}$/.test(phone)) {
        return res.status(400).json({ error: 'Phone number must be exactly 10 digits' });
    }

    db.run(
        'UPDATE clients SET name = ?, phone = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [name, phone, id],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Client not found' });
            }
            res.json({ id, name, phone });
        }
    );
};

// Delete client
exports.deleteClient = (req, res) => {
    const { id } = req.params;

    // Check if client has vehicles
    db.get('SELECT COUNT(*) as count FROM vehicles WHERE client_id = ?', [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (result.count > 0) {
            return res.status(400).json({
                error: 'Cannot delete client with associated vehicles. Delete vehicles first.'
            });
        }

        db.run('DELETE FROM clients WHERE id = ?', [id], function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Client not found' });
            }
            res.json({ message: 'Client deleted successfully' });
        });
    });
};
