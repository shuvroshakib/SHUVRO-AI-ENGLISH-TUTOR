import { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { Clock, MessageSquare, Trash2, Calendar, Mic } from 'lucide-react';
import type { Session } from '../types';

export default function History() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const data = await api.sessions.getAll();
      setSessions(data.sessions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteSession = async (sessionId: string) => {
    if (!confirm('Delete this session? This cannot be undone.')) return;
    try {
      await api.sessions.delete(sessionId);
      loadSessions();
    } catch (err) {
      console.error(err);
    }
  };

  const formatDuration = (mins: number) => {
    if (!mins) return '0 min';
    if (mins < 60) return `${mins} min`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-28 md:pb-6">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Conversation History</h1>

      {sessions.length === 0 ? (
        <div className="text-center py-16 text-gray-500 bg-white rounded-2xl border border-gray-200">
          <MessageSquare className="mx-auto mb-4 text-gray-300" size={56} />
          <p className="text-lg font-medium text-gray-600 mb-1">No conversations yet</p>
          <p className="text-sm">Start practicing to see your history here!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map(session => (
            <div key={session.session_id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-start justify-between shadow-sm hover:shadow-md transition-shadow">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="text-sm font-semibold text-gray-800 capitalize">{session.mode.replace(/_/g, ' ')}</span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar size={12} /> {new Date(session.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-1">
                  <span className="flex items-center gap-1"><Clock size={12} /> {formatDuration(session.duration || 0)}</span>
                  {session.topic && <span className="bg-gray-100 px-2 py-0.5 rounded-full">{session.topic}</span>}
                </div>
                {session.summary && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{session.summary}</p>
                )}
              </div>
              <button
                onClick={() => deleteSession(session.session_id)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors ml-2 shrink-0"
                title="Delete session"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
