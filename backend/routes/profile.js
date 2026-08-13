const express = require('express');
const db = require('../database/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get full profile
router.get('/', authenticateToken, (req, res) => {
    try {
        const userId = req.user.id;

        const profile = db.prepare(`
            SELECT p.*, u.learner_id, u.email, u.name as user_name, u.created_at
            FROM profiles p
            JOIN users u ON p.user_id = u.id
            WHERE p.user_id = ?
        `).get(userId);

        const progress = db.prepare('SELECT * FROM progress WHERE user_id = ?').get(userId);
        const settings = db.prepare('SELECT * FROM settings WHERE user_id = ?').get(userId);
        const memory = db.prepare('SELECT * FROM learner_memory WHERE user_id = ?').get(userId);
        const levelHistory = db.prepare('SELECT * FROM level_history WHERE user_id = ? ORDER BY assessed_at DESC LIMIT 1').get(userId);

        res.json({
            profile: profile || null,
            progress: progress || null,
            settings: settings || null,
            memory: memory || null,
            levelHistory: levelHistory || null
        });
    } catch (err) {
        console.error('Profile fetch error:', err);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// Update profile
router.put('/', authenticateToken, (req, res) => {
    try {
        const userId = req.user.id;
        const {
            name, learning_goal, explanation_language, daily_duration,
            weekly_frequency, current_level, target_level, bangla_assistance,
            female_voice, voice_speed, personality, correction_intensity, profile_image
        } = req.body;

        db.prepare(`
            UPDATE profiles SET
                name = COALESCE(?, name),
                learning_goal = COALESCE(?, learning_goal),
                explanation_language = COALESCE(?, explanation_language),
                daily_duration = COALESCE(?, daily_duration),
                weekly_frequency = COALESCE(?, weekly_frequency),
                current_level = COALESCE(?, current_level),
                target_level = COALESCE(?, target_level),
                bangla_assistance = COALESCE(?, bangla_assistance),
                female_voice = COALESCE(?, female_voice),
                voice_speed = COALESCE(?, voice_speed),
                personality = COALESCE(?, personality),
                correction_intensity = COALESCE(?, correction_intensity),
                profile_image = COALESCE(?, profile_image),
                onboarding_completed = 1,
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ?
        `).run(
            name, learning_goal, explanation_language, daily_duration,
            weekly_frequency, current_level, target_level, bangla_assistance,
            female_voice, voice_speed, personality, correction_intensity, profile_image,
            userId
        );

        res.json({ message: 'Profile updated' });
    } catch (err) {
        console.error('Profile update error:', err);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Update settings
router.put('/settings', authenticateToken, (req, res) => {
    try {
        const userId = req.user.id;
        const {
            subtitles_enabled, subtitle_font_size, focus_word_highlighting,
            english_captions, bangla_captions, auto_scroll, reduced_motion, large_text
        } = req.body;

        db.prepare(`
            UPDATE settings SET
                subtitles_enabled = COALESCE(?, subtitles_enabled),
                subtitle_font_size = COALESCE(?, subtitle_font_size),
                focus_word_highlighting = COALESCE(?, focus_word_highlighting),
                english_captions = COALESCE(?, english_captions),
                bangla_captions = COALESCE(?, bangla_captions),
                auto_scroll = COALESCE(?, auto_scroll),
                reduced_motion = COALESCE(?, reduced_motion),
                large_text = COALESCE(?, large_text),
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ?
        `).run(
            subtitles_enabled, subtitle_font_size, focus_word_highlighting,
            english_captions, bangla_captions, auto_scroll, reduced_motion, large_text,
            userId
        );

        res.json({ message: 'Settings updated' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

// Get schedule
router.get('/schedule', authenticateToken, (req, res) => {
    try {
        const schedule = db.prepare('SELECT * FROM schedules WHERE user_id = ?').get(req.user.id);
        res.json({ schedule: schedule || null });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch schedule' });
    }
});

// Update schedule
router.put('/schedule', authenticateToken, (req, res) => {
    try {
        const userId = req.user.id;
        const { monday, tuesday, wednesday, thursday, friday, saturday, sunday } = req.body;

        db.prepare(`
            UPDATE schedules SET
                monday = COALESCE(?, monday),
                tuesday = COALESCE(?, tuesday),
                wednesday = COALESCE(?, wednesday),
                thursday = COALESCE(?, thursday),
                friday = COALESCE(?, friday),
                saturday = COALESCE(?, saturday),
                sunday = COALESCE(?, sunday),
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ?
        `).run(monday, tuesday, wednesday, thursday, friday, saturday, sunday, userId);

        res.json({ message: 'Schedule updated' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update schedule' });
    }
});

module.exports = router;
