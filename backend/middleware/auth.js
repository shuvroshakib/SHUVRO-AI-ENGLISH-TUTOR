const jwt = require('jsonwebtoken');
const db = require('../database/db');

const JWT_SECRET = process.env.SESSION_SECRET || 'shuvro-default-secret-change-me';

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = db.prepare('SELECT id, learner_id, email, name FROM users WHERE id = ?').get(decoded.userId);

        if (!user) {
            return res.status(403).json({ error: 'Invalid token' });
        }

        req.user = user;
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Invalid token' });
    }
}

module.exports = { authenticateToken, JWT_SECRET };
