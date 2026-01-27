const pool = require('../utils/database');

exports.getNotifications = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM notifications ORDER BY created_at DESC LIMIT 20'
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query(
            'UPDATE notifications SET is_read = TRUE WHERE id = $1',
            [id]
        );
        res.json({ message: 'Marked as read' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.markAllAsRead = async (req, res) => {
    try {
        await pool.query(
            'UPDATE notifications SET is_read = TRUE WHERE is_read = FALSE'
        );
        res.json({ message: 'All marked as read' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createNotification = async (type, message, vehicleId) => {
    try {
        await pool.query(
            'INSERT INTO notifications (type, message, vehicle_id) VALUES ($1, $2, $3)',
            [type, message, vehicleId]
        );
    } catch (err) {
        console.error('Error creating notification:', err);
    }
};
