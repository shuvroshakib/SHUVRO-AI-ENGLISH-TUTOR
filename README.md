# SHUVRO AI English Tutor

A personalized AI spoken-English learning web application with voice interaction, adaptive learning, persistent memory, and animated avatar.

## Features

- **Realtime Voice Conversation** with AI tutor using Web Speech API
- **20 Learning Modes** (Free Conversation, IELTS, Job Interview, Grammar, Vocabulary, etc.)
- **Animated Female Avatar** with facial expressions and speech-synchronized animation
- **Live CC Subtitles** with focus word highlighting
- **Intelligent Corrections** with Bangla explanations
- **Persistent Learner Memory** across sessions
- **CEFR Level Tracking** (A1-C2)
- **Progress Dashboard** with interactive charts
- **Session History** and vocabulary tracking
- **Secure Authentication** with JWT tokens and bcrypt
- **Mobile-First Responsive Design**
- **SQLite Database** for persistent storage
- **Gemini API Integration** for AI responses

## Architecture

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Recharts, Lucide React
- **Backend**: Node.js, Express, Better-SQLite3, bcryptjs, jsonwebtoken
- **AI**: Google Gemini API (text generation)
- **Voice**: Web Speech API (SpeechRecognition + SpeechSynthesis)

## Prerequisites

- Node.js 18+ and npm
- Google Gemini API key (get from [Google AI Studio](https://aistudio.google.com/))

## Installation

### 1. Clone or extract the project

```bash
cd SHUVRO-AI-ENGLISH-TUTOR
```

### 2. Install all dependencies

```bash
npm run install:all
```

This installs dependencies for root, backend, and frontend.

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and add your Gemini API key:

```
GEMINI_API_KEY=your_actual_gemini_api_key_here
DATABASE_URL=./backend/database/shuvro.db
SESSION_SECRET=your_super_secret_random_string_here
PORT=3001
NODE_ENV=development
```

### 4. Run in development mode

```bash
npm run dev
```

This starts both backend (port 3001) and frontend (port 5173) concurrently.

### 5. Build for production

```bash
npm run build
npm start
```

The backend will serve the built frontend static files.

## Project Structure

```
SHUVRO-AI-ENGLISH-TUTOR/
├── backend/
│   ├── database/
│   │   ├── schema.sql          # Database schema
│   │   └── db.js               # SQLite connection
│   ├── middleware/
│   │   └── auth.js             # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js             # Login, register, password
│   │   ├── profile.js          # Profile, settings, schedule
│   │   ├── learning.js         # Memory, vocabulary, mistakes, goals, progress
│   │   ├── sessions.js         # Conversation sessions
│   │   └── gemini.js           # AI chat, placement, summary, recommendations
│   ├── server.js               # Express server entry
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx      # Responsive navigation
│   │   │   ├── Avatar.tsx      # Animated female tutor avatar
│   │   │   ├── Subtitles.tsx   # Live CC subtitles
│   │   │   └── CorrectionPanel.tsx # Correction display
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Onboarding.tsx  # Multi-step onboarding flow
│   │   │   ├── Home.tsx        # Dashboard
│   │   │   ├── Practice.tsx    # Voice practice (main feature)
│   │   │   ├── Progress.tsx    # Charts and stats
│   │   │   ├── History.tsx     # Session history
│   │   │   ├── Profile.tsx
│   │   │   └── Settings.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts      # Authentication context
│   │   │   └── useSpeech.ts    # Web Speech API hook
│   │   ├── utils/
│   │   │   └── api.ts          # API client
│   │   ├── types.ts            # TypeScript types
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
├── package.json
├── .env.example
└── README.md
```

## Database Schema

The SQLite database includes tables for:
- `users` - Accounts with learner IDs
- `profiles` - Learning preferences and settings
- `learner_memory` - Persistent structured memory
- `level_history` - CEFR level assessments
- `sessions` - Conversation transcripts and metadata
- `mistakes` - Tracked errors with frequency
- `vocabulary` - Words with mastery tracking
- `goals` - Learning goals with progress
- `schedules` - Weekly practice schedule
- `progress` - Overall learning statistics
- `settings` - User display preferences

## Security

- Passwords hashed with bcrypt (12 rounds)
- JWT tokens for session management
- API key never exposed to frontend
- Input validation on all endpoints
- User data isolation (user_id filtering)
- CORS configured for development

## Deployment

### Replit
1. Upload the project files
2. Set environment variables in Secrets tab
3. Run `npm run install:all && npm start`

### Render
1. Create a new Web Service
2. Connect your repository
3. Set build command: `npm run install:all && npm run build`
4. Set start command: `npm start`
5. Add environment variables in dashboard

### Standard Node.js Hosting
1. Upload files to server
2. Run `npm run install:all`
3. Run `npm run build`
4. Set environment variables
5. Run `npm start` (or use PM2)

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key | Yes |
| `DATABASE_URL` | SQLite database path | Yes |
| `SESSION_SECRET` | JWT signing secret | Yes |
| `PORT` | Server port | No (default: 3001) |
| `NODE_ENV` | Environment mode | No (default: development) |

## Troubleshooting

**Microphone not working**: Ensure you're using HTTPS or localhost. Browsers require secure context for microphone access.

**Gemini API errors**: Check that your API key is valid and has quota available. The free tier has rate limits.

**Database locked**: SQLite WAL mode is enabled. If issues persist, delete the `.db` and `.db-shm`/`.db-wal` files and restart.

**Build errors**: Ensure Node.js 18+ is installed. Delete `node_modules` and run `npm run install:all` again.

## License

MIT License - Built for SHUVRO AI English Tutor

## Support

For issues or questions, check the browser console and server logs for detailed error messages.
