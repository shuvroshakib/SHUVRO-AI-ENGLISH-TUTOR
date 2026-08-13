import { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { User, Mail, Award, BookOpen, Clock, Flame, Target, Sparkles } from 'lucide-react';
import type { Profile as ProfileType } from '../types';

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.profile.get().then(data => {
      setProfile(data.profile);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-28 md:pb-6">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Profile</h1>

      {/* Profile Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-accent-100 rounded-full flex items-center justify-center shadow-sm">
            <User className="text-primary-600" size={32} />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-gray-900 truncate">{profile?.name || 'Learner'}</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Mail size={14} /> <span className="truncate">{profile?.email}</span>
            </div>
            <div className="text-xs text-primary-600 font-mono mt-1 bg-primary-50 inline-block px-2 py-0.5 rounded">
              {profile?.learner_id}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <Award size={16} /> Current Level
            </div>
            <div className="text-xl font-bold text-gray-900">{profile?.current_level || 'A1'}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <Target size={16} /> Target
            </div>
            <div className="text-xl font-bold text-gray-900">{profile?.target_level || 'B2'}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <Clock size={16} /> Daily Goal
            </div>
            <div className="text-xl font-bold text-gray-900">{profile?.daily_duration || 10} min</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <Flame size={16} /> Weekly
            </div>
            <div className="text-xl font-bold text-gray-900">{profile?.weekly_frequency || 5} days</div>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-6">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Sparkles size={18} className="text-accent-500" /> Learning Preferences
        </h3>
        <div className="space-y-3 text-sm">
          {[
            { label: 'Explanation Language', value: profile?.explanation_language?.replace(/_/g, ' ') || 'English' },
            { label: 'Bangla Assistance', value: profile?.bangla_assistance ? 'Enabled' : 'Disabled' },
            { label: 'Correction Intensity', value: profile?.correction_intensity || 'Normal' },
            { label: 'AI Personality', value: profile?.personality || 'Friendly' },
            { label: 'Voice Speed', value: profile?.voice_speed || 'Normal' },
            { label: 'Female Voice', value: profile?.female_voice ? 'Enabled' : 'Disabled' },
          ].map((item, i) => (
            <div key={i} className="flex justify-between py-2.5 border-b border-gray-100 last:border-0">
              <span className="text-gray-600">{item.label}</span>
              <span className="font-medium text-gray-800 capitalize">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Learning Goal */}
      {profile?.learning_goal && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <BookOpen size={18} className="text-primary-500" /> Learning Goal
          </h3>
          <p className="text-gray-600">{profile.learning_goal}</p>
        </div>
      )}
    </div>
  );
}
