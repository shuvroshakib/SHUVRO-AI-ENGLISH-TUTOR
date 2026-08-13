import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { Mic, BookOpen, TrendingUp, Clock, Flame, Target, ChevronRight, Sparkles } from 'lucide-react';
import type { Profile, Progress } from '../types';

export default function Home() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [recommendation, setRecommendation] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const profileData = await api.profile.get();
      setProfile(profileData.profile);
      setProgress(profileData.progress);

      if (profileData.profile && !profileData.profile.onboarding_completed) {
        window.location.href = '/onboarding';
        return;
      }

      try {
        const rec = await api.gemini.recommendation({
          learnerMemory: JSON.stringify(profileData.memory),
          recentSessions: 'No recent sessions',
          currentLevel: profileData.profile?.current_level || 'A1'
        });
        setRecommendation(rec.recommendation);
      } catch (e) {
        setRecommendation('Start with a free conversation to assess your skills!');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-28 md:pb-6">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Welcome back, {profile?.name || 'Learner'}!</h1>
        <p className="text-gray-600 mt-1">Ready to improve your English today?</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-xs text-gray-500 mb-1 font-medium">Current Level</div>
          <div className="text-2xl font-bold text-primary-600">{profile?.current_level || 'A1'}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-xs text-gray-500 mb-1 font-medium">Target</div>
          <div className="text-2xl font-bold text-accent-600">{profile?.target_level || 'B2'}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-xs text-gray-500 mb-1 font-medium">Streak</div>
          <div className="flex items-center gap-1.5 text-2xl font-bold text-orange-500">
            <Flame size={22} /> {progress?.practice_streak || 0}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-xs text-gray-500 mb-1 font-medium">Speaking Time</div>
          <div className="flex items-center gap-1.5 text-2xl font-bold text-blue-600">
            <Clock size={22} /> {Math.floor((progress?.total_speaking_time || 0) / 60)}h
          </div>
        </div>
      </div>

      {/* Main Actions */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <Link
          to="/practice"
          className="flex items-center gap-4 bg-primary-600 text-white p-6 rounded-2xl hover:bg-primary-700 transition-all shadow-md hover:shadow-lg"
        >
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center shrink-0">
            <Mic size={28} />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-lg">Start Voice Practice</div>
            <div className="text-primary-100 text-sm">Begin a conversation with SHUVRO AI</div>
          </div>
          <ChevronRight className="ml-auto shrink-0" />
        </Link>

        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={18} className="text-accent-500" />
            <span className="font-semibold text-gray-800">Today's Recommendation</span>
          </div>
          <p className="text-sm text-gray-600 mb-3 leading-relaxed">{recommendation}</p>
          <Link to="/practice" className="text-sm text-primary-600 font-medium hover:underline inline-flex items-center gap-1">
            Start recommended practice <ChevronRight size={14} />
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-primary-500" /> Your Progress
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: 'Fluency', value: progress?.fluency || 0, color: 'bg-blue-500' },
            { label: 'Grammar', value: progress?.grammar || 0, color: 'bg-green-500' },
            { label: 'Vocabulary', value: progress?.vocabulary || 0, color: 'bg-purple-500' },
            { label: 'Pronunciation', value: progress?.pronunciation || 0, color: 'bg-pink-500' },
            { label: 'Confidence', value: progress?.confidence || 0, color: 'bg-orange-500' },
            { label: 'Accuracy', value: progress?.accuracy || 0, color: 'bg-teal-500' },
          ].map(stat => (
            <div key={stat.label}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-gray-600">{stat.label}</span>
                <span className="font-semibold text-gray-800">{Math.round(stat.value)}%</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${stat.color} rounded-full transition-all duration-700`} 
                  style={{ width: `${Math.min(stat.value, 100)}%` }} 
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Learning Modes Quick Access */}
      <div className="mt-6">
        <h3 className="font-semibold text-gray-800 mb-3">Quick Practice Modes</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { mode: 'free_conversation', label: 'Free Chat', icon: '💬' },
            { mode: 'grammar', label: 'Grammar', icon: '📝' },
            { mode: 'vocabulary', label: 'Vocabulary', icon: '📚' },
            { mode: 'job_interview', label: 'Interview', icon: '💼' },
            { mode: 'ielts_speaking', label: 'IELTS', icon: '🎯' },
            { mode: 'travel_english', label: 'Travel', icon: '✈️' },
            { mode: 'daily_conversation', label: 'Daily', icon: '🗣️' },
            { mode: 'pronunciation', label: 'Pronounce', icon: '🔊' },
          ].map(item => (
            <Link
              key={item.mode}
              to={`/practice?mode=${item.mode}`}
              className="bg-white border border-gray-200 p-3 rounded-xl text-center hover:border-primary-300 hover:shadow-sm transition-all"
            >
              <div className="text-2xl mb-1">{item.icon}</div>
              <div className="text-xs font-medium text-gray-700">{item.label}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
