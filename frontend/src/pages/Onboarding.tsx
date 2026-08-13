import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { ChevronRight, ChevronLeft, BookOpen, Clock, Globe, Target, Sparkles } from 'lucide-react';

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    name: '',
    learning_goal: '',
    explanation_language: 'english',
    daily_duration: 10,
    weekly_frequency: 5,
    current_level: 'A1',
    target_level: 'B2',
    bangla_assistance: true,
    female_voice: true,
    voice_speed: 'normal',
    personality: 'friendly',
    correction_intensity: 'normal',
  });
  const [saving, setSaving] = useState(false);

  const steps = [
    {
      title: 'What should I call you?',
      subtitle: "Let's personalize your experience",
      icon: Sparkles,
      content: (
        <div>
          <input
            type="text"
            value={data.name}
            onChange={e => setData({ ...data, name: e.target.value })}
            className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-lg"
            placeholder="Your name"
            autoFocus
          />
        </div>
      )
    },
    {
      title: 'Your Learning Goal',
      subtitle: 'What do you want to achieve?',
      icon: BookOpen,
      content: (
        <div className="space-y-2">
          {['Improve daily conversation', 'Prepare for IELTS', 'Job interview skills', 'Travel English', 'Academic English', 'General improvement'].map(goal => (
            <button
              key={goal}
              onClick={() => setData({ ...data, learning_goal: goal })}
              className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all ${data.learning_goal === goal ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
            >
              {goal}
            </button>
          ))}
        </div>
      )
    },
    {
      title: 'Language & Style',
      subtitle: 'How should I explain things?',
      icon: Globe,
      content: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Explanation Language</label>
            <select
              value={data.explanation_language}
              onChange={e => setData({ ...data, explanation_language: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none bg-white"
            >
              <option value="english">English Only</option>
              <option value="bangla">Bangla</option>
              <option value="english_bangla">English + Bangla</option>
            </select>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <input
              type="checkbox"
              id="bangla"
              checked={data.bangla_assistance}
              onChange={e => setData({ ...data, bangla_assistance: e.target.checked })}
              className="w-5 h-5 text-primary-600 rounded accent-primary-600"
            />
            <label htmlFor="bangla" className="text-sm text-gray-700">Enable Bangla assistance when I'm confused</label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">AI Personality</label>
            <div className="grid grid-cols-3 gap-2">
              {['friendly', 'professional', 'energetic', 'calm', 'patient', 'encouraging'].map(p => (
                <button
                  key={p}
                  onClick={() => setData({ ...data, personality: p })}
                  className={`py-2.5 rounded-xl border text-sm capitalize transition-all ${data.personality === p ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Your Schedule',
      subtitle: 'How much time can you practice?',
      icon: Clock,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Daily Practice Duration</label>
            <div className="flex gap-2">
              {[5, 10, 15, 30].map(min => (
                <button
                  key={min}
                  onClick={() => setData({ ...data, daily_duration: min })}
                  className={`flex-1 py-3 rounded-xl border font-medium transition-all ${data.daily_duration === min ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  {min} min
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Days Per Week: <span className="text-primary-600">{data.weekly_frequency}</span></label>
            <input
              type="range"
              min={1}
              max={7}
              value={data.weekly_frequency}
              onChange={e => setData({ ...data, weekly_frequency: parseInt(e.target.value) })}
              className="w-full accent-primary-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>1 day</span>
              <span>7 days</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Your English Level',
      subtitle: 'This helps me adapt to you',
      icon: Target,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Current Level (self-estimated)</label>
            <div className="grid grid-cols-3 gap-2">
              {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(level => (
                <button
                  key={level}
                  onClick={() => setData({ ...data, current_level: level })}
                  className={`py-3 rounded-xl border font-medium transition-all ${data.current_level === level ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Target Level</label>
            <div className="grid grid-cols-3 gap-2">
              {['A2', 'B1', 'B2', 'C1', 'C2'].map(level => (
                <button
                  key={level}
                  onClick={() => setData({ ...data, target_level: level })}
                  className={`py-3 rounded-xl border font-medium transition-all ${data.target_level === level ? 'border-accent-500 bg-accent-50 text-accent-700 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>
      )
    }
  ];

  const handleNext = async () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      setSaving(true);
      try {
        await api.profile.update(data);
        navigate('/');
      } catch (err) {
        console.error('Onboarding error:', err);
        setSaving(false);
      }
    }
  };

  const StepIcon = steps[step].icon;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-b from-primary-50 to-white">
      <div className="w-full max-w-lg">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <StepIcon className="text-primary-600" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{steps[step].title}</h1>
              <p className="text-sm text-gray-500">{steps[step].subtitle}</p>
            </div>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary-500 transition-all duration-500 ease-out"
              style={{ width: `${((step + 1) / steps.length) * 100}%` }}
            />
          </div>
          <div className="text-right text-xs text-gray-400 mt-1">Step {step + 1} of {steps.length}</div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          {steps[step].content}
        </div>

        <div className="flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-2 px-6 py-3.5 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition-colors"
            >
              <ChevronLeft size={18} /> Back
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : step === steps.length - 1 ? 'Start Learning' : 'Next'}
            {!saving && <ChevronRight size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}
