import { useState, useEffect } from 'react';
import { Mail, Shield, Bell, Eye, Smartphone, Trash2, AlertTriangle, X, CheckCircle, Loader, Save, BadgeCheck, Clock, Info, User, MapPin, FileText } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { NotificationSettings } from './NotificationSettings';
import { EmailPreferences } from './EmailPreferences';
import { PWASettings } from './PWASettings';
import { useAuth } from '../contexts/AuthContext';
import privacyService from '../services/api/privacy.service';
import accountService from '../services/api/account.service';
import verificationService from '../services/api/verification.service';
import { VerifiedBadge } from './VerifiedBadge';
import { useToast } from './Toast';
import { ConfirmDialog } from './ConfirmDialog';
import { getApiUrl } from '../utils/apiUrl';

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
  const { user: authUser, updateUser } = useAuth();
  const toast = useToast();
  const [activeSection, setActiveSection] = useState<'account' | 'privacy' | 'notifications' | 'email' | 'pwa'>('account');
  
  // Verification Status
  const [verificationStatus, setVerificationStatus] = useState<'not_requested' | 'pending' | 'approved'>('not_requested');
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationReason, setVerificationReason] = useState('');
  const [verificationRequest, setVerificationRequest] = useState<any>(null);
  const [minReputation, setMinReputation] = useState(200); // Default to 200
  const [profileCompleteness, setProfileCompleteness] = useState({
    isComplete: false,
    missingFields: [] as string[],
  });
  
  // Privacy Settings
  const [privacyPrefs, setPrivacyPrefs] = useState({
    show_email: false,
    show_activity_status: true,
    profile_visible: true,
    show_wallet_address: false,
    allow_direct_messages: true,
    show_reputation: true,
    show_followers: true,
    show_following: true,
  });
  const [privacyLoading, setPrivacyLoading] = useState(true);
  const [privacySaving, setPrivacySaving] = useState(false);
  const [privacySaveSuccess, setPrivacySaveSuccess] = useState(false);
  const [privacyError, setPrivacyError] = useState<string | null>(null);

  // Account Deletion
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deletionRequested, setDeletionRequested] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Check auth method
  const hasEmail = authUser?.email && !authUser?.walletAddress;
  const hasOAuth = authUser?.email && (authUser as any).googleId || (authUser as any).githubId;
  const isWalletOnly = authUser?.walletAddress && !authUser?.email;

  const sections = [
    { id: 'account', label: 'Account', icon: Shield },
    { id: 'privacy', label: 'Privacy', icon: Eye },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    ...(hasOAuth || hasEmail ? [{ id: 'email', label: 'Email Preferences', icon: Mail }] : []),
    { id: 'pwa', label: 'PWA Settings', icon: Smartphone }
  ];

  useEffect(() => {
    if (authUser?.id) {
      loadPrivacyPreferences();
      checkDeletionStatus();
      loadVerificationStatus();
      loadMinReputation();
      checkProfileCompleteness();
    }
  }, [authUser?.id, authUser?.bio, authUser?.avatarUrl, authUser?.location]);

  const checkProfileCompleteness = () => {
    if (!authUser) return;
    
    const missingFields: string[] = [];
    
    if (!authUser.bio || authUser.bio.trim().length < 10) {
      missingFields.push('bio');
    }
    if (!authUser.avatarUrl) {
      missingFields.push('avatar');
    }
    if (!authUser.location || authUser.location.trim().length === 0) {
      missingFields.push('location');
    }
    
    setProfileCompleteness({
      isComplete: missingFields.length === 0,
      missingFields,
    });
  };

  const loadPrivacyPreferences = async () => {
    if (!authUser?.id) return;
    try {
      setPrivacyLoading(true);
      const prefs = await privacyService.getPreferences(authUser.id);
      setPrivacyPrefs(prefs);
    } catch (error: any) {
      console.error('Failed to load privacy preferences:', error);
      setPrivacyError(error?.message || 'Failed to load privacy preferences');
    } finally {
      setPrivacyLoading(false);
    }
  };

  const checkDeletionStatus = async () => {
    if (!authUser?.id) return;
    try {
      // Check if user has deletion_requested_at
      const userResponse = await fetch(`${getApiUrl()}/api/auth/me`, {
        credentials: 'include',
      });
      const data = await userResponse.json();
      if (data.user?.deletionRequestedAt) {
        const deletionDate = new Date(data.user.deletionRequestedAt);
        const now = new Date();
        const diffTime = deletionDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setDeletionRequested(true);
        setDaysRemaining(diffDays > 0 ? diffDays : 0);
      }
    } catch (error) {
      console.error('Failed to check deletion status:', error);
    }
  };

  const handlePrivacyToggle = (key: keyof typeof privacyPrefs) => {
    setPrivacyPrefs(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSavePrivacy = async () => {
    if (!authUser?.id) return;
    try {
      setPrivacySaving(true);
      setPrivacySaveSuccess(false);
      setPrivacyError(null);

      await privacyService.updatePreferences(authUser.id, privacyPrefs);
      setPrivacySaveSuccess(true);
      setTimeout(() => setPrivacySaveSuccess(false), 3000);
    } catch (error: any) {
      console.error('Failed to save privacy preferences:', error);
      setPrivacyError(error?.message || 'Failed to save privacy preferences');
    } finally {
      setPrivacySaving(false);
    }
  };

  const handleRequestDeletion = async () => {
    if (!authUser?.id) return;
    try {
      setDeleting(true);
      const response = await accountService.requestDeletion(authUser.id, deleteReason);
      setDeletionRequested(true);
      setDaysRemaining(response.daysRemaining || 30);
      setShowDeleteDialog(false);
      setDeleteReason('');
      
      // Update user context
      updateUser({ ...authUser, deletionRequestedAt: response.deletionDate });
    } catch (error: any) {
      console.error('Failed to request account deletion:', error);
      alert(error?.response?.data?.message || 'Failed to request account deletion');
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDeletion = async () => {
    if (!authUser?.id) return;
    try {
      setCancelling(true);
      await accountService.cancelDeletion(authUser.id);
      setDeletionRequested(false);
      setDaysRemaining(null);
      setShowCancelDialog(false);
      
      // Update user context
      updateUser({ ...authUser, deletionRequestedAt: null });
    } catch (error: any) {
      console.error('Failed to cancel account deletion:', error);
      alert(error?.response?.data?.message || 'Failed to cancel account deletion');
    } finally {
      setCancelling(false);
    }
  };

  const loadVerificationStatus = async () => {
    if (!authUser?.id) return;
    try {
      setVerificationLoading(true);
      const status = await verificationService.getStatus();
      setVerificationStatus(status.status);
      setVerificationRequest(status.request);
      if (status.isVerified) {
        updateUser({ ...authUser, isVerified: true });
      }
    } catch (error: any) {
      console.error('Failed to load verification status:', error);
    } finally {
      setVerificationLoading(false);
    }
  };

  const loadMinReputation = async () => {
    try {
      const response = await fetch(`${getApiUrl()}/api/admin/reputation-requirements`);
      const data = await response.json();
      // Use 200 as minimum, or config value if higher
      setMinReputation(Math.max(200, data.requirements?.verification || 200));
    } catch (error) {
      console.error('Failed to load minimum reputation:', error);
      // Default to 200 if API fails
      setMinReputation(200);
    }
  };

  const handleRequestVerification = async () => {
    // Check profile completeness
    if (!profileCompleteness.isComplete) {
      toast.warning('Please complete your profile first (Bio, Avatar, Location)');
      return;
    }

    // Check reputation
    if (authUser?.reputation !== undefined && authUser.reputation < minReputation) {
      toast.warning(`You need at least ${minReputation} reputation points to request verification`);
      return;
    }

    if (!verificationReason.trim() || verificationReason.trim().length < 50) {
      toast.warning('Please provide a reason of at least 50 characters');
      return;
    }

    try {
      setVerificationLoading(true);
      await verificationService.requestVerification(verificationReason);
      toast.success('Verification request submitted successfully!');
      setShowVerificationModal(false);
      setVerificationReason('');
      await loadVerificationStatus();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to submit verification request';
      toast.error(errorMessage);
    } finally {
      setVerificationLoading(false);
    }
  };

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
        {activeSection === 'account' && (
          <GlassCard className="p-6">
            <h2 className="text-2xl font-bold mb-6">Account Settings</h2>

            <div className="space-y-6">
              {/* Wallet Address */}
              {user.walletAddress && (
                <div>
                  <label className="block text-sm font-semibold mb-2">Wallet Address</label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={user.walletAddress}
                      readOnly
                      className="flex-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 outline-none font-mono text-sm"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(user.walletAddress);
                        alert('Wallet address copied to clipboard');
                      }}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-medium"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}

              {/* Verification Status */}
              {authUser?.isVerified ? (
                <div className="p-5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
                    <VerifiedBadge size={24} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-green-900 dark:text-green-100 text-lg">
                        Account Verified
                      </p>
                      <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                        Your account has been verified. You have a verified badge on your profile.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-5 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl shadow-lg">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex-shrink-0">
                      <BadgeCheck size={24} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 space-y-4">
                      <div>
                        <h3 className="font-bold text-blue-900 dark:text-blue-100 text-lg mb-1">
                          Verification Request
                        </h3>
                      {verificationLoading ? (
                          <div className="flex items-center gap-2 mt-2">
                            <Loader className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />
                            <span className="text-sm text-blue-800 dark:text-blue-200">Loading verification status...</span>
                        </div>
                      ) : verificationStatus === 'pending' ? (
                          <div className="mt-3 space-y-3">
                            <div className="p-4 bg-blue-100 dark:bg-blue-900/40 rounded-lg border border-blue-200 dark:border-blue-800">
                              <div className="flex items-start gap-3">
                                <Clock size={20} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                  <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                                    Verification Request Pending
                                  </p>
                          <p className="text-sm text-blue-800 dark:text-blue-200">
                                    We are reviewing your verification request. You'll be notified via email when our team has reviewed it. This process typically takes 2-5 business days.
                          </p>
                                </div>
                              </div>
                            </div>
                          {verificationRequest?.adminComment && (
                              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg border border-indigo-200 dark:border-indigo-800">
                                <p className="text-xs font-semibold text-indigo-900 dark:text-indigo-100 mb-1 flex items-center gap-1">
                                  <Info size={14} />
                                  Admin Comment:
                                </p>
                                <p className="text-xs text-indigo-800 dark:text-indigo-200">{verificationRequest.adminComment}</p>
                            </div>
                          )}
                          {verificationRequest?.daysUntilCanRequestAgain !== undefined && verificationRequest.daysUntilCanRequestAgain > 0 && (
                              <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                <Clock size={12} />
                              You can request again in {verificationRequest.daysUntilCanRequestAgain} day{verificationRequest.daysUntilCanRequestAgain !== 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                      ) : (
                          <div className="mt-3 space-y-3">
                            {/* Requirements Checklist */}
                            <div className="p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-blue-200 dark:border-blue-800">
                              <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                                <Info size={16} />
                                Requirements to Request Verification:
                              </p>
                        <div className="space-y-2">
                                <div className={`flex items-center gap-2 text-sm ${profileCompleteness.isComplete ? 'text-green-700 dark:text-green-300' : 'text-gray-700 dark:text-gray-300'}`}>
                                  {profileCompleteness.isComplete ? (
                                    <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                                  ) : (
                                    <X size={16} className="text-red-500" />
                                  )}
                                  <span>Complete your profile (Bio, Avatar, Location)</span>
                                </div>
                                <div className={`flex items-center gap-2 text-sm ${authUser?.reputation !== undefined && authUser.reputation >= minReputation ? 'text-green-700 dark:text-green-300' : 'text-gray-700 dark:text-gray-300'}`}>
                                  {authUser?.reputation !== undefined && authUser.reputation >= minReputation ? (
                                    <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                                  ) : (
                                    <X size={16} className="text-red-500" />
                                  )}
                                  <span>Minimum {minReputation} reputation points</span>
                                  {authUser?.reputation !== undefined && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      (You have {authUser.reputation})
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Missing Fields Warning */}
                            {!profileCompleteness.isComplete && (
                              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                                <div className="flex items-start gap-3">
                                  <AlertTriangle size={20} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                                  <div className="flex-1">
                                    <p className="font-semibold text-amber-900 dark:text-amber-100 text-sm mb-1">
                                      Complete Your Profile First
                                    </p>
                                    <p className="text-xs text-amber-800 dark:text-amber-200 mb-2">
                                      Please fill in all necessary profile information before requesting verification:
                                    </p>
                                    <ul className="text-xs text-amber-800 dark:text-amber-200 space-y-1 ml-4 list-disc">
                                      {profileCompleteness.missingFields.includes('bio') && (
                                        <li className="flex items-center gap-1">
                                          <FileText size={12} />
                                          Add a bio (at least 10 characters)
                                        </li>
                                      )}
                                      {profileCompleteness.missingFields.includes('avatar') && (
                                        <li className="flex items-center gap-1">
                                          <User size={12} />
                                          Upload a profile picture
                                        </li>
                                      )}
                                      {profileCompleteness.missingFields.includes('location') && (
                                        <li className="flex items-center gap-1">
                                          <MapPin size={12} />
                                          Add your location
                                        </li>
                            )}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Reputation Warning */}
                          {authUser?.reputation !== undefined && authUser.reputation < minReputation && (
                              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                <div className="flex items-start gap-3">
                                  <AlertTriangle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                  <div className="flex-1">
                                    <p className="font-semibold text-red-900 dark:text-red-100 text-sm mb-1">
                                      Insufficient Reputation
                                    </p>
                                    <p className="text-xs text-red-800 dark:text-red-200">
                                      You need <strong>{minReputation - authUser.reputation} more reputation points</strong> to request verification. 
                                      Build your reputation by creating quality content, engaging with the community, and helping others.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Request Button */}
                          <button
                            onClick={() => setShowVerificationModal(true)}
                              disabled={
                                !profileCompleteness.isComplete || 
                                (authUser?.reputation !== undefined && authUser.reputation < minReputation)
                              }
                              className={`w-full mt-3 px-5 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                                !profileCompleteness.isComplete || (authUser?.reputation !== undefined && authUser.reputation < minReputation)
                                  ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                  : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]'
                              }`}
                          >
                              <BadgeCheck size={18} />
                            Request Verification
                          </button>
                        </div>
                      )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Deletion Status */}
              {deletionRequested && daysRemaining !== null && (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={20} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                        Account Deletion Scheduled
                      </p>
                      <p className="text-sm text-amber-800 dark:text-amber-200 mb-3">
                        Your account will be permanently deleted in <strong>{daysRemaining} day{daysRemaining !== 1 ? 's' : ''}</strong>.
                        You can cancel this deletion at any time before then.
                      </p>
                      <button
                        onClick={() => setShowCancelDialog(true)}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors"
                      >
                        Cancel Deletion
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Danger Zone */}
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-red-500 mb-4 flex items-center gap-2">
                  <AlertTriangle size={20} />
                  Danger Zone
                </h3>
                <div className="space-y-3">
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-800 dark:text-red-200 mb-3">
                      <strong>Warning:</strong> Deleting your account will permanently remove all your data, posts, comments, and content. 
                      This action cannot be undone. You will have 30 days to cancel this request.
                    </p>
                    <button
                      onClick={() => setShowDeleteDialog(true)}
                      disabled={deletionRequested}
                      className="w-full px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Trash2 size={18} />
                      {deletionRequested ? 'Deletion Already Requested' : 'Delete Account'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        )}

        {activeSection === 'privacy' && (
          <GlassCard className="p-6">
            <h2 className="text-2xl font-bold mb-6">Privacy Settings</h2>

            {privacyLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div>
                    <h4 className="font-semibold">Show Email Address</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Allow others to see your email address on your profile
                    </p>
                  </div>
                  <button
                    onClick={() => handlePrivacyToggle('show_email')}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      privacyPrefs.show_email
                        ? 'bg-blue-500'
                        : 'bg-gray-300 dark:bg-gray-700'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                        privacyPrefs.show_email
                          ? 'translate-x-6'
                          : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div>
                    <h4 className="font-semibold">Show Activity Status</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Let others see when you're online
                    </p>
                  </div>
                  <button
                    onClick={() => handlePrivacyToggle('show_activity_status')}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      privacyPrefs.show_activity_status
                        ? 'bg-blue-500'
                        : 'bg-gray-300 dark:bg-gray-700'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                        privacyPrefs.show_activity_status
                          ? 'translate-x-6'
                          : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div>
                    <h4 className="font-semibold">Profile Visibility</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Make your profile visible to everyone
                    </p>
                  </div>
                  <button
                    onClick={() => handlePrivacyToggle('profile_visible')}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      privacyPrefs.profile_visible
                        ? 'bg-blue-500'
                        : 'bg-gray-300 dark:bg-gray-700'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                        privacyPrefs.profile_visible
                          ? 'translate-x-6'
                          : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {user.walletAddress && (
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div>
                      <h4 className="font-semibold">Show Wallet Address</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Display your wallet address on your profile
                      </p>
                    </div>
                    <button
                      onClick={() => handlePrivacyToggle('show_wallet_address')}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        privacyPrefs.show_wallet_address
                          ? 'bg-blue-500'
                          : 'bg-gray-300 dark:bg-gray-700'
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                          privacyPrefs.show_wallet_address
                            ? 'translate-x-6'
                            : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div>
                    <h4 className="font-semibold">Allow Direct Messages</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Let other users send you direct messages
                    </p>
                  </div>
                  <button
                    onClick={() => handlePrivacyToggle('allow_direct_messages')}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      privacyPrefs.allow_direct_messages
                        ? 'bg-blue-500'
                        : 'bg-gray-300 dark:bg-gray-700'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                        privacyPrefs.allow_direct_messages
                          ? 'translate-x-6'
                          : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div>
                    <h4 className="font-semibold">Show Reputation</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Display your reputation score on your profile
                    </p>
                  </div>
                  <button
                    onClick={() => handlePrivacyToggle('show_reputation')}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      privacyPrefs.show_reputation
                        ? 'bg-blue-500'
                        : 'bg-gray-300 dark:bg-gray-700'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                        privacyPrefs.show_reputation
                          ? 'translate-x-6'
                          : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div>
                    <h4 className="font-semibold">Show Followers</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Display your followers count on your profile
                    </p>
                  </div>
                  <button
                    onClick={() => handlePrivacyToggle('show_followers')}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      privacyPrefs.show_followers
                        ? 'bg-blue-500'
                        : 'bg-gray-300 dark:bg-gray-700'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                        privacyPrefs.show_followers
                          ? 'translate-x-6'
                          : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div>
                    <h4 className="font-semibold">Show Following</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Display who you're following on your profile
                    </p>
                  </div>
                  <button
                    onClick={() => handlePrivacyToggle('show_following')}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      privacyPrefs.show_following
                        ? 'bg-blue-500'
                        : 'bg-gray-300 dark:bg-gray-700'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                        privacyPrefs.show_following
                          ? 'translate-x-6'
                          : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Error Message */}
                {privacyError && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
                    <X size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-900 dark:text-red-100">Error</p>
                      <p className="text-sm text-red-700 dark:text-red-300">{privacyError}</p>
                    </div>
                  </div>
                )}

                {/* Save Button */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  {privacySaveSuccess ? (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <CheckCircle size={20} />
                      <span className="font-medium">Privacy settings saved successfully!</span>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Changes will take effect immediately
                    </p>
                  )}
                  <button
                    onClick={handleSavePrivacy}
                    disabled={privacySaving}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {privacySaving ? (
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
            )}
          </GlassCard>
        )}

        {activeSection === 'notifications' && (
          <NotificationSettings />
        )}

        {activeSection === 'email' && (
          <>
            {isWalletOnly ? (
              <GlassCard className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Mail size={22} className="text-gray-500" />
                  <h2 className="text-2xl font-bold">Email Preferences</h2>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={20} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                        Email Not Available
                      </p>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        You're connected with a wallet only. Email preferences are only available for users who 
                        connected with Google or GitHub, as those accounts have email addresses associated with them.
                      </p>
                    </div>
                  </div>
                </div>
              </GlassCard>
            ) : (
              <EmailPreferences user={user} />
            )}
          </>
        )}
        
        {activeSection === 'pwa' && (
          <PWASettings />
        )}
      </div>

      {/* Delete Account Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setDeleteReason('');
        }}
        onConfirm={handleRequestDeletion}
        title="Delete Account"
        message="Are you sure you want to delete your account? This action will schedule your account for deletion in 30 days. You can cancel this request anytime before then."
        confirmText={deleting ? "Deleting..." : "Yes, Delete Account"}
        cancelText="Cancel"
        variant="danger"
        isLoading={deleting}
      >
        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">
            Reason (optional)
          </label>
          <textarea
            value={deleteReason}
            onChange={(e) => setDeleteReason(e.target.value)}
            placeholder="Tell us why you're leaving..."
            rows={3}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none resize-none"
          />
        </div>
      </ConfirmDialog>

      {/* Cancel Deletion Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={handleCancelDeletion}
        title="Cancel Account Deletion"
        message="Are you sure you want to cancel the account deletion request? Your account will remain active."
        confirmText={cancelling ? "Cancelling..." : "Yes, Cancel Deletion"}
        cancelText="Keep Deletion"
        variant="default"
        isLoading={cancelling}
      />

      {/* Verification Request Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <GlassCard className="p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <BadgeCheck size={28} className="text-blue-500" />
                Request Verification
              </h3>
              <button
                onClick={() => {
                  setShowVerificationModal(false);
                  setVerificationReason('');
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5">
              {/* Requirements Info */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                  <Info size={16} />
                  Verification Requirements
                </p>
                <div className="space-y-1 text-xs text-blue-800 dark:text-blue-200">
                  <p>✓ Complete profile (Bio, Avatar, Location)</p>
                  <p>✓ Minimum {minReputation} reputation points</p>
                  <p>✓ Provide a detailed reason (minimum 50 characters)</p>
                </div>
              </div>

              {/* Profile Completeness Check */}
              {!profileCompleteness.isComplete && (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={20} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-amber-900 dark:text-amber-100 text-sm mb-1">
                        Profile Incomplete
                      </p>
                      <p className="text-xs text-amber-800 dark:text-amber-200">
                        Please complete your profile before requesting verification. Go to your profile settings to add:
                      </p>
                      <ul className="text-xs text-amber-800 dark:text-amber-200 space-y-1 mt-2 ml-4 list-disc">
                        {profileCompleteness.missingFields.includes('bio') && <li>Bio (at least 10 characters)</li>}
                        {profileCompleteness.missingFields.includes('avatar') && <li>Profile picture</li>}
                        {profileCompleteness.missingFields.includes('location') && <li>Location</li>}
                      </ul>
                    </div>
                  </div>
                  </div>
                )}

              {/* Reputation Check */}
              {authUser?.reputation !== undefined && authUser.reputation < minReputation && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-red-900 dark:text-red-100 text-sm mb-1">
                        Insufficient Reputation
                      </p>
                      <p className="text-xs text-red-800 dark:text-red-200">
                        You need <strong>{minReputation - authUser.reputation} more reputation points</strong> to request verification.
                      </p>
              </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">
                  Reason for Verification <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={verificationReason}
                  onChange={(e) => setVerificationReason(e.target.value)}
                  placeholder="Explain why you should be verified. Include details about your expertise, contributions to the community, or any notable achievements. (minimum 50 characters)..."
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all resize-none"
                  minLength={50}
                  disabled={!profileCompleteness.isComplete || (authUser?.reputation !== undefined && authUser.reputation < minReputation)}
                />
                <div className="flex items-center justify-between mt-2">
                  <p className={`text-xs ${verificationReason.length >= 50 ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  {verificationReason.length}/50 characters (minimum)
                </p>
                  {minReputation > 0 && authUser?.reputation !== undefined && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Your reputation: <strong>{authUser.reputation}</strong> / {minReputation} required
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleRequestVerification}
                  disabled={
                    verificationLoading || 
                    verificationReason.trim().length < 50 || 
                    !profileCompleteness.isComplete ||
                    (authUser?.reputation !== undefined && authUser.reputation < minReputation)
                  }
                  className="flex-1 px-5 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none"
                >
                  {verificationLoading ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <BadgeCheck size={18} />
                      Submit Request
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowVerificationModal(false);
                    setVerificationReason('');
                  }}
                  className="px-5 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
