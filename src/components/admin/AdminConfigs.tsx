import { useState, useEffect, useRef } from 'react';
import { 
  Database, 
  Shield, 
  Mail, 
  Bell, 
  TrendingUp,
  Users,
  FileText,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Award,
  Building2,
  Calendar,
  Briefcase,
  Trophy,
  Settings,
  Plus,
  Minus,
  Edit,
  X,
  Check,
  MessageSquare,
  User,
  Upload
} from 'lucide-react';
import { GlassCard } from '../GlassCard';
import adminService from '../../services/api/admin.service';
import { Badge } from '../Badge';
import { UserAutocomplete } from './UserAutocomplete';
import { useToast } from '../Toast';

interface AppConfigs {
  // Security
  maxLoginAttempts: number;
  loginLockoutDuration: number; // minutes
  sessionTimeout: number; // minutes
  enable2FA: boolean;
  requireEmailVerification: boolean;
  
  // Rate Limiting
  rateLimitRequests: number;
  rateLimitWindow: number; // seconds
  apiRateLimitRequests: number;
  apiRateLimitWindow: number; // seconds
  
  // Quotas & Limits
  maxPostsPerUser: number;
  maxCommentsPerPost: number;
  maxFileSize: number; // MB
  maxPagesPerUser: number;
  maxTagsPerPost: number;
  
  // Email Settings
  emailFromName: string;
  emailFromAddress: string;
  emailProvider: string;
  
  // Notification Settings
  enableEmailNotifications: boolean;
  enablePushNotifications: boolean;
  enableInAppNotifications: boolean;
}

export function AdminConfigs() {
  const toast = useToast();
  const [configs, setConfigs] = useState<AppConfigs>({
    maxLoginAttempts: 5,
    loginLockoutDuration: 15,
    sessionTimeout: 60,
    enable2FA: false,
    requireEmailVerification: false,
    rateLimitRequests: 100,
    rateLimitWindow: 60,
    apiRateLimitRequests: 1000,
    apiRateLimitWindow: 60,
    maxPostsPerUser: 100,
    maxCommentsPerPost: 1000,
    maxFileSize: 10,
    maxPagesPerUser: 10,
    maxTagsPerPost: 10,
    emailFromName: 'Dev Community',
    emailFromAddress: 'noreply@devcommunity.com',
    emailProvider: 'smtp',
    enableEmailNotifications: true,
    enablePushNotifications: true,
    enableInAppNotifications: true,
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Reputation requirements
  const [reputationRequirements, setReputationRequirements] = useState<Record<string, number>>({
    post: 0,
    comment: 0,
    page: 0,
    event: 0,
    opportunity: 0,
    hackathon: 0,
    verification: 0, // Add verification minimum reputation
  });
  const [isLoadingReputation, setIsLoadingReputation] = useState(true);
  const [isSavingReputation, setIsSavingReputation] = useState(false);
  const [saveReputationSuccess, setSaveReputationSuccess] = useState(false);
  const [saveReputationError, setSaveReputationError] = useState<string | null>(null);
  const [editingContentType, setEditingContentType] = useState<string | null>(null);
  const [tempReputationValue, setTempReputationValue] = useState<number>(0);

  // Reputation rules
  const [reputationRules, setReputationRules] = useState<any[]>([]);
  const [isLoadingRules, setIsLoadingRules] = useState(true);
  const [editingRule, setEditingRule] = useState<string | null>(null);
  const [tempRuleData, setTempRuleData] = useState<{ points: number; description: string; isActive: boolean; preventDuplicate: boolean }>({
    points: 0,
    description: '',
    isActive: true,
    preventDuplicate: true,
  });

  // Manual reputation adjustment
  const [adjustUserId, setAdjustUserId] = useState<string>('');
  const [adjustSelectedUser, setAdjustSelectedUser] = useState<any>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<string>('');
  const [adjustComment, setAdjustComment] = useState<string>('');
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [adjustSuccess, setAdjustSuccess] = useState(false);

  // Email settings
  const [emailSettings, setEmailSettings] = useState<any>(null);
  const [isLoadingEmailSettings, setIsLoadingEmailSettings] = useState(true);
  const [isSavingEmailSettings, setIsSavingEmailSettings] = useState(false);
  const [emailSettingsSuccess, setEmailSettingsSuccess] = useState(false);
  const [emailSettingsError, setEmailSettingsError] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadConfigs();
    loadReputationRequirements();
    loadReputationRules();
    loadEmailSettings();
  }, []);

  const loadConfigs = async () => {
    try {
      setIsLoading(true);
      // Note: This endpoint might need to be created
      const data = await adminService.getAppSettings();
      if (data.configs) {
        setConfigs(data.configs);
      }
    } catch (error) {
      console.error('Failed to load configs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadReputationRequirements = async () => {
    try {
      setIsLoadingReputation(true);
      const data = await adminService.getReputationRequirements();
      if (data.requirements) {
        setReputationRequirements({
          post: 0,
          comment: 0,
          page: 0,
          event: 0,
          opportunity: 0,
          hackathon: 0,
          verification: 0,
          ...data.requirements,
        });
      }
    } catch (error) {
      console.error('Failed to load reputation requirements:', error);
    } finally {
      setIsLoadingReputation(false);
    }
  };

  const handleSaveReputationRequirement = async (contentType: string) => {
    try {
      setIsSavingReputation(true);
      setSaveReputationError(null);
      setSaveReputationSuccess(false);
      
      await adminService.updateReputationRequirement(contentType, tempReputationValue);
      
      setReputationRequirements({
        ...reputationRequirements,
        [contentType]: tempReputationValue,
      });
      
      setSaveReputationSuccess(true);
      setEditingContentType(null);
      setTimeout(() => setSaveReputationSuccess(false), 3000);
      toast.success(`${getContentTypeLabel(contentType)} reputation requirement saved successfully!`);
      
      // Reload requirements to get updated details
      await loadReputationRequirements();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to save reputation requirement';
      setSaveReputationError(errorMessage);
      setTimeout(() => setSaveReputationError(null), 5000);
      toast.error(errorMessage);
    } finally {
      setIsSavingReputation(false);
    }
  };

  const startEditing = (contentType: string, currentValue: number) => {
    setEditingContentType(contentType);
    setTempReputationValue(currentValue);
  };

  const cancelEditing = () => {
    setEditingContentType(null);
    setTempReputationValue(0);
  };

  const getContentTypeIcon = (contentType: string) => {
    switch (contentType) {
      case 'post':
        return <FileText size={18} className="text-indigo-500" />;
      case 'comment':
        return <MessageSquare size={18} className="text-teal-500" />;
      case 'page':
        return <Building2 size={18} className="text-purple-500" />;
      case 'event':
        return <Calendar size={18} className="text-blue-500" />;
      case 'opportunity':
        return <Briefcase size={18} className="text-green-500" />;
      case 'hackathon':
        return <Trophy size={18} className="text-yellow-500" />;
      case 'verification':
        return <Shield size={18} className="text-blue-500" />;
      default:
        return <Award size={18} />;
    }
  };

  const loadReputationRules = async () => {
    try {
      setIsLoadingRules(true);
      const data = await adminService.getReputationRules();
      if (data.rules) {
        setReputationRules(data.rules);
      }
    } catch (error) {
      console.error('Failed to load reputation rules:', error);
    } finally {
      setIsLoadingRules(false);
    }
  };

  const loadEmailSettings = async () => {
    try {
      setIsLoadingEmailSettings(true);
      const data = await adminService.getEmailSettings();
      if (data.settings) {
        setEmailSettings(data.settings);
        // Set logo preview if logo URL exists
        if (data.settings.siteLogoUrl) {
          setLogoPreview(data.settings.siteLogoUrl);
        }
      }
    } catch (error) {
      console.error('Failed to load email settings:', error);
      toast.error('Failed to load email settings');
    } finally {
      setIsLoadingEmailSettings(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    try {
      setIsUploadingLogo(true);
      setEmailSettingsError(null);

      // Upload logo using admin service
      const result = await adminService.uploadAsset('logo', file);

      if (result.url || result.logoUrl) {
        const logoUrl = result.url || result.logoUrl;
        setEmailSettings({ ...emailSettings, siteLogoUrl: logoUrl });
        setLogoPreview(logoUrl);
        toast.success('Logo uploaded successfully!');
      } else {
        throw new Error('No URL returned from upload');
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to upload logo';
      setEmailSettingsError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsUploadingLogo(false);
      // Reset file input
      if (logoFileInputRef.current) {
        logoFileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveLogo = () => {
    setEmailSettings({ ...emailSettings, siteLogoUrl: null });
    setLogoPreview(null);
    if (logoFileInputRef.current) {
      logoFileInputRef.current.value = '';
    }
  };

  const handleSocialIconUpload = async (platform: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file');
      return;
    }

    // Validate file size (max 2MB for icons)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB');
      return;
    }

    try {
      setIsUploadingLogo(true);
      setEmailSettingsError(null);

      // Upload icon using admin service
      const result = await adminService.uploadAsset('icon', file);

      if (result.url) {
        const iconKey = `emailFooterSocial${platform.charAt(0).toUpperCase() + platform.slice(1)}Icon` as keyof typeof emailSettings;
        setEmailSettings({ ...emailSettings, [iconKey]: result.url });
        toast.success(`${platform} icon uploaded successfully!`);
      } else {
        throw new Error('No URL returned from upload');
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || `Failed to upload ${platform} icon`;
      setEmailSettingsError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsUploadingLogo(false);
      // Reset file input
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const handleSaveEmailSettings = async () => {
    if (!emailSettings) return;
    
    try {
      setIsSavingEmailSettings(true);
      setEmailSettingsError(null);
      setEmailSettingsSuccess(false);
      
      await adminService.updateEmailSettings(emailSettings);
      
      setEmailSettingsSuccess(true);
      setTimeout(() => setEmailSettingsSuccess(false), 3000);
      toast.success('Email settings saved successfully!');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to save email settings';
      setEmailSettingsError(errorMessage);
      setTimeout(() => setEmailSettingsError(null), 5000);
      toast.error(errorMessage);
    } finally {
      setIsSavingEmailSettings(false);
    }
  };

  const startEditingRule = (rule: any) => {
    setEditingRule(rule.action);
    setTempRuleData({
      points: rule.points,
      description: rule.description || '',
      isActive: rule.isActive,
      preventDuplicate: rule.preventDuplicate,
    });
  };

  const cancelEditingRule = () => {
    setEditingRule(null);
    setTempRuleData({ points: 0, description: '', isActive: true, preventDuplicate: true });
  };

  const handleSaveRule = async (action: string) => {
    try {
      setIsSavingReputation(true);
      
      await adminService.updateReputationRule(action, {
        points: tempRuleData.points,
        description: tempRuleData.description,
        isActive: tempRuleData.isActive,
        preventDuplicate: tempRuleData.preventDuplicate,
      });
      
      setSaveReputationSuccess(true);
      setEditingRule(null);
      setTimeout(() => setSaveReputationSuccess(false), 3000);
      toast.success(`Reputation rule "${getActionLabel(action)}" saved successfully!`);
      
      await loadReputationRules();
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to save reputation rule';
      toast.error(errorMessage);
    } finally {
      setIsSavingReputation(false);
    }
  };

  const handleAdjustReputation = async () => {
    if (!adjustUserId || adjustAmount === 0) {
      toast.warning('Please select a user and enter an amount');
      return;
    }

    try {
      setIsAdjusting(true);
      
      await adminService.adjustUserReputation(adjustUserId, adjustAmount, adjustReason, adjustComment);
      
      setAdjustSuccess(true);
      setAdjustUserId('');
      setAdjustSelectedUser(null);
      setAdjustAmount(0);
      setAdjustReason('');
      setAdjustComment('');
      setTimeout(() => setAdjustSuccess(false), 5000);
      toast.success(`Reputation adjusted successfully! ${adjustSelectedUser?.username || 'User'} has been notified.`);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to adjust reputation';
      toast.error(errorMessage);
    } finally {
      setIsAdjusting(false);
    }
  };

  const getContentTypeLabel = (contentType: string) => {
    switch (contentType) {
      case 'post':
        return 'Post';
      case 'comment':
        return 'Comment';
      case 'page':
        return 'Page';
      case 'event':
        return 'Event';
      case 'opportunity':
        return 'Opportunity';
      case 'hackathon':
        return 'Hackathon';
      case 'verification':
        return 'Verification Request';
      default:
        return contentType;
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      await adminService.updateAppSettings(configs);
      
      toast.success('Configurations saved successfully!');
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to save configurations';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const getActionLabel = (action: string): string => {
    const labels: Record<string, string> = {
      post_created: 'Post Created',
      post_deleted: 'Post Deleted',
      post_upvoted: 'Post Upvoted',
      post_downvoted: 'Post Downvoted',
      post_featured: 'Post Featured',
      comment_created: 'Comment Created',
      comment_deleted: 'Comment Deleted',
      comment_upvoted: 'Comment Upvoted',
      comment_downvoted: 'Comment Downvoted',
      comment_replied: 'Comment Replied',
      emoji_received: 'Emoji Reaction Received',
      emoji_given: 'Emoji Given',
      follow_received: 'Follow Received',
      follow_given: 'Follow Given',
      share_received: 'Share Received',
      bookmark_received: 'Bookmark Received',
      achievement_unlocked: 'Achievement Unlocked',
      content_removed: 'Content Removed',
      content_restored: 'Content Restored',
      manual_adjustment: 'Manual Adjustment',
    };
    return labels[action] || action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Security Settings */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Shield size={22} className="text-purple-500" />
          <h3 className="text-xl font-bold">Security Settings</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Max Login Attempts</label>
            <input
              type="number"
              value={configs.maxLoginAttempts}
              onChange={(e) => setConfigs({ ...configs, maxLoginAttempts: Number(e.target.value) })}
              min="1"
              max="10"
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Login Lockout Duration (minutes)</label>
            <input
              type="number"
              value={configs.loginLockoutDuration}
              onChange={(e) => setConfigs({ ...configs, loginLockoutDuration: Number(e.target.value) })}
              min="1"
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Session Timeout (minutes)</label>
            <input
              type="number"
              value={configs.sessionTimeout}
              onChange={(e) => setConfigs({ ...configs, sessionTimeout: Number(e.target.value) })}
              min="5"
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="enable2FA"
              checked={configs.enable2FA}
              onChange={(e) => setConfigs({ ...configs, enable2FA: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300"
            />
            <label htmlFor="enable2FA" className="cursor-pointer">
              Enable Two-Factor Authentication
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="requireEmailVerification"
              checked={configs.requireEmailVerification}
              onChange={(e) => setConfigs({ ...configs, requireEmailVerification: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300"
            />
            <label htmlFor="requireEmailVerification" className="cursor-pointer">
              Require Email Verification
            </label>
          </div>
        </div>
      </GlassCard>

      {/* Rate Limiting */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp size={22} className="text-purple-500" />
          <h3 className="text-xl font-bold">Rate Limiting</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Web Rate Limit (requests per window)</label>
            <input
              type="number"
              value={configs.rateLimitRequests}
              onChange={(e) => setConfigs({ ...configs, rateLimitRequests: Number(e.target.value) })}
              min="1"
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Rate Limit Window (seconds)</label>
            <input
              type="number"
              value={configs.rateLimitWindow}
              onChange={(e) => setConfigs({ ...configs, rateLimitWindow: Number(e.target.value) })}
              min="1"
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">API Rate Limit (requests per window)</label>
            <input
              type="number"
              value={configs.apiRateLimitRequests}
              onChange={(e) => setConfigs({ ...configs, apiRateLimitRequests: Number(e.target.value) })}
              min="1"
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">API Rate Limit Window (seconds)</label>
            <input
              type="number"
              value={configs.apiRateLimitWindow}
              onChange={(e) => setConfigs({ ...configs, apiRateLimitWindow: Number(e.target.value) })}
              min="1"
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            />
          </div>
        </div>
      </GlassCard>

      {/* Quotas & Limits */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Database size={22} className="text-purple-500" />
          <h3 className="text-xl font-bold">Quotas & Limits</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <FileText size={16} />
              Max Posts Per User
            </label>
            <input
              type="number"
              value={configs.maxPostsPerUser}
              onChange={(e) => setConfigs({ ...configs, maxPostsPerUser: Number(e.target.value) })}
              min="1"
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Max Comments Per Post</label>
            <input
              type="number"
              value={configs.maxCommentsPerPost}
              onChange={(e) => setConfigs({ ...configs, maxCommentsPerPost: Number(e.target.value) })}
              min="1"
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Max File Size (MB)</label>
            <input
              type="number"
              value={configs.maxFileSize}
              onChange={(e) => setConfigs({ ...configs, maxFileSize: Number(e.target.value) })}
              min="1"
              max="100"
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <Users size={16} />
              Max Pages Per User
            </label>
            <input
              type="number"
              value={configs.maxPagesPerUser}
              onChange={(e) => setConfigs({ ...configs, maxPagesPerUser: Number(e.target.value) })}
              min="1"
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Max Tags Per Post</label>
            <input
              type="number"
              value={configs.maxTagsPerPost}
              onChange={(e) => setConfigs({ ...configs, maxTagsPerPost: Number(e.target.value) })}
              min="1"
              max="20"
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            />
          </div>
        </div>
      </GlassCard>

      {/* Email Settings */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Mail size={22} className="text-purple-500" />
          <h3 className="text-xl font-bold">Email Settings</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">From Name</label>
            <input
              type="text"
              value={configs.emailFromName}
              onChange={(e) => setConfigs({ ...configs, emailFromName: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">From Address</label>
            <input
              type="email"
              value={configs.emailFromAddress}
              onChange={(e) => setConfigs({ ...configs, emailFromAddress: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email Provider</label>
            <select
              value={configs.emailProvider}
              onChange={(e) => setConfigs({ ...configs, emailProvider: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            >
              <option value="smtp">SMTP</option>
              <option value="ses">Amazon SES</option>
              <option value="sendgrid">SendGrid</option>
              <option value="mailgun">Mailgun</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Notification Settings */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Bell size={22} className="text-purple-500" />
          <h3 className="text-xl font-bold">Notification Settings</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="enableEmailNotifications"
              checked={configs.enableEmailNotifications}
              onChange={(e) => setConfigs({ ...configs, enableEmailNotifications: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300"
            />
            <label htmlFor="enableEmailNotifications" className="cursor-pointer">
              Enable Email Notifications
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="enablePushNotifications"
              checked={configs.enablePushNotifications}
              onChange={(e) => setConfigs({ ...configs, enablePushNotifications: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300"
            />
            <label htmlFor="enablePushNotifications" className="cursor-pointer">
              Enable Push Notifications
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="enableInAppNotifications"
              checked={configs.enableInAppNotifications}
              onChange={(e) => setConfigs({ ...configs, enableInAppNotifications: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300"
            />
            <label htmlFor="enableInAppNotifications" className="cursor-pointer">
              Enable In-App Notifications
            </label>
          </div>
        </div>
      </GlassCard>

      {/* Reputation Requirements */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Award size={22} className="text-purple-500" />
          <h3 className="text-xl font-bold">Reputation Requirements</h3>
        </div>

        {isLoadingReputation ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(['post', 'comment', 'page', 'event', 'opportunity', 'hackathon', 'verification'] as const).map((contentType) => {
                const currentValue = reputationRequirements[contentType] || 0;
                const isEditing = editingContentType === contentType;
                
                return (
                  <div
                    key={contentType}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800/50"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getContentTypeIcon(contentType)}
                        <span className="font-semibold">{getContentTypeLabel(contentType)}</span>
                      </div>
                      {!isEditing && (
                        <button
                          onClick={() => startEditing(contentType, currentValue)}
                          className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
                        >
                          Edit
                        </button>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium mb-2">Required Reputation</label>
                          <input
                            type="number"
                            value={tempReputationValue}
                            onChange={(e) => setTempReputationValue(Number(e.target.value))}
                            min="0"
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                            placeholder="Enter reputation points"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveReputationRequirement(contentType)}
                            disabled={isSavingReputation}
                            className="flex-1 px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {isSavingReputation ? (
                              <>
                                <Loader2 size={14} className="animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save size={14} />
                                Save
                              </>
                            )}
                          </button>
                          <button
                            onClick={cancelEditing}
                            disabled={isSavingReputation}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {currentValue}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          reputation points required
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </GlassCard>

      {/* Reputation Rules Management */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Settings size={22} className="text-purple-500" />
          <h3 className="text-xl font-bold">Reputation Rules</h3>
        </div>

        {isLoadingRules ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
          </div>
        ) : (
          <div className="space-y-4">
            {saveReputationSuccess && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2 text-green-700 dark:text-green-300">
                <CheckCircle2 size={18} />
                <span className="text-sm font-medium">Reputation rule updated successfully!</span>
              </div>
            )}
            
            {saveReputationError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-300">
                <AlertCircle size={18} />
                <span className="text-sm font-medium">{saveReputationError}</span>
              </div>
            )}

            <div className="space-y-3">
              {reputationRules.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No reputation rules found. Rules will be created automatically when actions occur.
                </p>
              ) : (
                reputationRules.map((rule) => {
                  const isEditing = editingRule === rule.action;
                  
                  return (
                    <div
                      key={rule.id}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800/50"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${rule.isActive ? 'bg-green-100 dark:bg-green-900/20' : 'bg-gray-100 dark:bg-gray-800'}`}>
                            <Award size={18} className={rule.isActive ? 'text-green-600 dark:text-green-400' : 'text-gray-400'} />
                          </div>
                          <div>
                            <div className="font-semibold">{getActionLabel(rule.action)}</div>
                            {rule.description && (
                              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{rule.description}</div>
                            )}
                          </div>
                        </div>
                        {!isEditing && (
                          <button
                            onClick={() => startEditingRule(rule)}
                            className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium flex items-center gap-1"
                          >
                            <Edit size={14} />
                            Edit
                          </button>
                        )}
                      </div>

                      {isEditing ? (
                        <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Points</label>
                              <input
                                type="number"
                                value={tempRuleData.points}
                                onChange={(e) => setTempRuleData({ ...tempRuleData, points: Number(e.target.value) })}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                                placeholder="Enter points"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Description</label>
                              <input
                                type="text"
                                value={tempRuleData.description}
                                onChange={(e) => setTempRuleData({ ...tempRuleData, description: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                                placeholder="Optional description"
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={tempRuleData.isActive}
                                onChange={(e) => setTempRuleData({ ...tempRuleData, isActive: e.target.checked })}
                                className="w-4 h-4 rounded border-gray-300"
                              />
                              <span className="text-sm">Active</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={tempRuleData.preventDuplicate}
                                onChange={(e) => setTempRuleData({ ...tempRuleData, preventDuplicate: e.target.checked })}
                                className="w-4 h-4 rounded border-gray-300"
                              />
                              <span className="text-sm">Prevent Duplicate</span>
                            </label>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSaveRule(rule.action)}
                              disabled={isSavingReputation}
                              className="flex-1 px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                              {isSavingReputation ? (
                                <>
                                  <Loader2 size={14} className="animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <Check size={14} />
                                  Save
                                </>
                              )}
                            </button>
                            <button
                              onClick={cancelEditingRule}
                              disabled={isSavingReputation}
                              className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-4">
                            <div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">Points</div>
                              <div className={`text-xl font-bold ${rule.points >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                {rule.points > 0 ? '+' : ''}{rule.points}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Badge className={rule.isActive ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}>
                                {rule.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                              {rule.preventDuplicate && (
                                <Badge className="bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
                                  No Duplicates
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </GlassCard>

      {/* Manual Reputation Adjustment */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <User size={22} className="text-purple-500" />
          <h3 className="text-xl font-bold">Manual Reputation Adjustment</h3>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select User</label>
              <UserAutocomplete
                value={adjustUserId}
                onChange={(userId, user) => {
                  setAdjustUserId(userId);
                  setAdjustSelectedUser(user);
                }}
                placeholder="Search by username or email..."
                disabled={isAdjusting}
              />
              {adjustSelectedUser && (
                <div className="mt-2 p-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-purple-900 dark:text-purple-100">
                      Selected: {adjustSelectedUser.username}
                    </span>
                    {adjustSelectedUser.reputation !== undefined && (
                      <span className="text-purple-600 dark:text-purple-400">
                        • {adjustSelectedUser.reputation} reputation
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Amount</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setAdjustAmount(Math.max(-1000, adjustAmount - 10))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <Minus size={16} />
                </button>
                <input
                  type="number"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(Number(e.target.value))}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-center"
                  placeholder="0"
                />
                <button
                  onClick={() => setAdjustAmount(Math.min(1000, adjustAmount + 10))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {adjustAmount > 0 && <span className="text-green-600 dark:text-green-400">+{adjustAmount} reputation</span>}
                {adjustAmount < 0 && <span className="text-red-600 dark:text-red-400">{adjustAmount} reputation</span>}
                {adjustAmount === 0 && <span>No change</span>}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Reason (Optional)</label>
            <input
              type="text"
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              placeholder="e.g., Reward for contribution"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <MessageSquare size={16} />
              Comment (Optional - will be shown to user)
            </label>
            <textarea
              value={adjustComment}
              onChange={(e) => setAdjustComment(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              placeholder="This message will be sent to the user in a notification..."
              rows={3}
            />
          </div>

          <button
            onClick={handleAdjustReputation}
            disabled={isAdjusting || !adjustUserId || adjustAmount === 0}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all duration-300 font-medium shadow-lg shadow-purple-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isAdjusting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Adjusting...
              </>
            ) : (
              <>
                <Award size={18} />
                Adjust Reputation
                {adjustSelectedUser && adjustAmount !== 0 && adjustSelectedUser.reputation !== undefined && (
                  <span className="text-sm">
                    ({adjustAmount > 0 ? '+' : ''}{adjustAmount} → {adjustSelectedUser.reputation + adjustAmount})
                  </span>
                )}
              </>
            )}
          </button>
        </div>
      </GlassCard>

      {/* Email Settings */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Mail size={22} className="text-blue-500" />
          <h3 className="text-xl font-bold">Email Footer Settings</h3>
        </div>

        {isLoadingEmailSettings ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={24} className="animate-spin text-purple-500" />
          </div>
        ) : emailSettings ? (
          <div className="space-y-6">
            {emailSettingsSuccess && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2">
                <CheckCircle2 size={20} className="text-green-600 dark:text-green-400" />
                <span className="text-green-700 dark:text-green-300">Email settings saved successfully!</span>
              </div>
            )}

            {emailSettingsError && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
                <AlertCircle size={20} className="text-red-600 dark:text-red-400" />
                <span className="text-red-700 dark:text-red-300">{emailSettingsError}</span>
              </div>
            )}

            {/* Site Name & Logo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Site Name</label>
                <input
                  type="text"
                  value={emailSettings.siteName || ''}
                  onChange={(e) => setEmailSettings({ ...emailSettings, siteName: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                  placeholder="DevCommunity"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Site Logo</label>
                {logoPreview ? (
                  <div className="relative">
                    <div className="w-full h-32 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                      <img
                        src={logoPreview}
                        alt="Site Logo"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => logoFileInputRef.current?.click()}
                        disabled={isUploadingLogo}
                        className="flex-1 px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isUploadingLogo ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload size={16} />
                            Replace Logo
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        disabled={isUploadingLogo}
                        className="px-4 py-2 text-sm bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/40 text-red-700 dark:text-red-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <X size={16} />
                        Remove
                      </button>
                    </div>
                    <input
                      ref={logoFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div
                    onClick={() => logoFileInputRef.current?.click()}
                    className="w-full h-32 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 bg-gray-50 dark:bg-gray-800/50 cursor-pointer transition-colors flex flex-col items-center justify-center gap-2"
                  >
                    {isUploadingLogo ? (
                      <>
                        <Loader2 size={24} className="animate-spin text-blue-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={24} className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Click to upload logo</span>
                        <span className="text-xs text-gray-500 dark:text-gray-500">PNG, JPG, WEBP up to 10MB</span>
                      </>
                    )}
                    <input
                      ref={logoFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h4 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Social Media Links & Icons</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'twitter', label: 'Twitter', placeholder: 'https://twitter.com/devcommunity', iconKey: 'emailFooterSocialTwitter', iconUrlKey: 'emailFooterSocialTwitterIcon' },
                  { key: 'github', label: 'GitHub', placeholder: 'https://github.com/devcommunity', iconKey: 'emailFooterSocialGithub', iconUrlKey: 'emailFooterSocialGithubIcon' },
                  { key: 'discord', label: 'Discord', placeholder: 'https://discord.gg/devcommunity', iconKey: 'emailFooterSocialDiscord', iconUrlKey: 'emailFooterSocialDiscordIcon' },
                  { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/company/devcommunity', iconKey: 'emailFooterSocialLinkedin', iconUrlKey: 'emailFooterSocialLinkedinIcon' },
                  { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/devcommunity', iconKey: 'emailFooterSocialFacebook', iconUrlKey: 'emailFooterSocialFacebookIcon' },
                  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/devcommunity', iconKey: 'emailFooterSocialInstagram', iconUrlKey: 'emailFooterSocialInstagramIcon' },
                  { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@devcommunity', iconKey: 'emailFooterSocialYoutube', iconUrlKey: 'emailFooterSocialYoutubeIcon' },
                ].map(({ key, label, placeholder, iconKey, iconUrlKey }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium mb-2">{label}</label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={emailSettings[iconKey as keyof typeof emailSettings] || ''}
                        onChange={(e) => setEmailSettings({ ...emailSettings, [iconKey]: e.target.value })}
                        className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                        placeholder={placeholder}
                      />
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleSocialIconUpload(key, e)}
                          className="hidden"
                          id={`social-icon-${key}`}
                          disabled={isUploadingLogo}
                        />
                        <label
                          htmlFor={`social-icon-${key}`}
                          className={`inline-flex items-center px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${isUploadingLogo ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title="Upload icon"
                        >
                          <Upload size={16} />
                        </label>
                      </div>
                    </div>
                    {(emailSettings[iconUrlKey as keyof typeof emailSettings] as string) && (
                      <div className="mt-2 flex items-center gap-2">
                        <img
                          src={emailSettings[iconUrlKey as keyof typeof emailSettings] as string}
                          alt={`${label} icon`}
                          className="w-6 h-6 object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <span className="text-xs text-gray-500 dark:text-gray-400">Icon uploaded</span>
                        <button
                          type="button"
                          onClick={() => setEmailSettings({ ...emailSettings, [iconUrlKey]: null })}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Upload custom icons for each social media platform. Icons should be square (recommended: 64x64px or 128x128px).</p>
            </div>

            {/* Footer Text */}
            <div>
              <h4 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Footer Text</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Copyright Text</label>
                  <input
                    type="text"
                    value={emailSettings.emailFooterCopyright || ''}
                    onChange={(e) => setEmailSettings({ ...emailSettings, emailFooterCopyright: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                    placeholder="© 2025 DevCommunity. All rights reserved."
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Note: Year will be automatically updated</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Made With Text</label>
                  <input
                    type="text"
                    value={emailSettings.emailFooterMadeWithText || ''}
                    onChange={(e) => setEmailSettings({ ...emailSettings, emailFooterMadeWithText: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                    placeholder="by developers"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Text to display after "Made with ♥"</p>
                </div>
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailSettings.emailFooterShowVersion === 'true' || emailSettings.emailFooterShowVersion === true}
                      onChange={(e) => setEmailSettings({ ...emailSettings, emailFooterShowVersion: e.target.checked ? 'true' : 'false' })}
                      className="w-4 h-4 rounded border-gray-300 dark:border-gray-600"
                    />
                    <span className="text-sm font-medium">Show Version Information</span>
                  </label>
                  <p className="mt-1 ml-6 text-xs text-gray-500 dark:text-gray-400">Display version from git tag/commit in footer</p>
                </div>
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Footer Links</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Unsubscribe URL</label>
                  <input
                    type="url"
                    value={emailSettings.emailUnsubscribeUrl || ''}
                    onChange={(e) => setEmailSettings({ ...emailSettings, emailUnsubscribeUrl: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                    placeholder="/settings/email-preferences"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email Preferences URL</label>
                  <input
                    type="url"
                    value={emailSettings.emailSettingsUrl || ''}
                    onChange={(e) => setEmailSettings({ ...emailSettings, emailSettingsUrl: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                    placeholder="/settings/email-preferences"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Privacy Policy URL</label>
                  <input
                    type="url"
                    value={emailSettings.emailPrivacyUrl || ''}
                    onChange={(e) => setEmailSettings({ ...emailSettings, emailPrivacyUrl: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                    placeholder="/privacy-policy"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleSaveEmailSettings}
                disabled={isSavingEmailSettings}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg transition-all duration-300 font-medium shadow-lg shadow-blue-500/30 disabled:opacity-50 flex items-center gap-2"
              >
                {isSavingEmailSettings ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Email Settings
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Failed to load email settings
          </div>
        )}
      </GlassCard>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all duration-300 font-medium shadow-lg shadow-purple-500/30 disabled:opacity-50 flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={18} />
              Save All Configurations
            </>
          )}
        </button>
      </div>
    </div>
  );
}

