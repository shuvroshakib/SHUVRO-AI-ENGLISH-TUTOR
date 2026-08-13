const express = require('express');
const db = require('../database/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get learner memory
router.get('/memory', authenticateToken, (req, res) => {
    try {
        const memory = db.prepare('SELECT * FROM learner_memory WHERE user_id = ?').get(req.user.id);
        res.json({ memory: memory || null });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch memory' });
    }
});

// Update learner memory
router.put('/memory', authenticateToken, (req, res) => {
    try {
        const userId = req.user.id;
        const {
            strengths, weaknesses, recurring_mistakes, vocabulary,
            pronunciation_notes, topics, completed_lessons, unfinished_lessons,
            goals, preferences, recent_performance, long_term_performance
        } = req.body;

        db.prepare(`
            UPDATE learner_memory SET
                strengths = COALESCE(?, strengths),
                weaknesses = COALESCE(?, weaknesses),
                recurring_mistakes = COALESCE(?, recurring_mistakes),
                vocabulary = COALESCE(?, vocabulary),
                pronunciation_notes = COALESCE(?, pronunciation_notes),
                topics = COALESCE(?, topics),
                completed_lessons = COALESCE(?, completed_lessons),
                unfinished_lessons = COALESCE(?, unfinished_lessons),
                goals = COALESCE(?, goals),
                preferences = COALESCE(?, preferences),
                recent_performance = COALESCE(?, recent_performance),
                long_term_performance = COALESCE(?, long_term_performance),
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ?
        `).run(
            strengths, weaknesses, recurring_mistakes, vocabulary,
            pronunciation_notes, topics, completed_lessons, unfinished_lessons,
            goals, preferences, recent_performance, long_term_performance,
            userId
        );

        res.json({ message: 'Memory updated' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update memory' });
    }
});

// Get vocabulary
router.get('/vocabulary', authenticateToken, (req, res) => {
    try {
        const vocab = db.prepare('SELECT * FROM vocabulary WHERE user_id = ? ORDER BY date_introduced DESC').all(req.user.id);
        res.json({ vocabulary: vocab });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch vocabulary' });
    }
});

// Add vocabulary
router.post('/vocabulary', authenticateToken, (req, res) => {
    try {
        const userId = req.user.id;
        const { word, meaning, example, pronunciation, difficulty, context } = req.body;

        const result = db.prepare(`
            INSERT INTO vocabulary (user_id, word, meaning, example, pronunciation, difficulty, context)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(userId, word, meaning, example, pronunciation, difficulty || 'medium', context);

        res.status(201).json({ id: result.lastInsertRowid, message: 'Vocabulary added' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to add vocabulary' });
    }
});

// Update vocabulary mastery
router.put('/vocabulary/:id', authenticateToken, (req, res) => {
    try {
        const { mastery, review_status } = req.body;
        db.prepare(`
            UPDATE vocabulary SET mastery = COALESCE(?, mastery), review_status = COALESCE(?, review_status)
            WHERE id = ? AND user_id = ?
        `).run(mastery, review_status, req.params.id, req.user.id);
        res.json({ message: 'Vocabulary updated' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update vocabulary' });
    }
});

// Get mistakes
router.get('/mistakes', authenticateToken, (req, res) => {
    try {
        const mistakes = db.prepare('SELECT * FROM mistakes WHERE user_id = ? ORDER BY frequency DESC, last_seen DESC').all(req.user.id);
        res.json({ mistakes });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch mistakes' });
    }
});

// Add mistake
router.post('/mistakes', authenticateToken, (req, res) => {
    try {
        const userId = req.user.id;
        const { original_sentence, corrected_sentence, explanation, category, severity } = req.body;

        // Check if similar mistake exists
        const existing = db.prepare(
            'SELECT id, frequency FROM mistakes WHERE user_id = ? AND original_sentence = ?'
        ).get(userId, original_sentence);

        if (existing) {
            db.prepare(`
                UPDATE mistakes SET
                    frequency = frequency + 1,
                    last_seen = CURRENT_TIMESTAMP,
                    corrected_sentence = COALESCE(?, corrected_sentence),
                    explanation = COALESCE(?, explanation),
                    category = COALESCE(?, category),
                    severity = COALESCE(?, severity)
                WHERE id = ?
            `).run(corrected_sentence, explanation, category, severity, existing.id);

            res.json({ id: existing.id, message: 'Mistake updated', frequency: existing.frequency + 1 });
        } else {
            const result = db.prepare(`
                INSERT INTO mistakes (user_id, original_sentence, corrected_sentence, explanation, category, severity)
                VALUES (?, ?, ?, ?, ?, ?)
            `).run(userId, original_sentence, corrected_sentence, explanation, category, severity || 'medium');

            res.status(201).json({ id: result.lastInsertRowid, message: 'Mistake added' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed to add mistake' });
    }
});

// Get goals
router.get('/goals', authenticateToken, (req, res) => {
    try {
        const goals = db.prepare('SELECT * FROM goals WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
        res.json({ goals });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch goals' });
    }
});

// Add goal
router.post('/goals', authenticateToken, (req, res) => {
    try {
        const userId = req.user.id;
        const { title, description, current_status, target_status, blocking_factor, next_action } = req.body;

        const result = db.prepare(`
            INSERT INTO goals (user_id, title, description, current_status, target_status, blocking_factor, next_action)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(userId, title, description, current_status, target_status, blocking_factor, next_action);

        res.status(201).json({ id: result.lastInsertRowid, message: 'Goal added' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to add goal' });
    }
});

// Update goal progress
router.put('/goals/:id', authenticateToken, (req, res) => {
    try {
        const { progress, current_status, next_action } = req.body;
        db.prepare(`
            UPDATE goals SET
                progress = COALESCE(?, progress),
                current_status = COALESCE(?, current_status),
                next_action = COALESCE(?, next_action),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND user_id = ?
        `).run(progress, current_status, next_action, req.params.id, req.user.id);
        res.json({ message: 'Goal updated' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update goal' });
    }
});

// Get progress
router.get('/progress', authenticateToken, (req, res) => {
    try {
        const progress = db.prepare('SELECT * FROM progress WHERE user_id = ?').get(req.user.id);
        const levelHistory = db.prepare('SELECT * FROM level_history WHERE user_id = ? ORDER BY assessed_at DESC').all(req.user.id);
        res.json({ progress: progress || null, levelHistory: levelHistory || [] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch progress' });
    }
});

// Update progress
router.put('/progress', authenticateToken, (req, res) => {
    try {
        const userId = req.user.id;
        const {
            total_speaking_time, practice_streak, last_practice_date,
            accuracy, conversation_length_avg, fluency, grammar,
            vocabulary, pronunciation, confidence
        } = req.body;

        db.prepare(`
            UPDATE progress SET
                total_speaking_time = COALESCE(?, total_speaking_time),
                practice_streak = COALESCE(?, practice_streak),
                last_practice_date = COALESCE(?, last_practice_date),
                accuracy = COALESCE(?, accuracy),
                conversation_length_avg = COALESCE(?, conversation_length_avg),
                fluency = COALESCE(?, fluency),
                grammar = COALESCE(?, grammar),
                vocabulary = COALESCE(?, vocabulary),
                pronunciation = COALESCE(?, pronunciation),
                confidence = COALESCE(?, confidence),
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ?
        `).run(
            total_speaking_time, practice_streak, last_practice_date,
            accuracy, conversation_length_avg, fluency, grammar,
            vocabulary, pronunciation, confidence, userId
        );

        res.json({ message: 'Progress updated' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update progress' });
    }
});

// Add level history
router.post('/level-history', authenticateToken, (req, res) => {
    try {
        const userId = req.user.id;
        const { level, confidence, evidence_count, grammar_score, vocabulary_score, fluency_score, pronunciation_score, comprehension_score, confidence_score } = req.body;

        const result = db.prepare(`
            INSERT INTO level_history (user_id, level, confidence, evidence_count, grammar_score, vocabulary_score, fluency_score, pronunciation_score, comprehension_score, confidence_score)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(userId, level, confidence, evidence_count, grammar_score, vocabulary_score, fluency_score, pronunciation_score, comprehension_score, confidence_score);

        // Update current level in profile
        db.prepare('UPDATE profiles SET current_level = ? WHERE user_id = ?').run(level, userId);

        res.status(201).json({ id: result.lastInsertRowid, message: 'Level history added' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to add level history' });
    }
});

module.exports = router;
