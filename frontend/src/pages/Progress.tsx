import { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Award, AlertCircle, Clock, Flame, Target } from 'lucide-react';
import type { Progress as ProgressType, LevelHistory } from '../types';

export default function Progress() {
  const [progress, setProgress] = useState<ProgressType | null>(null);
  const [levelHistory, setLevelHistory] = useState<LevelHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.learning.getProgress().then(data => {
      setProgress(data.progress);
      setLevelHistory(data.levelHistory);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const skillData = progress ? [
    { name: 'Fluency', value: Math.round(progress.fluency) },
    { name: 'Grammar', value: Math.round(progress.grammar) },
    { name: 'Vocabulary', value: Math.round(progress.vocabulary) },
    { name: 'Pronunciation', value: Math.round(progress.pronunciation) },
    { name: 'Confidence', value: Math.round(progress.confidence) },
    { name: 'Accuracy', value: Math.round(progress.accuracy) },
  ] : [];

  const levelData = levelHistory.map(l => ({
    date: new Date(l.assessed_at).toLocaleDateString(),
    level: ['A1','A2','B1','B2','C1','C2'].indexOf(l.level) + 1,
    confidence: Math.round(l.confidence)
  }));

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-28 md:pb-6">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Your Progress</h1>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 text-primary-600 mb-2">
            <Clock size={20} />
            <span className="font-semibold text-sm">Total Speaking</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{Math.floor((progress?.total_speaking_time || 0) / 60)}h {((progress?.total_speaking_time || 0) % 60)}m</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 text-orange-500 mb-2">
            <Award size={20} />
            <span className="font-semibold text-sm">Accuracy</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{Math.round(progress?.accuracy || 0)}%</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 text-accent-600 mb-2">
            <Flame size={20} />
            <span className="font-semibold text-sm">Streak</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{progress?.practice_streak || 0} days</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Target size={18} className="text-primary-500" /> Skill Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={skillData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{fontSize: 11}} />
              <YAxis domain={[0, 100]} tick={{fontSize: 11}} />
              <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
              <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-accent-500" /> Level History
          </h3>
          {levelData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={levelData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{fontSize: 10}} angle={-15} textAnchor="end" height={50} />
                <YAxis domain={[0, 6]} ticks={[1,2,3,4,5,6]} tickFormatter={(v) => ['A1','A2','B1','B2','C1','C2'][v-1]} tick={{fontSize: 11}} />
                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                <Line type="monotone" dataKey="level" stroke="#d946ef" strokeWidth={3} dot={{r: 5, fill: '#d946ef'}} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-400 text-sm">
              Complete your placement to see level history
            </div>
          )}
        </div>
      </div>

      {/* Weekly Schedule Preview */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-4">Weekly Schedule</h3>
        <div className="grid grid-cols-7 gap-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
            <div key={day} className="text-center">
              <div className="text-xs text-gray-500 mb-1">{day}</div>
              <div className={`w-full aspect-square rounded-lg flex items-center justify-center text-lg ${i < 5 ? 'bg-primary-50 text-primary-600' : 'bg-gray-50 text-gray-400'}`}>
                {i < 5 ? '✓' : '—'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
