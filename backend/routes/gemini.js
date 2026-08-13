const express = require('express');
const db = require('../database/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

// Helper to call Gemini
async function callGemini(prompt, systemInstruction = '') {
    if (!GEMINI_API_KEY) {
        throw new Error('Gemini API key not configured');
    }

    const url = `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`;

    const body = {
        contents: [{
            parts: [{ text: prompt }]
        }],
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
        }
    };

    if (systemInstruction) {
        body.systemInstruction = {
            parts: [{ text: systemInstruction }]
        };
    }

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Gemini API error: ${error}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// Generate AI response
router.post('/chat', authenticateToken, async (req, res) => {
    try {
        const { message, mode, context, learnerMemory, history } = req.body;
        const userId = req.user.id;

        // Get user profile for personalization
        const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(userId);

        const modeInstructions = {
            free_conversation: 'Have a natural, friendly conversation. Help the learner practice everyday English.',
            daily_conversation: 'Practice daily life scenarios like greetings, shopping, weather, etc.',
            grammar: 'Focus on grammar rules and corrections. Explain clearly with examples.',
            vocabulary: 'Introduce new words, explain meanings, and ask the learner to use them in sentences.',
            pronunciation: 'Focus on pronunciation. Ask the learner to repeat words and give feedback.',
            job_interview: 'Conduct a realistic job interview. Ask common interview questions.',
            ielts_speaking: 'Practice IELTS speaking test format with Parts 1, 2, and 3.',
            travel_english: 'Practice travel scenarios like airport, hotel, restaurant, directions.',
            workplace_english: 'Practice professional workplace communication.',
            academic_english: 'Practice academic discussions, presentations, and formal language.',
            roleplay: 'Engage in a creative roleplay scenario chosen by the learner.',
            quick_practice: 'Quick 5-minute focused practice on a specific skill.',
            weakness_mode: 'Focus specifically on the learner\'s known weaknesses.',
            review_mode: 'Review previously learned vocabulary and concepts.',
            challenge_mode: 'Provide challenging questions to push the learner.',
            listening_practice: 'Describe scenarios and ask comprehension questions.',
            storytelling: 'Help the learner practice telling stories with proper structure.',
            debate: 'Engage in a friendly debate on an interesting topic.',
            presentation: 'Practice giving presentations and speeches.',
            custom_topic: 'Discuss the learner\'s chosen custom topic.'
        };

        const systemInstruction = `You are SHUVRO AI, a premium personalized female English tutor. You are patient, encouraging, and adaptive.

Learner Profile:
- Name: ${profile?.name || 'Learner'}
- Current Level: ${profile?.current_level || 'A1'}
- Target Level: ${profile?.target_level || 'B2'}
- Explanation Language: ${profile?.explanation_language || 'english'}
- Bangla Assistance: ${profile?.bangla_assistance ? 'Yes' : 'No'}
- Correction Intensity: ${profile?.correction_intensity || 'normal'}
- Personality: ${profile?.personality || 'friendly'}

Current Mode: ${mode || 'free_conversation'}
Mode Instructions: ${modeInstructions[mode] || modeInstructions.free_conversation}

Learner Memory Context:
${learnerMemory || 'No previous memory available.'}

Conversation History:
${history || 'This is a new session.'}

IMPORTANT RULES:
1. Always respond as a friendly female tutor named SHUVRO.
2. Adapt your language complexity to the learner's level (${profile?.current_level || 'A1'}).
3. If Bangla assistance is enabled and the learner seems confused, provide Bangla explanations.
4. For corrections, provide: original mistake, better version, why, and Bangla explanation if applicable.
5. Keep responses conversational but educational.
6. Do not use markdown formatting. Use plain text with clear structure.
7. If this is the first message, greet warmly and ask an engaging opening question.
8. Track what the learner needs to practice next based on their responses.`;

        const prompt = `Learner says: ${message}

Respond naturally as SHUVRO AI:`;

        const aiResponse = await callGemini(prompt, systemInstruction);

        res.json({ response: aiResponse });
    } catch (err) {
        console.error('Gemini chat error:', err);
        res.status(500).json({ error: 'AI response failed', details: err.message });
    }
});

// Generate placement assessment
router.post('/placement', authenticateToken, async (req, res) => {
    try {
        const { conversationHistory } = req.body;
        const userId = req.user.id;
        const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(userId);

        const systemInstruction = `You are SHUVRO AI, an expert English language assessor. Analyze the learner's English based on their conversation and provide a detailed assessment in JSON format.

The learner's preferred explanation language is: ${profile?.explanation_language || 'english'}
Bangla assistance: ${profile?.bangla_assistance ? 'Yes' : 'No'}

Respond ONLY with valid JSON in this exact format:
{
  "current_level": "A1/A2/B1/B2/C1/C2",
  "confidence": 0-100,
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "grammar_score": 0-100,
  "vocabulary_score": 0-100,
  "fluency_score": 0-100,
  "pronunciation_score": 0-100,
  "comprehension_score": 0-100,
  "confidence_score": 0-100,
  "top_priorities": ["priority1", "priority2", "priority3"],
  "recommended_first_lessons": ["lesson1", "lesson2", "lesson3"],
  "summary": "brief assessment summary",
  "bangla_summary": "Bangla summary if applicable"
}`;

        const prompt = `Based on this conversation history, assess the learner's English level:

${conversationHistory}

Provide the assessment in the required JSON format.`;

        const aiResponse = await callGemini(prompt, systemInstruction);

        // Try to parse JSON
        let assessment;
        try {
            // Extract JSON from response
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                assessment = JSON.parse(jsonMatch[0]);
            } else {
                assessment = JSON.parse(aiResponse);
            }
        } catch (parseErr) {
            console.error('JSON parse error:', parseErr);
            // Return raw response if parsing fails
            assessment = { raw_response: aiResponse, parse_error: true };
        }

        res.json({ assessment });
    } catch (err) {
        console.error('Placement error:', err);
        res.status(500).json({ error: 'Assessment failed', details: err.message });
    }
});

// Generate session summary
router.post('/summary', authenticateToken, async (req, res) => {
    try {
        const { transcript, mode, duration } = req.body;
        const userId = req.user.id;
        const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(userId);

        const systemInstruction = `You are SHUVRO AI. Generate a session summary based on the conversation transcript.

Learner Level: ${profile?.current_level || 'A1'}
Bangla Assistance: ${profile?.bangla_assistance ? 'Yes' : 'No'}

Respond ONLY with valid JSON:
{
  "performance": "overall performance description",
  "fluency": 0-100,
  "grammar": 0-100,
  "vocabulary": 0-100,
  "pronunciation": 0-100,
  "confidence": 0-100,
  "important_corrections": [{"original": "...", "corrected": "...", "explanation": "..."}],
  "new_vocabulary": ["word1", "word2"],
  "strengths": ["strength1"],
  "weaknesses": ["weakness1"],
  "next_recommendation": "what to practice next",
  "bangla_recommendation": "Bangla recommendation if applicable"
}`;

        const prompt = `Session Mode: ${mode}
Duration: ${duration} minutes

Transcript:
${transcript}

Generate session summary in JSON format.`;

        const aiResponse = await callGemini(prompt, systemInstruction);

        let summary;
        try {
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                summary = JSON.parse(jsonMatch[0]);
            } else {
                summary = JSON.parse(aiResponse);
            }
        } catch (parseErr) {
            summary = { raw_response: aiResponse, parse_error: true };
        }

        res.json({ summary });
    } catch (err) {
        res.status(500).json({ error: 'Summary generation failed', details: err.message });
    }
});

// Generate adaptive recommendation
router.post('/recommendation', authenticateToken, async (req, res) => {
    try {
        const { learnerMemory, recentSessions, currentLevel } = req.body;
        const userId = req.user.id;
        const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(userId);

        const systemInstruction = `You are SHUVRO AI. Based on the learner's memory and recent performance, generate a personalized practice recommendation.

Learner Level: ${profile?.current_level || 'A1'}
Target Level: ${profile?.target_level || 'B2'}
Bangla Assistance: ${profile?.bangla_assistance ? 'Yes' : 'No'}

Respond with a natural, encouraging recommendation (not JSON). Keep it under 150 words.`;

        const prompt = `Learner Memory:
${learnerMemory}

Recent Sessions:
${recentSessions}

Current Level: ${currentLevel}

What should this learner practice next? Provide a specific, actionable recommendation.`;

        const recommendation = await callGemini(prompt, systemInstruction);

        res.json({ recommendation });
    } catch (err) {
        res.status(500).json({ error: 'Recommendation failed', details: err.message });
    }
});

// Health check for Gemini
router.get('/health', (req, res) => {
    if (!GEMINI_API_KEY) {
        return res.status(503).json({ status: 'Gemini API key not configured' });
    }
    res.json({ status: 'Gemini API configured' });
});

module.exports = router;
