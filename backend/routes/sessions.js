const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../database/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all sessions
router.get('/', authenticateToken, (req, res) => {
    try {
        const sessions = db.prepare(`
            SELECT session_id, date, duration, mode, topic, summary, scores, ended_at
            FROM sessions WHERE user_id = ? ORDER BY date DESC
        `).all(req.user.id);
        res.json({ sessions });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch sessions' });
    }
});

// Get single session
router.get('/:sessionId', authenticateToken, (req, res) => {
    try {
        const session = db.prepare('SELECT * FROM sessions WHERE session_id = ? AND user_id = ?').get(req.params.sessionId, req.user.id);
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }
        res.json({ session });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch session' });
    }
});

// Create session
router.post('/', authenticateToken, (req, res) => {
    try {
        const userId = req.user.id;
        const sessionId = uuidv4();
        const { mode, topic } = req.body;

        const result = db.prepare(`
            INSERT INTO sessions (session_id, user_id, mode, topic, messages, transcript, corrections, vocabulary_introduced, mistakes, scores, summary, recommendations)
            VALUES (?, ?, ?, ?, '[]', '', '[]', '[]', '[]', '{}', '', '')
        `).run(sessionId, userId, mode || 'free_conversation', topic || null);

        res.status(201).json({ sessionId, id: result.lastInsertRowid });
    } catch (err) {
        res.status(500).json({ error: 'Failed to create session' });
    }
});

// Update session
router.put('/:sessionId', authenticateToken, (req, res) => {
    try {
        const userId = req.user.id;
        const {
            duration, messages, transcript, corrections, vocabulary_introduced,
            mistakes, scores, summary, recommendations, ended_at
        } = req.body;

        db.prepare(`
            UPDATE sessions SET
                duration = COALESCE(?, duration),
                messages = COALESCE(?, messages),
                transcript = COALESCE(?, transcript),
                corrections = COALESCE(?, corrections),
                vocabulary_introduced = COALESCE(?, vocabulary_introduced),
                mistakes = COALESCE(?, mistakes),
                scores = COALESCE(?, scores),
                summary = COALESCE(?, summary),
                recommendations = COALESCE(?, recommendations),
                ended_at = COALESCE(?, ended_at)
            WHERE session_id = ? AND user_id = ?
        `).run(
            duration, JSON.stringify(messages), transcript, JSON.stringify(corrections),
            JSON.stringify(vocabulary_introduced), JSON.stringify(mistakes), JSON.stringify(scores),
            summary, recommendations, ended_at, req.params.sessionId, userId
        );

        res.json({ message: 'Session updated' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update session' });
    }
});

// Delete session
router.delete('/:sessionId', authenticateToken, (req, res) => {
    try {
        db.prepare('DELETE FROM sessions WHERE session_id = ? AND user_id = ?').run(req.params.sessionId, req.user.id);
        res.json({ message: 'Session deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete session' });
    }
});

module.exports = router;
