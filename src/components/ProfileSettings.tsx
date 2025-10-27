import { useState } from 'react';
import { User, Mail, MapPin, Briefcase, Link as LinkIcon, Twitter, Github, Globe, Save, Shield, Bell, Eye, Lock } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Avatar } from './Avatar';

interface ProfileSettingsProps {
  user: {
    username: string;
    avatar: string;
    role: string;
    location: string;
    bio: string;
    walletAddress: string;
  };
}

export function ProfileSettings({ user }: ProfileSettingsProps) {
  const [activeSection, setActiveSection] = useState<'profile' | 'account' | 'privacy' | 'notifications'>('profile');
  const [formData, setFormData] = useState({
    username: user.username,
    email: 'emma.smith@example.com',
    role: user.role,
    location: user.location,
    bio: user.bio,
    website: 'https://emmasmith.dev',
    twitter: '@emmasmith',
    github: 'emmasmith'
  });

  const sections = [
    { id: 'profile', label: 'Profile Info', icon: User },
    { id: 'account', label: 'Account', icon: Shield },
    { id: 'privacy', label: 'Privacy', icon: Eye },
    { id: 'notifications', label: 'Notifications', icon: Bell }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Settings Navigation */}
      <GlassCard className="p-4 h-fit">
        <div className="space-y-1">
          {sections.map(section => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                  activeSection === section.id
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Icon size={18} />
                {section.label}
              </button>
            );
          })}
        </div>
      </GlassCard>

      {/* Settings Content */}
      <div className="lg:col-span-3">
        {activeSection === 'profile' && (
          <GlassCard className="p-6">
            <h2 className="text-2xl font-bold mb-6">Profile Information</h2>

            <div className="space-y-6">
              {/* Avatar Upload */}
              <div>
                <label className="block text-sm font-semibold mb-3">Profile Picture</label>
                <div className="flex items-center gap-4">
                  <Avatar src={user.avatar} alt={user.username} size="xl" className="w-20 h-20" />
                  <div className="space-y-2">
                    <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-medium">
                      Upload New
                    </button>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      JPG, PNG or GIF. Max size 2MB.
                    </p>
                  </div>
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  <User size={16} className="inline mr-2" />
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  <Mail size={16} className="inline mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  <Briefcase size={16} className="inline mr-2" />
                  Current Role
                </label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  <MapPin size={16} className="inline mr-2" />
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-semibold mb-2">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none resize-none transition-all"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {formData.bio.length} / 500 characters
                </p>
              </div>

              {/* Social Links */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold">Social Links</h3>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    <Globe size={16} className="inline mr-2" />
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://"
                    className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    <Twitter size={16} className="inline mr-2" />
                    Twitter
                  </label>
                  <input
                    type="text"
                    value={formData.twitter}
                    onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                    placeholder="@username"
                    className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    <Github size={16} className="inline mr-2" />
                    GitHub
                  </label>
                  <input
                    type="text"
                    value={formData.github}
                    onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                    placeholder="username"
                    className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Save Button */}
              <div className="flex gap-3 pt-4">
                <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all font-semibold shadow-lg">
                  <Save size={18} />
                  Save Changes
                </button>
                <button className="px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all font-semibold">
                  Cancel
                </button>
              </div>
            </div>
          </GlassCard>
        )}

        {activeSection === 'account' && (
          <GlassCard className="p-6">
            <h2 className="text-2xl font-bold mb-6">Account Settings</h2>

            <div className="space-y-6">
              {/* Wallet Address */}
              <div>
                <label className="block text-sm font-semibold mb-2">Wallet Address</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={user.walletAddress}
                    readOnly
                    className="flex-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 outline-none"
                  />
                  <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-medium">
                    Copy
                  </button>
                </div>
              </div>

              {/* Change Password */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Lock size={20} />
                  Change Password
                </h3>
                <div>
                  <label className="block text-sm font-semibold mb-2">Current Password</label>
                  <input
                    type="password"
                    placeholder="Enter current password"
                    className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">New Password</label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  />
                </div>
                <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-medium">
                  Update Password
                </button>
              </div>

              {/* Danger Zone */}
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-red-500 mb-4">Danger Zone</h3>
                <div className="space-y-3">
                  <button className="w-full px-6 py-3 border-2 border-red-500 text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all font-semibold">
                    Deactivate Account
                  </button>
                  <button className="w-full px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all font-semibold">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </GlassCard>
        )}

        {activeSection === 'privacy' && (
          <GlassCard className="p-6">
            <h2 className="text-2xl font-bold mb-6">Privacy Settings</h2>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div>
                  <h4 className="font-semibold">Show Email Address</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Allow others to see your email address
                  </p>
                </div>
                <label className="relative inline-block w-12 h-6">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-12 h-6 bg-gray-300 dark:bg-gray-600 rounded-full peer-checked:bg-blue-500 transition-all cursor-pointer"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-6"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div>
                  <h4 className="font-semibold">Show Activity Status</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Let others see when you're online
                  </p>
                </div>
                <label className="relative inline-block w-12 h-6">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-12 h-6 bg-gray-300 dark:bg-gray-600 rounded-full peer-checked:bg-blue-500 transition-all cursor-pointer"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-6"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div>
                  <h4 className="font-semibold">Profile Visibility</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Make your profile visible to everyone
                  </p>
                </div>
                <label className="relative inline-block w-12 h-6">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-12 h-6 bg-gray-300 dark:bg-gray-600 rounded-full peer-checked:bg-blue-500 transition-all cursor-pointer"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-6"></div>
                </label>
              </div>
            </div>
          </GlassCard>
        )}

        {activeSection === 'notifications' && (
          <GlassCard className="p-6">
            <h2 className="text-2xl font-bold mb-6">Notification Preferences</h2>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div>
                  <h4 className="font-semibold">Email Notifications</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Receive email updates about your activity
                  </p>
                </div>
                <label className="relative inline-block w-12 h-6">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-12 h-6 bg-gray-300 dark:bg-gray-600 rounded-full peer-checked:bg-blue-500 transition-all cursor-pointer"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-6"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div>
                  <h4 className="font-semibold">Push Notifications</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Get push notifications on your devices
                  </p>
                </div>
                <label className="relative inline-block w-12 h-6">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-12 h-6 bg-gray-300 dark:bg-gray-600 rounded-full peer-checked:bg-blue-500 transition-all cursor-pointer"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-6"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div>
                  <h4 className="font-semibold">Comments on Posts</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Notify when someone comments on your posts
                  </p>
                </div>
                <label className="relative inline-block w-12 h-6">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-12 h-6 bg-gray-300 dark:bg-gray-600 rounded-full peer-checked:bg-blue-500 transition-all cursor-pointer"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-6"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div>
                  <h4 className="font-semibold">Mentions</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Notify when someone mentions you
                  </p>
                </div>
                <label className="relative inline-block w-12 h-6">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-12 h-6 bg-gray-300 dark:bg-gray-600 rounded-full peer-checked:bg-blue-500 transition-all cursor-pointer"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-6"></div>
                </label>
              </div>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
