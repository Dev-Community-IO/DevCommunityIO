import { useState, useEffect } from 'react';
import { 
  Shield, 
  Save, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  Info,
  ToggleLeft,
  ToggleRight,
  Sliders,
  FileText,
  Activity
} from 'lucide-react';
import { GlassCard } from '../GlassCard';
import adminService from '../../services/api/admin.service';
import { useToast } from '../Toast';
import { Avatar } from '../Avatar';
import { Badge } from '../Badge';

interface AutoModerationSettings {
  enabled: boolean;
  crossUserThreshold: number;
  sameUserThreshold: number;
  spamScoreThreshold: number;
  botConfidenceThreshold: number;
  languageMismatchEnabled: boolean;
  enforceOnCrossUser: boolean;
  enforceOnSameUser: boolean;
  enforceOnSpam: boolean;
  enforceOnBot: boolean;
  reputationPenalty: number;
  checkPosts: boolean;
  checkComments: boolean;
  checkHackathons: boolean;
  checkEvents: boolean;
  checkOpportunities: boolean;
  similarityWindowDays: number;
  crossUserWindowDays: number;
}

type SubTab = 'settings' | 'content';

export function AdminAutoModeration() {
  const toast = useToast();
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('settings');
  const [settings, setSettings] = useState<AutoModerationSettings>({
    enabled: true,
    crossUserThreshold: 85,
    sameUserThreshold: 80,
    spamScoreThreshold: 50,
    botConfidenceThreshold: 50,
    languageMismatchEnabled: true,
    enforceOnCrossUser: true,
    enforceOnSameUser: true,
    enforceOnSpam: true,
    enforceOnBot: true,
    reputationPenalty: -100,
    checkPosts: true,
    checkComments: true,
    checkHackathons: true,
    checkEvents: true,
    checkOpportunities: true,
    similarityWindowDays: 1,
    crossUserWindowDays: 7,
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const response = await adminService.getAutoModerationSettings();
      if (response.data?.settings) {
        setSettings(response.data.settings);
      }
    } catch (error: any) {
      console.error('Error loading auto-moderation settings:', error);
      
      // Check if it's a network error (backend not running)
      if (error?.isNetworkError || error?.message?.includes('Network Error') || error?.code === 'ERR_CONNECTION_REFUSED') {
        const apiPort = import.meta.env.VITE_API_PORT || '3333';
        toast.error(`Cannot connect to backend server. Please ensure the API server is running on port ${apiPort}.`);
      } else {
        toast.error(error?.response?.data?.message || 'Failed to load auto-moderation settings');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setSaveSuccess(false);
      await adminService.updateAutoModerationSettings(settings);
      setSaveSuccess(true);
      toast.success('Auto-moderation settings saved successfully');
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error: any) {
      console.error('Error saving auto-moderation settings:', error);
      toast.error(error?.response?.data?.message || 'Failed to save auto-moderation settings');
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = <K extends keyof AutoModerationSettings>(
    key: K,
    value: AutoModerationSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const ToggleSwitch = ({ 
    label, 
    value, 
    onChange, 
    description 
  }: { 
    label: string; 
    value: boolean; 
    onChange: (value: boolean) => void;
    description?: string;
  }) => (
    <div className="flex items-start justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <label className="font-medium text-gray-900 dark:text-gray-100">{label}</label>
        </div>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          value ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            value ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  const NumberInput = ({ 
    label, 
    value, 
    onChange, 
    min, 
    max, 
    step,
    description 
  }: { 
    label: string; 
    value: number; 
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    description?: string;
  }) => (
    <div className="py-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
      <div className="flex items-center justify-between mb-2">
        <label className="font-medium text-gray-900 dark:text-gray-100">{label}</label>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          min={min}
          max={max}
          step={step || 1}
          className="w-24 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Shield className="w-6 h-6 text-purple-500" />
            Auto Moderation
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configure automatic spam detection and moderation parameters
          </p>
        </div>
        {activeSubTab === 'settings' && (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30 hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Settings</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveSubTab('settings')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeSubTab === 'settings'
              ? 'border-purple-500 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4" />
            Settings
          </div>
        </button>
        <button
          onClick={() => setActiveSubTab('content')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeSubTab === 'content'
              ? 'border-purple-500 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Auto Moderation Content
          </div>
        </button>
      </div>

      {activeSubTab === 'content' ? (
        <AutoModerationContent />
      ) : (
        <>

      {/* General Settings */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sliders className="w-5 h-5 text-purple-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">General Settings</h3>
        </div>
        <ToggleSwitch
          label="Enable Auto-Moderation"
          value={settings.enabled}
          onChange={(value) => updateSetting('enabled', value)}
          description="Master switch to enable/disable all auto-moderation features"
        />
      </GlassCard>

      {/* Similarity Detection */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="w-5 h-5 text-purple-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Similarity Detection</h3>
        </div>
        <NumberInput
          label="Cross-User Similarity Threshold (%)"
          value={settings.crossUserThreshold}
          onChange={(value) => updateSetting('crossUserThreshold', value)}
          min={0}
          max={100}
          step={1}
          description="Content similarity percentage threshold for detecting spam across different users (default: 85%)"
        />
        <NumberInput
          label="Same-User Similarity Threshold (%)"
          value={settings.sameUserThreshold}
          onChange={(value) => updateSetting('sameUserThreshold', value)}
          min={0}
          max={100}
          step={1}
          description="Content similarity percentage threshold for detecting duplicate content from same user (default: 80%)"
        />
        <NumberInput
          label="Similarity Window (Days)"
          value={settings.similarityWindowDays}
          onChange={(value) => updateSetting('similarityWindowDays', value)}
          min={1}
          max={30}
          step={1}
          description="Time window in days to check for similar content from same user (default: 1 day)"
        />
        <NumberInput
          label="Cross-User Window (Days)"
          value={settings.crossUserWindowDays}
          onChange={(value) => updateSetting('crossUserWindowDays', value)}
          min={1}
          max={30}
          step={1}
          description="Time window in days to check for similar content across all users (default: 7 days)"
        />
      </GlassCard>

      {/* Spam Detection */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-purple-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Spam Detection</h3>
        </div>
        <NumberInput
          label="Spam Score Threshold"
          value={settings.spamScoreThreshold}
          onChange={(value) => updateSetting('spamScoreThreshold', value)}
          min={0}
          max={100}
          step={5}
          description="Minimum spam score (0-100) to trigger spam detection (default: 50)"
        />
        <ToggleSwitch
          label="Language Mismatch Detection"
          value={settings.languageMismatchEnabled}
          onChange={(value) => updateSetting('languageMismatchEnabled', value)}
          description="Detect and flag content in unexpected languages (e.g., Hindi on English/French platform)"
        />
      </GlassCard>

      {/* Bot Detection */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-5 h-5 text-purple-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Bot Detection</h3>
        </div>
        <NumberInput
          label="Bot Confidence Threshold (%)"
          value={settings.botConfidenceThreshold}
          onChange={(value) => updateSetting('botConfidenceThreshold', value)}
          min={0}
          max={100}
          step={5}
          description="Minimum confidence percentage (0-100) to classify behavior as bot (default: 50%)"
        />
      </GlassCard>

      {/* Enforcement Settings */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <ToggleRight className="w-5 h-5 text-purple-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Enforcement Actions</h3>
        </div>
        <ToggleSwitch
          label="Enforce on Cross-User Similarity"
          value={settings.enforceOnCrossUser}
          onChange={(value) => updateSetting('enforceOnCrossUser', value)}
          description="Automatically ban/deactivate users when cross-user similarity is detected"
        />
        <ToggleSwitch
          label="Enforce on Same-User Similarity"
          value={settings.enforceOnSameUser}
          onChange={(value) => updateSetting('enforceOnSameUser', value)}
          description="Automatically ban/deactivate users when same-user similarity is detected"
        />
        <ToggleSwitch
          label="Enforce on Spam Detection"
          value={settings.enforceOnSpam}
          onChange={(value) => updateSetting('enforceOnSpam', value)}
          description="Automatically ban/deactivate users when spam patterns are detected"
        />
        <ToggleSwitch
          label="Enforce on Bot Detection"
          value={settings.enforceOnBot}
          onChange={(value) => updateSetting('enforceOnBot', value)}
          description="Automatically ban/deactivate users when bot behavior is detected"
        />
        <NumberInput
          label="Reputation Penalty"
          value={settings.reputationPenalty}
          onChange={(value) => updateSetting('reputationPenalty', value)}
          min={-1000}
          max={0}
          step={10}
          description="Reputation points to deduct when enforcement action is taken (default: -100)"
        />
      </GlassCard>

      {/* Content Type Checks */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <ToggleLeft className="w-5 h-5 text-purple-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Content Type Checks</h3>
        </div>
        <ToggleSwitch
          label="Check Posts"
          value={settings.checkPosts}
          onChange={(value) => updateSetting('checkPosts', value)}
          description="Enable auto-moderation checks for post creation"
        />
        <ToggleSwitch
          label="Check Comments"
          value={settings.checkComments}
          onChange={(value) => updateSetting('checkComments', value)}
          description="Enable auto-moderation checks for comment creation"
        />
        <ToggleSwitch
          label="Check Hackathons"
          value={settings.checkHackathons}
          onChange={(value) => updateSetting('checkHackathons', value)}
          description="Enable auto-moderation checks for hackathon creation"
        />
        <ToggleSwitch
          label="Check Events"
          value={settings.checkEvents}
          onChange={(value) => updateSetting('checkEvents', value)}
          description="Enable auto-moderation checks for event creation"
        />
        <ToggleSwitch
          label="Check Opportunities"
          value={settings.checkOpportunities}
          onChange={(value) => updateSetting('checkOpportunities', value)}
          description="Enable auto-moderation checks for opportunity creation"
        />
      </GlassCard>
        </>
      )}
    </div>
  );
}

// Auto Moderation Content Component
function AutoModerationContent() {
  const toast = useToast();
  const [activeLogTab, setActiveLogTab] = useState<'detection' | 'activity'>('detection');
  const [detectionLogs, setDetectionLogs] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Filters
  const [searchUserId, setSearchUserId] = useState('');
  const [searchIpAddress, setSearchIpAddress] = useState('');
  const [filterContentType, setFilterContentType] = useState<string>('all');
  const [filterDetectionType, setFilterDetectionType] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    loadLogs();
  }, [activeLogTab, page, filterContentType, filterDetectionType, dateFrom, dateTo, searchUserId, searchIpAddress]);

  const loadLogs = async () => {
    try {
      setIsLoading(true);
      if (activeLogTab === 'detection') {
        const params: any = {
          page,
          limit: 50,
        };
        if (searchUserId) params.userId = searchUserId;
        if (filterContentType !== 'all') params.contentType = filterContentType;
        if (filterDetectionType !== 'all') params.detectionType = filterDetectionType;
        if (dateFrom) params.dateFrom = dateFrom;
        if (dateTo) params.dateTo = dateTo;

        const response = await adminService.getSpamDetectionLogs(params);
        if (page === 1) {
          setDetectionLogs(response.data || []);
        } else {
          setDetectionLogs(prev => [...prev, ...(response.data || [])]);
        }
        setHasMore(response.meta?.currentPage < response.meta?.lastPage);
      } else {
        const params: any = {
          page,
          limit: 50,
        };
        if (searchUserId) params.userId = searchUserId;
        if (searchIpAddress) params.ipAddress = searchIpAddress;
        if (dateFrom) params.dateFrom = dateFrom;
        if (dateTo) params.dateTo = dateTo;

        const response = await adminService.getUserActivityLogs(params);
        if (page === 1) {
          setActivityLogs(response.data || []);
        } else {
          setActivityLogs(prev => [...prev, ...(response.data || [])]);
        }
        setHasMore(response.meta?.currentPage < response.meta?.lastPage);
      }
    } catch (error: any) {
      console.error('Error loading logs:', error);
      
      // Check if it's a network error (backend not running)
      if (error?.isNetworkError || error?.message?.includes('Network Error') || error?.code === 'ERR_CONNECTION_REFUSED') {
        const apiPort = import.meta.env.VITE_API_PORT || '3333';
        toast.error(`Cannot connect to backend server. Please ensure the API server is running on port ${apiPort}.`);
      } else {
        toast.error(error?.response?.data?.message || 'Failed to load logs');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = () => {
    setPage(1);
    if (activeLogTab === 'detection') {
      setDetectionLogs([]);
    } else {
      setActivityLogs([]);
    }
  };

  useEffect(() => {
    handleFilterChange();
  }, [filterContentType, filterDetectionType, dateFrom, dateTo, searchUserId, searchIpAddress, activeLogTab]);

  const loadMore = () => {
    if (!isLoading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getDetectionTypeColor = (type: string) => {
    if (type?.includes('similarity')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    if (type?.includes('spam')) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    if (type?.includes('bot')) return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    if (type?.includes('language')) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
  };

  return (
    <div className="space-y-6">
      {/* Log Type Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveLogTab('detection')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeLogTab === 'detection'
              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Detection Logs
          </div>
        </button>
        <button
          onClick={() => setActiveLogTab('activity')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeLogTab === 'activity'
              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Activity Logs
          </div>
        </button>
      </div>

      {/* Filters */}
      <GlassCard className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {activeLogTab === 'detection' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  User ID
                </label>
                <input
                  type="text"
                  value={searchUserId}
                  onChange={(e) => setSearchUserId(e.target.value)}
                  placeholder="Filter by user ID"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Content Type
                </label>
                <select
                  value={filterContentType}
                  onChange={(e) => setFilterContentType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="all">All Types</option>
                  <option value="post">Post</option>
                  <option value="comment">Comment</option>
                  <option value="hackathon">Hackathon</option>
                  <option value="event">Event</option>
                  <option value="opportunity">Opportunity</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Detection Type
                </label>
                <input
                  type="text"
                  value={filterDetectionType}
                  onChange={(e) => setFilterDetectionType(e.target.value)}
                  placeholder="Filter by type"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  User ID
                </label>
                <input
                  type="text"
                  value={searchUserId}
                  onChange={(e) => setSearchUserId(e.target.value)}
                  placeholder="Filter by user ID"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  IP Address
                </label>
                <input
                  type="text"
                  value={searchIpAddress}
                  onChange={(e) => setSearchIpAddress(e.target.value)}
                  placeholder="Filter by IP"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date From
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date To
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
      </GlassCard>

      {/* Logs Table */}
      <GlassCard className="p-6">
        {isLoading && page === 1 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        ) : activeLogTab === 'detection' ? (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-gray-100">User</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-gray-100">Content Type</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-gray-100">Detection Type</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-gray-100">Similarity</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-gray-100">Action</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-gray-100">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {detectionLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No detection logs found
                      </td>
                    </tr>
                  ) : (
                    detectionLogs.map((log) => (
                      <tr key={log.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="py-3 px-4">
                          {log.user ? (
                            <div className="flex items-center gap-2">
                              <Avatar src={log.user.avatar_url} alt={log.user.username} size="sm" />
                              <span className="text-sm text-gray-900 dark:text-gray-100">{log.user.username}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500 dark:text-gray-400">Unknown</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Badge>{log.content_type}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={getDetectionTypeColor(log.detection_type)}>
                            {log.detection_type}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          {log.similarity_score ? (
                            <span className="text-sm text-gray-900 dark:text-gray-100">
                              {log.similarity_score.toFixed(1)}%
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Badge>{log.action_taken}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(log.created_at)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {hasMore && (
              <button
                onClick={loadMore}
                disabled={isLoading}
                className="w-full py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Loading...' : 'Load More'}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-gray-100">User</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-gray-100">IP Address</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-gray-100">Endpoint</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-gray-100">Method</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-gray-100">User Agent</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-gray-100">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {activityLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No activity logs found
                      </td>
                    </tr>
                  ) : (
                    activityLogs.map((log) => (
                      <tr key={log.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="py-3 px-4">
                          {log.user ? (
                            <div className="flex items-center gap-2">
                              <Avatar src={log.user.avatar_url} alt={log.user.username} size="sm" />
                              <span className="text-sm text-gray-900 dark:text-gray-100">{log.user.username}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500 dark:text-gray-400">Anonymous</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-900 dark:text-gray-100 font-mono">
                            {log.ip_address || '-'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-900 dark:text-gray-100 font-mono">
                            {log.endpoint}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Badge>{log.method}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs block">
                            {log.user_agent || '-'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(log.created_at)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {hasMore && (
              <button
                onClick={loadMore}
                disabled={isLoading}
                className="w-full py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Loading...' : 'Load More'}
              </button>
            )}
          </div>
        )}
      </GlassCard>
    </div>
  );
}

