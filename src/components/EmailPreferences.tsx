import { useState, useEffect } from 'react';
import { Mail, Bell, CheckCircle, Save } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface EmailPreferences {
  welcome_email: boolean;
  post_like: boolean;
  post_comment: boolean;
  comment_like: boolean;
  comment_reply: boolean;
  mention: boolean;
  new_follower: boolean;
  follow_post: boolean;
  tag_activity: boolean;
  page_activity: boolean;
  weekly_digest: boolean;
  monthly_recap: boolean;
  achievement_unlocked: boolean;
  marketing_emails: boolean;
  digest_frequency: 'daily' | 'weekly' | 'monthly' | 'never';
}

export function EmailPreferences() {
  const [preferences, setPreferences] = useState<EmailPreferences>({
    welcome_email: true,
    post_like: true,
    post_comment: true,
    comment_like: true,
    comment_reply: true,
    mention: true,
    new_follower: true,
    follow_post: true,
    tag_activity: true,
    page_activity: true,
    weekly_digest: true,
    monthly_recap: true,
    achievement_unlocked: true,
    marketing_emails: false,
    digest_frequency: 'weekly',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      // TODO: Replace with real API call
      // const data = await apiService.getEmailPreferences();
      // setPreferences(data);
    } catch (error) {
      console.error('Failed to load email preferences:', error);
    }
  };

  const handleToggle = (key: keyof EmailPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleDigestFrequency = (frequency: EmailPreferences['digest_frequency']) => {
    setPreferences(prev => ({
      ...prev,
      digest_frequency: frequency,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      // TODO: Replace with real API call
      // await apiService.updateEmailPreferences(preferences);
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save email preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const categories = [
    {
      title: 'Engagement Notifications',
      icon: Bell,
      description: 'Get notified when someone interacts with your content',
      items: [
        { key: 'post_like', label: 'Post Likes', description: 'When someone likes your post' },
        { key: 'post_comment', label: 'Post Comments', description: 'When someone comments on your post' },
        { key: 'comment_like', label: 'Comment Likes', description: 'When someone likes your comment' },
        { key: 'comment_reply', label: 'Comment Replies', description: 'When someone replies to your comment' },
        { key: 'mention', label: 'Mentions', description: 'When someone mentions you (@username)' },
      ],
    },
    {
      title: 'Social Notifications',
      icon: Mail,
      description: 'Stay updated on your network activity',
      items: [
        { key: 'new_follower', label: 'New Followers', description: 'When someone follows you' },
        { key: 'follow_post', label: 'New Posts from Following', description: 'When people you follow post' },
        { key: 'tag_activity', label: 'Tag Activity', description: 'Activity in tags you follow' },
        { key: 'page_activity', label: 'Page Activity', description: 'Activity in pages you joined' },
      ],
    },
    {
      title: 'Platform Updates',
      icon: CheckCircle,
      description: 'Important updates and achievements',
      items: [
        { key: 'achievement_unlocked', label: 'Achievements', description: 'When you unlock achievements' },
        { key: 'weekly_digest', label: 'Weekly Digest', description: 'Weekly summary of activity' },
        { key: 'monthly_recap', label: 'Monthly Recap', description: 'Monthly highlights and stats' },
        { key: 'marketing_emails', label: 'Marketing & Updates', description: 'Product updates and features' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Email Preferences</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your email notifications and digest frequency
        </p>
      </div>

      {/* Digest Frequency */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Mail size={20} className="text-blue-500" />
          Digest Frequency
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Choose how often you want to receive digest emails
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(['daily', 'weekly', 'monthly', 'never'] as const).map((freq) => (
            <button
              key={freq}
              onClick={() => handleDigestFrequency(freq)}
              className={`p-3 rounded-lg border-2 transition-all font-medium capitalize ${
                preferences.digest_frequency === freq
                  ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-500/50'
              }`}
            >
              {freq}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Notification Categories */}
      {categories.map((category) => {
        const Icon = category.icon;
        return (
          <GlassCard key={category.title} className="p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Icon size={20} className="text-blue-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{category.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {category.description}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {category.items.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {item.description}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggle(item.key as keyof EmailPreferences)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      preferences[item.key as keyof EmailPreferences]
                        ? 'bg-blue-500'
                        : 'bg-gray-300 dark:bg-gray-700'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                        preferences[item.key as keyof EmailPreferences]
                          ? 'translate-x-6'
                          : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </GlassCard>
        );
      })}

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
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
        >
          <Save size={18} />
          {isSaving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>

      {/* Info Box */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          <strong>📧 Email Address:</strong> All emails will be sent to your registered email address.
          You can always unsubscribe from any email type using the link at the bottom of each email.
        </p>
      </div>
    </div>
  );
}

