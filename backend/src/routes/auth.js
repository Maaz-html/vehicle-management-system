const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Simple single user check
        const adminUsername = process.env.ADMIN_USERNAME || 'admin';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

        if (username === adminUsername && password === adminPassword) {
            const token = jwt.sign(
                { username: adminUsername, role: 'admin' },
                process.env.JWT_SECRET || 'your_jwt_secret',
                { expiresIn: '24h' }
            );
            res.send({ user: { username: adminUsername, role: 'admin' }, token });
        } else {
            res.status(400).send({ error: 'Invalid login credentials' });
        }
    } catch (e) {
        res.status(500).send();
    }
});

module.exports = router;
