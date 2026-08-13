const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../database/db');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

function generateLearnerId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = 'SHUVRO-';
    for (let i = 0; i < 4; i++) id += chars[Math.floor(Math.random() * chars.length)];
    id += '-';
    for (let i = 0; i < 4; i++) id += chars[Math.floor(Math.random() * chars.length)];
    return id;
}

// Register
router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
        if (existing) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        const passwordHash = await bcrypt.hash(password, 12);
        const learnerId = generateLearnerId();

        const result = db.prepare(
            'INSERT INTO users (learner_id, email, password_hash, name) VALUES (?, ?, ?, ?)'
        ).run(learnerId, email, passwordHash, name || null);

        const userId = result.lastInsertRowid;

        // Create default profile
        db.prepare('INSERT INTO profiles (user_id, name) VALUES (?, ?)').run(userId, name || null);

        // Create default progress
        db.prepare('INSERT INTO progress (user_id) VALUES (?)').run(userId);

        // Create default settings
        db.prepare('INSERT INTO settings (user_id) VALUES (?)').run(userId);

        // Create default learner memory
        db.prepare('INSERT INTO learner_memory (user_id) VALUES (?)').run(userId);

        // Create default schedule
        db.prepare('INSERT INTO schedules (user_id) VALUES (?)').run(userId);

        const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            token,
            user: {
                id: userId,
                learner_id: learnerId,
                email,
                name: name || null
            }
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            token,
            user: {
                id: user.id,
                learner_id: user.learner_id,
                email: user.email,
                name: user.name
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Get current user
router.get('/me', require('../middleware/auth').authenticateToken, (req, res) => {
    res.json({ user: req.user });
});

// Change password
router.post('/change-password', require('../middleware/auth').authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        if (!currentPassword || !newPassword || newPassword.length < 6) {
            return res.status(400).json({ error: 'Valid current and new password required' });
        }

        const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(userId);
        const valid = await bcrypt.compare(currentPassword, user.password_hash);

        if (!valid) {
            return res.status(401).json({ error: 'Current password incorrect' });
        }

        const newHash = await bcrypt.hash(newPassword, 12);
        db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, userId);

        res.json({ message: 'Password updated' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to change password' });
    }
});

// Delete account
router.delete('/account', require('../middleware/auth').authenticateToken, (req, res) => {
    try {
        db.prepare('DELETE FROM users WHERE id = ?').run(req.user.id);
        res.json({ message: 'Account deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete account' });
    }
});

module.exports = router;
