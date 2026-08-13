import { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { Settings as SettingsIcon, Trash2, Download, AlertTriangle, Check, Eye, EyeOff } from 'lucide-react';
import type { Settings as SettingsType } from '../types';

export default function Settings() {
  const { logout } = useAuth();
  const [settings, setSettings] = useState<SettingsType | null>(null);
  const [saved, setSaved] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    api.profile.getSettings().then(data => setSettings(data.settings));
  }, []);

  const update = async (updates: Partial<SettingsType>) => {
    const newSettings = { ...settings, ...updates } as SettingsType;
    setSettings(newSettings);
    await api.profile.updateSettings(updates);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    try {
      await api.auth.changePassword(currentPassword, newPassword);
      setPasswordSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to change password');
    }
  };

  const deleteAccount = async () => {
    if (!confirm('Are you absolutely sure? This will permanently delete your account and all data. This cannot be undone.')) return;
    if (!confirm('Last chance! All your progress, conversations, and vocabulary will be lost forever.')) return;
    try {
      await api.auth.deleteAccount();
      logout();
    } catch (err) {
      alert('Failed to delete account');
    }
  };

  if (!settings) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const Toggle = ({ value, onChange, label }: { value: boolean; onChange: () => void; label: string }) => (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm text-gray-700">{label}</span>
      <button
        onClick={onChange}
        className={`w-12 h-7 rounded-full transition-colors relative ${value ? 'bg-primary-500' : 'bg-gray-300'}`}
      >
        <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-28 md:pb-6">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <SettingsIcon size={28} /> Settings
      </h1>

      {saved && (
        <div className="bg-green-50 text-green-700 p-3 rounded-xl mb-4 text-sm flex items-center gap-2 border border-green-100">
          <Check size={16} /> Settings saved!
        </div>
      )}

      {/* Subtitles */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-1">Subtitles & Display</h3>
        <p className="text-xs text-gray-500 mb-4">Customize how captions and text appear</p>

        <Toggle value={settings.subtitles_enabled} onChange={() => update({ subtitles_enabled: !settings.subtitles_enabled })} label="Enable Subtitles" />
        <Toggle value={settings.focus_word_highlighting} onChange={() => update({ focus_word_highlighting: !settings.focus_word_highlighting })} label="Focus Word Highlighting" />
        <Toggle value={settings.bangla_captions} onChange={() => update({ bangla_captions: !settings.bangla_captions })} label="Bangla Captions" />
        <Toggle value={settings.auto_scroll} onChange={() => update({ auto_scroll: !settings.auto_scroll })} label="Auto-scroll Subtitles" />
        <Toggle value={settings.reduced_motion} onChange={() => update({ reduced_motion: !settings.reduced_motion })} label="Reduced Motion" />
        <Toggle value={settings.large_text} onChange={() => update({ large_text: !settings.large_text })} label="Large Text" />
      </div>

      {/* Change Password */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-4">Change Password</h3>
        <form onSubmit={changePassword} className="space-y-3">
          {passwordError && <div className="text-red-600 text-sm bg-red-50 p-2 rounded-lg">{passwordError}</div>}
          {passwordSuccess && <div className="text-green-600 text-sm bg-green-50 p-2 rounded-lg">{passwordSuccess}</div>}

          <div className="relative">
            <input
              type={showCurrentPassword ? 'text' : 'password'}
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              placeholder="Current password"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 pr-10"
            />
            <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <div className="relative">
            <input
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="New password (min 6 chars)"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 pr-10"
            />
            <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <button type="submit" className="w-full py-2.5 bg-gray-800 text-white rounded-xl text-sm font-medium hover:bg-gray-900 transition-colors">
            Update Password
          </button>
        </form>
      </div>

      {/* Data & Privacy */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-4">Data & Privacy</h3>
        <div className="space-y-3">
          <button className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary-600 transition-colors w-full py-2">
            <Download size={16} /> Export My Data
          </button>
          <button 
            onClick={async () => {
              if (!confirm('Clear all conversation history?')) return;
              // Would call API to clear history
            }}
            className="flex items-center gap-2 text-sm text-gray-700 hover:text-red-600 transition-colors w-full py-2"
          >
            <Trash2 size={16} /> Clear Conversation History
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-3 leading-relaxed">
          Your data is stored securely and used only to personalize your learning experience. 
          We never share your data with third parties.
        </p>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 shadow-sm">
        <h3 className="font-semibold text-red-800 mb-4 flex items-center gap-2">
          <AlertTriangle size={18} /> Danger Zone
        </h3>
        <p className="text-sm text-red-600 mb-4">Deleting your account will permanently remove all your data, progress, and conversations.</p>
        <button
          onClick={deleteAccount}
          className="w-full py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors text-sm"
        >
          Delete Account Permanently
        </button>
      </div>
    </div>
  );
}
