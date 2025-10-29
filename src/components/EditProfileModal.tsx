import { useState, useEffect } from 'react';
import { X, Upload, Camera, Twitter, Linkedin, Send, Github, Loader2, User, MapPin, Briefcase, FileText, Link as LinkIcon } from 'lucide-react';
import { Avatar } from './Avatar';
import usersService from '../services/api/users.service';
import onboardingService from '../services/api/onboarding.service';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    username: string;
    pseudo?: string;
    avatar: string;
    avatarUrl?: string;
    coverImageUrl?: string;
    location: string;
    occupation?: string;
    bio: string;
    skills: string[];
    socialLinks?: {
      twitter?: string;
      linkedin?: string;
      telegram?: string;
      github?: string;
    };
  };
  onSave: (updatedUser: any) => void;
}

type TabType = 'basic' | 'social';

export function EditProfileModal({ isOpen, onClose, user, onSave }: EditProfileModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [formData, setFormData] = useState({
    username: user.username,
    pseudo: user.pseudo || '',
    avatar: user.avatarUrl || user.avatar,
    coverImage: user.coverImageUrl || '',
    location: user.location || '',
    occupation: user.occupation || '',
    bio: user.bio || '',
    skills: user.skills.join(', '),
    socialLinks: {
      twitter: user.socialLinks?.twitter || '',
      linkedin: user.socialLinks?.linkedin || '',
      telegram: user.socialLinks?.telegram || '',
      github: user.socialLinks?.github || '',
    }
  });

  const [previewAvatar, setPreviewAvatar] = useState(user.avatarUrl || user.avatar);
  const [previewCover, setPreviewCover] = useState(user.coverImageUrl || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  // Reset form when user changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        username: user.username,
        pseudo: user.pseudo || '',
        avatar: user.avatarUrl || user.avatar,
        coverImage: user.coverImageUrl || '',
        location: user.location || '',
        occupation: user.occupation || '',
        bio: user.bio || '',
        skills: user.skills.join(', '),
        socialLinks: {
          twitter: user.socialLinks?.twitter || '',
          linkedin: user.socialLinks?.linkedin || '',
          telegram: user.socialLinks?.telegram || '',
          github: user.socialLinks?.github || '',
        }
      });
      setPreviewAvatar(user.avatarUrl || user.avatar);
      setPreviewCover(user.coverImageUrl || '');
      setAvatarFile(null);
      setCoverFile(null);
      setActiveTab('basic');
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewCover(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      let avatarUrl = formData.avatar;
      let coverUrl = formData.coverImage;

      // Upload avatar if changed
      if (avatarFile) {
        setUploadProgress('Uploading avatar...');
        const response = await usersService.uploadAvatar(avatarFile);
        avatarUrl = response.url;
      }

      // Upload cover if changed
      if (coverFile) {
        setUploadProgress('Uploading cover image...');
        const response = await usersService.uploadCoverImage(coverFile);
        coverUrl = response.url;
      }

      // Update profile with new data
      setUploadProgress('Updating profile...');
      const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(s => s).slice(0, 6); // Limit to 6 skills
      
      if (skillsArray.length > 6) {
        alert('Maximum 6 skills allowed. Only the first 6 will be saved.');
      }
      
      await onboardingService.updateProfile({
        username: formData.username,
        pseudo: formData.pseudo,
        bio: formData.bio,
        location: formData.location,
        occupation: formData.occupation,
        // Role is not user-editable - removed from update
        skills: skillsArray,
        socialLinks: formData.socialLinks
      });

      onSave({
        ...formData,
        avatar: avatarUrl,
        avatarUrl: avatarUrl,
        coverImage: coverUrl,
        skills: skillsArray,
        socialLinks: formData.socialLinks
      });

      onClose();
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update profile';
      
      // Show specific error for username uniqueness
      if (errorMessage.includes('Username') || errorMessage.includes('username')) {
        alert(errorMessage);
      } else {
        alert('Failed to update profile: ' + errorMessage);
      }
      
      // Reset username if it failed due to uniqueness
      if (errorMessage.includes('Username is already taken') || errorMessage.includes('username')) {
        setFormData(prev => ({ ...prev, username: user.username }));
      }
    } finally {
      setUploading(false);
      setUploadProgress('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Compact Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Edit Profile</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30">
          <button
            onClick={() => setActiveTab('basic')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'basic'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-white dark:bg-gray-900'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <User size={16} className="inline-block mr-2" />
            Basic Info
          </button>
          <button
            onClick={() => setActiveTab('social')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'social'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-white dark:bg-gray-900'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <LinkIcon size={16} className="inline-block mr-2" />
            Social Links
          </button>
        </div>

        {/* Scrollable Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-5 space-y-4">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <>
                {/* Cover & Avatar - Compact */}
                <div className="space-y-3">
                  {/* Cover Image - Compact */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Cover Image</label>
                    <div className="relative h-24 rounded-lg overflow-hidden bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400">
                      {previewCover ? (
                        <img src={previewCover} alt="Cover preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400" />
                      )}
                      <label className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 cursor-pointer transition-colors group">
                        <Camera size={18} className="text-white opacity-80 group-hover:opacity-100 transition-opacity" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCoverChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                    {previewCover && (
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewCover('');
                          setCoverFile(null);
                          setFormData({ ...formData, coverImage: '' });
                        }}
                        className="mt-1.5 text-xs text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Remove cover image
                      </button>
                    )}
                  </div>

                  {/* Avatar - Compact */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Profile Picture</label>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar
                          src={previewAvatar}
                          alt={formData.username}
                          size="md"
                          className="w-16 h-16"
                        />
                        <label className="absolute -bottom-1 -right-1 p-1.5 bg-white dark:bg-gray-800 rounded-full shadow-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700">
                          <Camera size={12} className="text-gray-600 dark:text-gray-400" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <div className="flex-1">
                        <label className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors">
                          <Upload size={14} />
                          Change Photo
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="hidden"
                          />
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">JPG, PNG up to 5MB</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Username & Pseudo - Side by Side */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Username</label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="username"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Display Name
                      <span className="text-gray-400 font-normal ml-1">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.pseudo}
                      onChange={(e) => setFormData({ ...formData, pseudo: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Display name"
                    />
                  </div>
                </div>

                {/* Location and Current Role */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      <MapPin size={12} className="inline-block mr-1" />
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="e.g., San Francisco, CA"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      <Briefcase size={12} className="inline-block mr-1" />
                      Current Role
                      <span className="text-gray-400 font-normal ml-1">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.occupation}
                      onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="e.g., Software Engineer"
                    />
                  </div>
                </div>

                {/* Bio - Compact */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    <FileText size={12} className="inline-block mr-1" />
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
                    placeholder="Tell us about yourself..."
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formData.bio.length}/500</p>
                </div>

                {/* Skills - Compact */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Skills <span className="text-gray-400 font-normal">(max 6)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.skills}
                    onChange={(e) => {
                      const value = e.target.value;
                      const skills = value.split(',').map(s => s.trim()).filter(s => s);
                      // Limit to 6 skills
                      if (skills.length <= 6 || value.endsWith(',')) {
                        setFormData({ ...formData, skills: value });
                      } else {
                        // Auto-truncate to 6 skills
                        const limitedSkills = skills.slice(0, 6).join(', ');
                        setFormData({ ...formData, skills: limitedSkills });
                      }
                    }}
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="React, TypeScript, Node.js (comma separated)"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formData.skills.split(',').filter(s => s.trim()).length}/6 skills - Separate multiple skills with commas
                  </p>
                </div>
              </>
            )}

            {/* Social Links Tab */}
            {activeTab === 'social' && (
              <div className="space-y-3">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Twitter size={16} />
                  </div>
                  <input
                    type="text"
                    value={formData.socialLinks.twitter}
                    onChange={(e) => setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, twitter: e.target.value }
                    })}
                    className="w-full pl-10 pr-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Twitter username"
                  />
                </div>

                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Linkedin size={16} />
                  </div>
                  <input
                    type="text"
                    value={formData.socialLinks.linkedin}
                    onChange={(e) => setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, linkedin: e.target.value }
                    })}
                    className="w-full pl-10 pr-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="LinkedIn profile URL"
                  />
                </div>

                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Send size={16} />
                  </div>
                  <input
                    type="text"
                    value={formData.socialLinks.telegram}
                    onChange={(e) => setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, telegram: e.target.value }
                    })}
                    className="w-full pl-10 pr-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Telegram username"
                  />
                </div>

                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Github size={16} />
                  </div>
                  <input
                    type="text"
                    value={formData.socialLinks.github}
                    onChange={(e) => setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, github: e.target.value }
                    })}
                    className="w-full pl-10 pr-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="GitHub username"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sticky Footer Actions */}
          <div className="sticky bottom-0 px-5 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-lg transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {uploadProgress || 'Saving...'}
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
