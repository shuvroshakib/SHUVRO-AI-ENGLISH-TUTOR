import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../utils/api';
import { useSpeech } from '../hooks/useSpeech';
import Avatar from '../components/Avatar';
import Subtitles from '../components/Subtitles';
import CorrectionPanel from '../components/CorrectionPanel';
import { Mic, MicOff, Volume2, VolumeX, MessageSquare, Settings, X, Send, RotateCcw } from 'lucide-react';
import type { ChatMessage, Correction } from '../types';

const MODES = [
  'free_conversation', 'daily_conversation', 'grammar', 'vocabulary', 'pronunciation',
  'job_interview', 'ielts_speaking', 'travel_english', 'workplace_english', 'academic_english',
  'roleplay', 'quick_practice', 'weakness_mode', 'review_mode', 'challenge_mode',
  'listening_practice', 'storytelling', 'debate', 'presentation', 'custom_topic'
];

const MODE_ICONS: Record<string, string> = {
  free_conversation: '💬', daily_conversation: '🗣️', grammar: '📝', vocabulary: '📚',
  pronunciation: '🔊', job_interview: '💼', ielts_speaking: '🎯', travel_english: '✈️',
  workplace_english: '🏢', academic_english: '🎓', roleplay: '🎭', quick_practice: '⚡',
  weakness_mode: '🔧', review_mode: '🔄', challenge_mode: '🏆', listening_practice: '👂',
  storytelling: '📖', debate: '⚖️', presentation: '📊', custom_topic: '✨'
};

export default function Practice() {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') || 'free_conversation';

  const [mode, setMode] = useState(initialMode);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [aiState, setAiState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [correction, setCorrection] = useState<Correction | null>(null);
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(true);
  const [mute, setMute] = useState(false);
  const [showModes, setShowModes] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const [useTextInput, setUseTextInput] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionActive, setSessionActive] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionStartTime = useRef<number>(Date.now());
  const hasStarted = useRef(false);

  const {
    isListening, isSpeaking, transcript, interimTranscript,
    startListening, stopListening, speak, stopSpeaking, clearTranscript
  } = useSpeech();

  useEffect(() => {
    if (!hasStarted.current) {
      hasStarted.current = true;
      startSession();
    }
    return () => {
      if (sessionId) endSession();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!isListening && transcript.trim()) {
      const text = transcript.trim();
      clearTranscript();
      handleUserMessage(text);
    }
  }, [isListening, transcript]);

  const startSession = async () => {
    try {
      setError(null);
      const session = await api.sessions.create({ mode, topic: null });
      setSessionId(session.sessionId);
      sessionStartTime.current = Date.now();
      setSessionActive(true);

      setAiState('thinking');
      const response = await api.gemini.chat({
        message: 'Hello, I am ready to start our English practice session.',
        mode,
        context: '',
        learnerMemory: '',
        history: ''
      });
      setAiState('speaking');
      addMessage('assistant', response.response);
      if (!mute) speak(response.response);
    } catch (err: any) {
      console.error('Session start error:', err);
      setError('Failed to start session. Please check your connection and API key.');
      setAiState('idle');
    }
  };

  const handleUserMessage = async (text: string) => {
    if (!text.trim() || !sessionActive) return;

    setAiState('thinking');
    setCorrection(null);
    setError(null);
    addMessage('user', text);

    try {
      const history = messages.slice(-10).map(m => `${m.role}: ${m.content}`).join('\n');
      const response = await api.gemini.chat({
        message: text,
        mode,
        context: `Current mode: ${mode}`,
        learnerMemory: '',
        history
      });

      // Simple demo correction detection
      const lowerText = text.toLowerCase();
      if (lowerText.includes('am agree') || lowerText.includes('i am agree')) {
        setCorrection({
          original: text,
          corrected: text.replace(/i am agree/gi, 'I agree').replace(/am agree/gi, 'agree'),
          explanation: '"Agree" is already a verb. We do not need "am" before it.',
          banglaExplanation: "'Agree' একটি verb, তাই এর আগে 'am' ব্যবহার করতে হয় না।",
          focusWord: 'agree',
          category: 'grammar'
        });
      } else if (lowerText.includes('he go to') || lowerText.includes('she go to')) {
        setCorrection({
          original: text,
          corrected: text.replace(/he go to/gi, 'he goes to').replace(/she go to/gi, 'she goes to'),
          explanation: 'With third person singular (he/she/it), add -es or -s to the verb.',
          banglaExplanation: 'তৃতীয় পুরুষ একবচন (he/she/it) এর সাথে verb এর শেষে -es বা -s যোগ করতে হয়।',
          focusWord: 'goes',
          category: 'grammar'
        });
      } else if (lowerText.includes('i have ') && lowerText.includes(' yesterday')) {
        setCorrection({
          original: text,
          corrected: text.replace(/have/gi, 'had'),
          explanation: 'Use past perfect "had" for actions completed before another past action.',
          banglaExplanation: 'অতীতে একটি কাজ অন্য অতীত কাজের আগে সম্পন্ন হলে past perfect "had" ব্যবহার করুন।',
          focusWord: 'had',
          category: 'grammar'
        });
      }

      addMessage('assistant', response.response);
      setAiState('speaking');
      if (!mute) speak(response.response);
    } catch (err: any) {
      setAiState('idle');
      setError('AI response failed. Please try again.');
      addMessage('assistant', 'Sorry, I had trouble responding. Please try again.');
    }
  };

  const addMessage = (role: 'user' | 'assistant', content: string) => {
    setMessages(prev => [...prev, { role, content, timestamp: Date.now() }]);
  };

  const endSession = async () => {
    if (!sessionId || !sessionActive) return;
    const duration = Math.floor((Date.now() - sessionStartTime.current) / 1000 / 60);
    const transcriptText = messages.map(m => `${m.role}: ${m.content}`).join('\n');

    try {
      await api.sessions.update(sessionId, {
        duration,
        messages,
        transcript: transcriptText,
        ended_at: new Date().toISOString()
      });
    } catch (err) {
      console.error('End session error:', err);
    }
    setSessionActive(false);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
      setAiState('idle');
    } else {
      stopSpeaking();
      setAiState('listening');
      startListening();
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    handleUserMessage(textInput);
    setTextInput('');
  };

  const handleEndSession = async () => {
    await endSession();
    setMessages([]);
    setCorrection(null);
    setAiState('idle');
    hasStarted.current = false;
    startSession();
  };

  const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
  const lastAiMessage = messages.filter(m => m.role === 'assistant').pop()?.content || '';

  const getAvatarState = (): any => {
    if (aiState === 'thinking') return 'thinking';
    if (aiState === 'speaking') return 'speaking';
    if (isListening) return 'listening';
    if (correction) return 'correcting';
    return 'idle';
  };

  return (
    <div className="h-[calc(100vh-56px)] md:h-[calc(100vh-48px)] flex flex-col md:flex-row bg-gray-50">
      {/* Left: Avatar & Controls */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 bg-gradient-to-b from-primary-50 via-white to-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-primary-100 rounded-full opacity-30 blur-3xl" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-accent-100 rounded-full opacity-30 blur-3xl" />

        <Avatar state={getAvatarState()} />

        {/* AI State */}
        <div className="mt-4 text-center z-10">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{aiState}</div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-3 px-4 py-2 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100 max-w-xs text-center">
            {error}
          </div>
        )}

        {/* Main Controls */}
        <div className="flex items-center gap-4 mt-6 z-10">
          <button
            onClick={() => setMute(!mute)}
            className={`p-3.5 rounded-full shadow-sm transition-all ${mute ? 'bg-red-100 text-red-600' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            title={mute ? 'Unmute' : 'Mute'}
          >
            {mute ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>

          <button
            onClick={toggleListening}
            className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all transform active:scale-95 ${isListening ? 'bg-red-500 text-white animate-pulse shadow-red-200' : 'bg-primary-600 text-white hover:bg-primary-700 shadow-primary-200'}`}
            title={isListening ? 'Stop listening' : 'Start listening'}
          >
            {isListening ? <MicOff size={32} /> : <Mic size={32} />}
          </button>

          <button
            onClick={() => setShowModes(!showModes)}
            className="p-3.5 rounded-full bg-white text-gray-600 hover:bg-gray-50 shadow-sm transition-all"
            title="Change mode"
          >
            <Settings size={20} />
          </button>
        </div>

        {/* Secondary controls */}
        <div className="mt-4 flex items-center gap-3 z-10">
          <button
            onClick={() => setUseTextInput(!useTextInput)}
            className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full border border-gray-200"
          >
            <MessageSquare size={13} /> {useTextInput ? 'Use Voice' : 'Use Text'}
          </button>
          <button
            onClick={handleEndSession}
            className="text-xs text-gray-500 hover:text-red-600 flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full border border-gray-200"
          >
            <RotateCcw size={13} /> New Session
          </button>
        </div>

        {useTextInput && (
          <form onSubmit={handleTextSubmit} className="mt-3 flex gap-2 w-full max-w-sm z-10">
            <input
              type="text"
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              autoFocus
            />
            <button type="submit" className="px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm hover:bg-primary-700">
              <Send size={16} />
            </button>
          </form>
        )}
      </div>

      {/* Right: Subtitles & Chat */}
      <div className="md:w-96 bg-white border-l border-gray-200 flex flex-col shadow-sm">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-2">
            <span className="text-lg">{MODE_ICONS[mode] || '💬'}</span>
            <span className="font-semibold text-sm text-gray-700 capitalize">{mode.replace(/_/g, ' ')}</span>
          </div>
          <button
            onClick={() => setSubtitlesEnabled(!subtitlesEnabled)}
            className="text-xs text-primary-600 font-medium hover:underline"
          >
            {subtitlesEnabled ? 'Hide CC' : 'Show CC'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <Subtitles
            userText={lastUserMessage}
            aiText={lastAiMessage}
            focusWord={correction?.focusWord}
            enabled={subtitlesEnabled}
          />

          <CorrectionPanel correction={correction} />

          <div className="space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`text-sm ${msg.role === 'user' ? 'text-blue-700 bg-blue-50 p-3 rounded-xl' : 'text-gray-700 bg-gray-50 p-3 rounded-xl'}`}>
                <span className="text-xs font-bold uppercase text-gray-400 block mb-1">{msg.role === 'user' ? 'You' : 'SHUVRO AI'}</span>
                <div className="leading-relaxed">{msg.content}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Mode Selector Modal */}
      {showModes && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-gray-900">Select Practice Mode</h3>
              <button onClick={() => setShowModes(false)} className="p-1 hover:bg-gray-100 rounded-full">
                <X size={24} className="text-gray-500" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {MODES.map(m => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setShowModes(false); }}
                  className={`p-3 rounded-xl border text-sm font-medium text-left flex items-center gap-2 transition-all ${mode === m ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                >
                  <span>{MODE_ICONS[m] || '💬'}</span>
                  {m.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
