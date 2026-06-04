import { useState, useEffect, useRef } from 'react';
import { X, Upload, Camera, Twitter, Linkedin, Send, Github, Loader2, User, MapPin, Briefcase, FileText, Link as LinkIcon, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { TabPills } from './TabPills';
import { Avatar } from './Avatar';
import usersService from '../services/api/users.service';
import onboardingService from '../services/api/onboarding.service';
import authService from '../services/api/auth.service';
import { BIO_MAX_LENGTH } from '../constants/bio';

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
  
  // Username validation state
  const [usernameValidation, setUsernameValidation] = useState<{
    isValid: boolean;
    isAvailable: boolean | null;
    message: string;
    checking: boolean;
  }>({
    isValid: true,
    isAvailable: null,
    message: '',
    checking: false,
  });
  const usernameCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      // Reset username validation
      setUsernameValidation({
        isValid: true,
        isAvailable: null,
        message: '',
        checking: false,
      });
    }
  }, [isOpen, user]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (usernameCheckTimeoutRef.current) {
        clearTimeout(usernameCheckTimeoutRef.current);
      }
    };
  }, []);

  // Username validation function
  const validateUsername = (value: string): boolean => {
    if (!value || value.length < 3) {
      setUsernameValidation({
        isValid: false,
        isAvailable: null,
        message: 'Username must be at least 3 characters',
        checking: false,
      });
      return false;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      setUsernameValidation({
        isValid: false,
        isAvailable: null,
        message: 'Username can only contain letters, numbers, and underscores',
        checking: false,
      });
      return false;
    }

    if (value.length > 30) {
      setUsernameValidation({
        isValid: false,
        isAvailable: null,
        message: 'Username must be 30 characters or less',
        checking: false,
      });
      return false;
    }

    // Check for reserved usernames
    const reservedUsernames = [
      'devcommunity', 'updev', 'admin', 'administrator', 'moderator', 'mod',
      'root', 'system', 'support', 'help', 'info', 'contact', 'api', 'www',
      'mail', 'email', 'test', 'testing', 'demo', 'guest', 'user', 'users',
      'staff', 'team', 'official', 'null', 'undefined', 'true', 'false',
      'delete', 'remove', 'update', 'create', 'edit', 'save', 'new', 'old',
      'me', 'you', 'about', 'privacy', 'terms', 'tos', 'policy', 'settings',
      'account', 'profile', 'home', 'index', 'login', 'logout', 'signup',
      'signin', 'register', 'password', 'reset', 'verify', 'verification',
      'oauth', 'auth', 'authenticate', 'session', 'token', 'search', 'explore',
      'discover', 'feed', 'trending', 'popular', 'latest', 'following',
      'followers', 'notifications', 'messages', 'inbox', 'preferences',
      'email-preferences', 'reputation', 'achievements', 'badges', 'reports',
      'report', 'flag', 'spam', 'abuse', 'content', 'post', 'posts', 'comment',
      'comments', 'reply', 'replies', 'vote', 'votes', 'bookmark', 'bookmarks',
      'share', 'shares', 'page', 'pages', 'hackathon', 'hackathons', 'event',
      'events', 'opportunity', 'opportunities', 'tag', 'tags', 'category',
      'categories', 'admin-panel', 'adminpanel', 'dashboard', 'panel', 'control',
      'management', 'manage', 'backend', 'frontend', 'server', 'client',
      'service', 'services', 'app', 'application', 'web', 'site', 'website',
      'blog', 'forum', 'community', 'communities', 'network', 'social', 'media',
      'platform', 'platforms', 'beta', 'alpha', 'dev', 'development', 'staging',
      'production', 'prod', 'qa', 'quality', 'assurance', 'security', 'secure',
      'private', 'public', 'internal', 'external', 'docs', 'documentation',
      'wiki', 'faq', 'team', 'jobs', 'careers', 'hiring', 'recruit',
      'recruitment', 'partners', 'partnership', 'sponsors', 'sponsorship',
      'advertise', 'advertising', 'ads', 'advertisement', 'promote', 'promotion',
      'marketing', 'media-kit', 'press', 'news', 'updates', 'changelog',
      'release', 'releases', 'version', 'versions', 'download', 'downloads',
      'install', 'installation', 'setup', 'configure', 'configuration', 'config',
      'options', 'tools'
    ];

    const isReserved = reservedUsernames.some(reserved => 
      reserved.toLowerCase() === value.toLowerCase()
    );

    if (isReserved) {
      setUsernameValidation({
        isValid: false,
        isAvailable: null,
        message: 'This username is reserved and cannot be used',
        checking: false,
      });
      return false;
    }

    return true;
  };

  // Check username availability
  const checkUsernameAvailability = async (username: string) => {
    // Don't check if username hasn't changed
    if (username === user.username) {
      setUsernameValidation({
        isValid: true,
        isAvailable: true,
        message: '',
        checking: false,
      });
      return;
    }

    // Clear previous timeout
    if (usernameCheckTimeoutRef.current) {
      clearTimeout(usernameCheckTimeoutRef.current);
    }

    // Validate format first
    if (!validateUsername(username)) {
      return;
    }

    // Set checking state
    setUsernameValidation({
      isValid: true,
      isAvailable: null,
      message: 'Checking availability...',
      checking: true,
    });

    // Debounce API call
    usernameCheckTimeoutRef.current = setTimeout(async () => {
      try {
        const result = await authService.checkUsername(username);
        setUsernameValidation({
          isValid: true,
          isAvailable: result.available,
          message: result.message,
          checking: false,
        });
      } catch (error: any) {
        setUsernameValidation({
          isValid: false,
          isAvailable: false,
          message: error.response?.data?.message || 'Error checking username availability',
          checking: false,
        });
      }
    }, 500); // 500ms debounce
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUsername = e.target.value.trim();
    setFormData({ ...formData, username: newUsername });
    
    // Check availability in real-time
    if (newUsername) {
      checkUsernameAvailability(newUsername);
    } else {
      setUsernameValidation({
        isValid: false,
        isAvailable: null,
        message: 'Username is required',
        checking: false,
      });
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }
      
      setAvatarFile(file);
      
      // Create preview immediately
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPreviewAvatar(event.target.result as string);
        }
      };
      reader.onerror = () => {
        console.error('Error reading file');
        alert('Failed to load image preview');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }
      
      setCoverFile(file);
      
      // Create preview immediately
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPreviewCover(event.target.result as string);
        }
      };
      reader.onerror = () => {
        console.error('Error reading file');
        alert('Failed to load image preview');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate username before submitting
    const trimmedUsername = formData.username.trim();
    if (!trimmedUsername || !usernameValidation.isValid || (usernameValidation.isAvailable === false && trimmedUsername !== user.username)) {
      alert('Please fix username errors before submitting');
      return;
    }
    
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
      
      const response = await onboardingService.updateProfile({
        username: trimmedUsername,
        pseudo: formData.pseudo,
        bio: formData.bio.slice(0, BIO_MAX_LENGTH),
        skills: skillsArray,
        location: formData.location,
        occupation: formData.occupation,
        socialLinks: formData.socialLinks,
      } as any); // Type assertion needed - API accepts more fields than service interface
      
      // Use the updated user data from the API response
      const updatedUserData = (response as any)?.user || response || {};
      
      onSave({
        username: updatedUserData.username || trimmedUsername, // Use new username from API
        pseudo: updatedUserData.pseudo || formData.pseudo,
        avatar: avatarUrl,
        avatarUrl: avatarUrl,
        coverImage: coverUrl,
        coverImageUrl: coverUrl,
        skills: updatedUserData.skills || skillsArray,
        socialLinks: updatedUserData.socialLinks || formData.socialLinks,
        bio: updatedUserData.bio || formData.bio,
        location: updatedUserData.location || formData.location,
        occupation: updatedUserData.occupation || formData.occupation,
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={onClose}></div>

      <div className="relative w-full max-w-xl max-h-[88vh] bg-white dark:bg-gray-900 rounded-xl shadow-2xl flex flex-col overflow-hidden border border-gray-200/50 dark:border-gray-800/50">
        {/* Compact Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50/50 to-white dark:from-gray-800/50 dark:to-gray-900">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <User size={16} className="text-blue-500" />
            Edit Profile
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X size={18} className="text-gray-400 dark:text-gray-500" />
          </button>
        </div>

        <div className="border-b border-zinc-200/80 bg-white px-3 py-2 dark:border-white/10 dark:bg-gray-900">
          <TabPills
            ariaLabel="Edit profile sections"
            activeTab={activeTab}
            onChange={setActiveTab}
            scrollable={false}
            variant="stretch"
            tabs={[
              { id: 'basic', label: 'Basic', icon: User },
              { id: 'social', label: 'Social', icon: LinkIcon },
            ]}
          />
        </div>

        {/* Scrollable Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-3">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <>
                {/* Cover & Avatar - Ultra Compact */}
                <div className="space-y-2.5">
                  {/* Cover Image */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Cover Image</label>
                    <div className="relative h-20 rounded-lg overflow-hidden bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 group cursor-pointer">
                      {previewCover ? (
                        <img src={previewCover} alt="Cover preview" className="w-full h-full object-cover" />
                      ) : null}
                      <label className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 cursor-pointer transition-all">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Camera size={16} className="text-white" />
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCoverChange}
                          className="hidden"
                        />
                      </label>
                      {previewCover && (
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewCover('');
                            setCoverFile(null);
                            setFormData({ ...formData, coverImage: '' });
                          }}
                          className="absolute top-1.5 right-1.5 p-1 bg-black/50 hover:bg-black/70 rounded text-white transition-all"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Avatar */}
                  <div className="flex items-center gap-2.5">
                    <div className="relative flex-shrink-0">
                      <Avatar
                        src={previewAvatar}
                        alt={formData.username}
                        size="md"
                        className="w-14 h-14 ring-2 ring-white dark:ring-gray-800"
                      />
                      <label className="absolute -bottom-0.5 -right-0.5 p-1 bg-white dark:bg-gray-800 rounded-full shadow-md cursor-pointer hover:scale-110 transition-transform border border-gray-200 dark:border-gray-700">
                        <Camera size={10} className="text-gray-600 dark:text-gray-400" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md cursor-pointer transition-colors border border-gray-200 dark:border-gray-700">
                        <Upload size={12} />
                        Change
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">Max 5MB</p>
                    </div>
                  </div>
                </div>

                {/* Username & Pseudo */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                      Username
                      {usernameValidation.checking && (
                        <Loader size={10} className="animate-spin text-blue-500" />
                      )}
                      {usernameValidation.isAvailable === true && !usernameValidation.checking && (
                        <CheckCircle size={10} className="text-green-500" />
                      )}
                      {usernameValidation.isAvailable === false && !usernameValidation.checking && (
                        <AlertCircle size={10} className="text-red-500" />
                      )}
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={handleUsernameChange}
                      className={`w-full px-2.5 py-1.5 text-sm bg-gray-50 dark:bg-gray-800/50 border rounded-md focus:outline-none focus:ring-1 transition-all ${
                        usernameValidation.isAvailable === false || !usernameValidation.isValid
                          ? 'border-red-300 dark:border-red-700/50 focus:ring-red-400 focus:border-red-400'
                          : usernameValidation.isAvailable === true
                          ? 'border-green-300 dark:border-green-700/50 focus:ring-green-400 focus:border-green-400'
                          : 'border-gray-200 dark:border-gray-700 focus:ring-blue-400 focus:border-blue-400'
                      }`}
                      placeholder="username"
                      required
                    />
                    {usernameValidation.message && (
                      <p className={`text-[10px] mt-0.5 ${
                        usernameValidation.isAvailable === false || !usernameValidation.isValid
                          ? 'text-red-500 dark:text-red-400'
                          : usernameValidation.isAvailable === true
                          ? 'text-green-500 dark:text-green-400'
                          : 'text-gray-400 dark:text-gray-500'
                      }`}>
                        {usernameValidation.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Display Name
                      <span className="text-gray-400 font-normal ml-1">(opt)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.pseudo}
                      onChange={(e) => setFormData({ ...formData, pseudo: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-sm bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all"
                      placeholder="Display name"
                    />
                  </div>
                </div>

                {/* Location and Role */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                      <MapPin size={11} />
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-sm bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all"
                      placeholder="City, Country"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                      <Briefcase size={11} />
                      Role
                      <span className="text-gray-400 font-normal">(opt)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.occupation}
                      onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-sm bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all"
                      placeholder="Job title"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                    <FileText size={11} />
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value.slice(0, BIO_MAX_LENGTH) })}
                    rows={4}
                    maxLength={BIO_MAX_LENGTH}
                    className="w-full px-2.5 py-1.5 text-sm bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 resize-none transition-all"
                    placeholder="Tell us about yourself… Links, @users, and #tags are supported."
                  />
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 flex justify-between gap-2">
                    <span>Use @username, #tag, or paste a link</span>
                    <span>{formData.bio.length}/{BIO_MAX_LENGTH}</span>
                  </p>
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
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
                    className="w-full px-2.5 py-1.5 text-sm bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all"
                    placeholder="React, TypeScript, Node.js"
                  />
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                    {formData.skills.split(',').filter(s => s.trim()).length}/6 skills
                  </p>
                </div>
              </>
            )}

            {/* Social Links Tab */}
            {activeTab === 'social' && (
              <div className="space-y-2.5">
                <div className="relative">
                  <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                    <Twitter size={14} />
                  </div>
                  <input
                    type="text"
                    value={formData.socialLinks.twitter}
                    onChange={(e) => setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, twitter: e.target.value }
                    })}
                    className="w-full pl-9 pr-2.5 py-1.5 text-sm bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all"
                    placeholder="@username"
                  />
                </div>

                <div className="relative">
                  <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                    <Linkedin size={14} />
                  </div>
                  <input
                    type="text"
                    value={formData.socialLinks.linkedin}
                    onChange={(e) => setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, linkedin: e.target.value }
                    })}
                    className="w-full pl-9 pr-2.5 py-1.5 text-sm bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all"
                    placeholder="linkedin.com/in/username"
                  />
                </div>

                <div className="relative">
                  <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                    <Send size={14} />
                  </div>
                  <input
                    type="text"
                    value={formData.socialLinks.telegram}
                    onChange={(e) => setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, telegram: e.target.value }
                    })}
                    className="w-full pl-9 pr-2.5 py-1.5 text-sm bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all"
                    placeholder="@username"
                  />
                </div>

                <div className="relative">
                  <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                    <Github size={14} />
                  </div>
                  <input
                    type="text"
                    value={formData.socialLinks.github}
                    onChange={(e) => setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, github: e.target.value }
                    })}
                    className="w-full pl-9 pr-2.5 py-1.5 text-sm bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all"
                    placeholder="username"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Compact Footer Actions */}
          <div className="sticky bottom-0 px-4 py-3 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="flex-1 px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200 dark:border-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || usernameValidation.checking || (usernameValidation.isAvailable === false && formData.username.trim() !== user.username) || !usernameValidation.isValid}
              className="flex-1 px-3 py-2 text-xs font-medium text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-md transition-all shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              {uploading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span className="text-[10px]">{uploadProgress || 'Saving...'}</span>
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
