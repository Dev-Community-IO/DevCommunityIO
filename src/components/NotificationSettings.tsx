import { useState, useEffect } from 'react';
import { Bell, Mail, Save, CheckCircle, Loader, AlertCircle } from 'lucide-react';
import { GlassCard } from './GlassCard';
import notificationsService from '../services/api/notifications.service';
import usersService from '../services/api/users.service';
import { useAuth } from '../contexts/AuthContext';

interface NotificationSettingsProps {
  onBack?: () => void;
}

export function NotificationSettings({ onBack }: NotificationSettingsProps) {
  const { user } = useAuth();
  const [inAppPrefs, setInAppPrefs] = useState({
    comment: true,
    reply: true,
    upvote: true,
    mention: true,
    follow: true,
    post: true,
    achievement: true,
    bookmark: true,
    reaction: true,
    share: true,
    page_invite: true,
    verification: true,
    system: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadPreferences();
    }
  }, [user?.id]);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      setError(null);
      const prefs = await notificationsService.getPreferences();
      if (prefs.inApp) {
        setInAppPrefs(prefs.inApp);
      }
    } catch (err: any) {
      console.error('Failed to load notification preferences:', err);
      setError(err?.message || 'Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key: keyof typeof inAppPrefs) => {
    setInAppPrefs(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveSuccess(false);
      setError(null);

      await notificationsService.updatePreferences({
        inApp: inAppPrefs,
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Failed to save notification preferences:', err);
      setError(err?.message || 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const notificationTypes = [
    { key: 'comment', label: 'Comments', description: 'When someone comments on your post' },
    { key: 'reply', label: 'Comment Replies', description: 'When someone replies to your comment' },
    { key: 'upvote', label: 'Upvotes', description: 'When someone upvotes your post or comment' },
    { key: 'mention', label: 'Mentions', description: 'When someone mentions you (@username)' },
    { key: 'follow', label: 'New Followers', description: 'When someone follows you' },
    { key: 'post', label: 'New Posts', description: 'When people you follow post' },
    { key: 'achievement', label: 'Achievements', description: 'When you unlock achievements' },
    { key: 'bookmark', label: 'Bookmarks', description: 'When someone bookmarks your post' },
    { key: 'reaction', label: 'Reactions', description: 'When someone reacts to your content' },
    { key: 'share', label: 'Shares', description: 'When someone shares your post' },
    { key: 'page_invite', label: 'Page Invites', description: 'When you\'re invited to a page' },
    { key: 'verification', label: 'Verification', description: 'Verification status updates' },
    { key: 'system', label: 'System', description: 'Important system notifications' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          ← Back
        </button>
      )}

      <div>
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Bell className="text-blue-500" size={28} />
          Notification Settings
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Control which notifications you receive in-app and via email
        </p>
      </div>

      {/* In-App Notifications */}
      <GlassCard className="p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Bell size={20} className="text-blue-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold">In-App Notifications</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Control which notifications appear in your notification center
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {notificationTypes.map((type) => (
            <div
              key={type.key}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex-1">
                <p className="font-medium">{type.label}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {type.description}
                </p>
              </div>
              <button
                onClick={() => handleToggle(type.key as keyof typeof inAppPrefs)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  inAppPrefs[type.key as keyof typeof inAppPrefs]
                    ? 'bg-blue-500'
                    : 'bg-gray-300 dark:bg-gray-700'
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    inAppPrefs[type.key as keyof typeof inAppPrefs]
                      ? 'translate-x-6'
                      : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Email Preferences Note */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-start gap-3">
          <Mail size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
              Email Preferences
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Email notification settings are managed separately. Navigate to Email Preferences 
              in your profile settings to control which emails you receive.
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
          <AlertCircle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-900 dark:text-red-100">Error</p>
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
        {saveSuccess ? (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <CheckCircle size={20} />
            <span className="font-medium">Preferences saved successfully!</span>
          </div>
        ) : (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Changes will take effect immediately
          </p>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <Loader size={18} className="animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={18} />
              Save Preferences
            </>
          )}
        </button>
      </div>
    </div>
  );
}
