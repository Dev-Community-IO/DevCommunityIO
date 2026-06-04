import { useState, useEffect } from 'react';
import { Mail, Shield, Bell, Eye, Smartphone, Trash2, AlertTriangle, X, CheckCircle, Loader, Save, BadgeCheck } from 'lucide-react';
import { TabPills } from './TabPills';
import { NotificationSettings } from './NotificationSettings';
import {
  ProfileTabPanel,
  ProfileTabHeader,
  ProfileToggleRow,
  ProfileAlert,
  profileInputClass,
  profileTextareaClass,
  profilePrimaryBtnClass,
  profileDangerBtnClass,
} from './profileTabUi';
import { asidePanelClass } from './postCardSurface';
import { EmailPreferences } from './EmailPreferences';
import { PWASettings } from './PWASettings';
import { useAuth } from '../contexts/AuthContext';
import privacyService from '../services/api/privacy.service';
import accountService from '../services/api/account.service';
import verificationService from '../services/api/verification.service';
import reputationSystemService from '../services/api/reputationSystem.service';
import { VerifiedBadge } from './VerifiedBadge';
import { useToast } from './Toast';
import { ConfirmDialog } from './ConfirmDialog';

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
    { id: 'account' as const, label: 'Account', icon: Shield },
    { id: 'privacy' as const, label: 'Privacy', icon: Eye },
    { id: 'notifications' as const, label: 'Alerts', icon: Bell },
    ...(hasOAuth || hasEmail ? [{ id: 'email' as const, label: 'Email', icon: Mail }] : []),
    { id: 'pwa' as const, label: 'App', icon: Smartphone },
  ];

  const privacyItems: {
    key: keyof typeof privacyPrefs;
    title: string;
    description: string;
    hideIfNoWallet?: boolean;
  }[] = [
    { key: 'show_email', title: 'Show email', description: 'Display your email on your public profile.' },
    { key: 'show_activity_status', title: 'Activity status', description: "Let others see when you're online." },
    { key: 'profile_visible', title: 'Public profile', description: 'Make your profile visible to everyone.' },
    {
      key: 'show_wallet_address',
      title: 'Show wallet',
      description: 'Display your wallet address on your profile.',
      hideIfNoWallet: true,
    },
    { key: 'allow_direct_messages', title: 'Direct messages', description: 'Allow other members to message you.' },
    { key: 'show_reputation', title: 'Reputation', description: 'Show your reputation score on your profile.' },
    { key: 'show_followers', title: 'Followers', description: 'Show your follower count.' },
    { key: 'show_following', title: 'Following', description: 'Show who you follow.' },
  ];

  const canRequestVerification =
    profileCompleteness.isComplete &&
    authUser?.reputation !== undefined &&
    authUser.reputation >= minReputation;

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
      const data = await reputationSystemService.getRequirements();
      const configured = data.requirements?.verification ?? 0;
      setMinReputation(Math.max(200, configured));
    } catch (error) {
      console.error('Failed to load minimum reputation:', error);
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


  const RequirementRow = ({
    ok,
    label,
  }: {
    ok: boolean;
    label: string;
  }) => (
    <li className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
      {ok ? (
        <CheckCircle size={14} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
      ) : (
        <X size={14} className="shrink-0 text-zinc-400" />
      )}
      {label}
    </li>
  );

  return (
    <div className="space-y-4">
      <div className={`${asidePanelClass} overflow-hidden p-2 sm:p-3`}>
        <TabPills
          ariaLabel="Settings sections"
          activeTab={activeSection}
          onChange={(id) => setActiveSection(id as typeof activeSection)}
          scrollable
          size="sm"
          tabs={sections.map((s) => ({ id: s.id, label: s.label, icon: s.icon }))}
        />
      </div>

      {activeSection === 'account' && (
        <ProfileTabPanel>
          <ProfileTabHeader
            icon={Shield}
            title="Account"
            description="Verification, wallet, and account safety."
          />

          <div className="space-y-3">
            {user.walletAddress && (
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                  Wallet
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={user.walletAddress}
                    readOnly
                    className={`${profileInputClass} font-mono text-xs`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(user.walletAddress);
                      toast.success('Wallet address copied');
                    }}
                    className={profilePrimaryBtnClass}
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}

            {authUser?.isVerified ? (
              <ProfileAlert variant="success" title="Verified account">
                <div className="flex items-center gap-2">
                  <VerifiedBadge size={20} />
                  <span>Your profile displays the verified badge.</span>
                </div>
              </ProfileAlert>
            ) : verificationLoading ? (
              <div className="flex items-center gap-2 py-4 text-sm text-zinc-500">
                <Loader size={16} className="animate-spin" />
                Loading verification status…
              </div>
            ) : verificationStatus === 'pending' ? (
              <ProfileAlert variant="info" title="Verification pending">
                <p>
                  We&apos;re reviewing your request. You&apos;ll be notified by email, usually within 2–5
                  business days.
                </p>
                {verificationRequest?.adminComment && (
                  <p className="mt-2 border-t border-zinc-200/80 pt-2 dark:border-white/10">
                    <span className="font-medium">Note: </span>
                    {verificationRequest.adminComment}
                  </p>
                )}
              </ProfileAlert>
            ) : (
              <div className="space-y-3 rounded-lg border border-zinc-200/80 p-3 dark:border-white/[0.08]">
                <div className="flex items-start gap-2">
                  <BadgeCheck size={18} className="mt-0.5 shrink-0 text-zinc-500" />
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      Request verification
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                      Get a verified badge after meeting the requirements below.
                    </p>
                  </div>
                </div>
                <ul className="space-y-1.5">
                  <RequirementRow
                    ok={profileCompleteness.isComplete}
                    label="Complete profile (bio, avatar, location)"
                  />
                  <RequirementRow
                    ok={authUser?.reputation !== undefined && authUser.reputation >= minReputation}
                    label={`${minReputation}+ reputation${authUser?.reputation !== undefined ? ` · you have ${authUser.reputation.toLocaleString()}` : ''}`}
                  />
                </ul>
                {authUser?.reputation !== undefined && authUser.reputation < minReputation && (
                  <ProfileAlert variant="info" title="Reputation needed">
                    <p className="text-xs">
                      Need <span className="font-semibold tabular-nums">{minReputation}</span> reputation
                      {' · '}
                      you have <span className="font-semibold tabular-nums">{authUser.reputation.toLocaleString()}</span>
                      {' · '}
                      <span className="font-semibold tabular-nums">
                        {(minReputation - authUser.reputation).toLocaleString()}
                      </span>{' '}
                      more to request verification.
                    </p>
                  </ProfileAlert>
                )}
                {!profileCompleteness.isComplete && (
                  <ProfileAlert variant="warning" title="Profile incomplete">
                    <ul className="mt-1 list-inside list-disc space-y-0.5">
                      {profileCompleteness.missingFields.includes('bio') && <li>Bio (10+ characters)</li>}
                      {profileCompleteness.missingFields.includes('avatar') && <li>Profile photo</li>}
                      {profileCompleteness.missingFields.includes('location') && <li>Location</li>}
                    </ul>
                  </ProfileAlert>
                )}
                <button
                  type="button"
                  onClick={() => setShowVerificationModal(true)}
                  disabled={!canRequestVerification}
                  className={`${profilePrimaryBtnClass} w-full`}
                >
                  <BadgeCheck size={16} />
                  Request verification
                </button>
              </div>
            )}

            {deletionRequested && daysRemaining !== null && (
              <ProfileAlert
                variant="warning"
                title="Deletion scheduled"
                action={
                  <button
                    type="button"
                    onClick={() => setShowCancelDialog(true)}
                    className={profilePrimaryBtnClass}
                  >
                    Cancel deletion
                  </button>
                }
              >
                Your account will be deleted in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}. You can
                cancel before then.
              </ProfileAlert>
            )}

            <div className="border-t border-zinc-100 pt-3 dark:border-white/[0.06]">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-red-600 dark:text-red-400">
                <AlertTriangle size={14} />
                Danger zone
              </p>
              <ProfileAlert variant="danger" title="Delete account">
                Permanently removes your data after a 30-day grace period. This cannot be undone.
              </ProfileAlert>
              <button
                type="button"
                onClick={() => setShowDeleteDialog(true)}
                disabled={deletionRequested}
                className={`${profileDangerBtnClass} mt-2`}
              >
                <Trash2 size={14} />
                {deletionRequested ? 'Deletion already requested' : 'Delete account'}
              </button>
            </div>
          </div>
        </ProfileTabPanel>
      )}

      {activeSection === 'privacy' && (
        <ProfileTabPanel>
          <ProfileTabHeader
            icon={Eye}
            title="Privacy"
            description="Control what others see on your profile."
          />

          {privacyLoading ? (
            <div className="flex justify-center py-12">
              <Loader size={24} className="animate-spin text-zinc-400" />
            </div>
          ) : (
            <div className="space-y-2">
              {privacyItems
                .filter((item) => !(item.hideIfNoWallet && !user.walletAddress))
                .map((item) => (
                  <ProfileToggleRow
                    key={item.key}
                    title={item.title}
                    description={item.description}
                    enabled={privacyPrefs[item.key]}
                    onToggle={() => handlePrivacyToggle(item.key)}
                  />
                ))}

              {privacyError && (
                <ProfileAlert variant="danger" title="Could not save">
                  {privacyError}
                </ProfileAlert>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-100 pt-3 dark:border-white/[0.06]">
                {privacySaveSuccess ? (
                  <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    <CheckCircle size={14} />
                    Saved
                  </span>
                ) : (
                  <span className="text-xs text-zinc-500">Changes apply immediately</span>
                )}
                <button
                  type="button"
                  onClick={handleSavePrivacy}
                  disabled={privacySaving}
                  className={profilePrimaryBtnClass}
                >
                  {privacySaving ? (
                    <>
                      <Loader size={14} className="animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      Save
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </ProfileTabPanel>
      )}

      {activeSection === 'notifications' && (
        <div className={`${asidePanelClass} overflow-hidden`}>
          <NotificationSettings />
        </div>
      )}

      {activeSection === 'email' &&
        (isWalletOnly ? (
          <ProfileTabPanel>
            <ProfileTabHeader icon={Mail} title="Email" description="Email preferences for your account." />
            <ProfileAlert variant="info" title="Email not available">
              Wallet-only accounts don&apos;t have an email. Connect with Google or GitHub to manage email
              preferences.
            </ProfileAlert>
          </ProfileTabPanel>
        ) : (
          <div className={`${asidePanelClass} overflow-hidden`}>
            <EmailPreferences user={user} />
          </div>
        ))}

      {activeSection === 'pwa' && (
        <div className={`${asidePanelClass} overflow-hidden`}>
          <PWASettings />
        </div>
      )}

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setDeleteReason('');
        }}
        onConfirm={handleRequestDeletion}
        title="Delete Account"
        message="Are you sure you want to delete your account? This action will schedule your account for deletion in 30 days. You can cancel this request anytime before then."
        confirmText={deleting ? 'Deleting...' : 'Yes, Delete Account'}
        cancelText="Cancel"
        variant="danger"
        isLoading={deleting}
      >
        <div className="mt-4">
          <label className="mb-1.5 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
            Reason (optional)
          </label>
          <textarea
            value={deleteReason}
            onChange={(e) => setDeleteReason(e.target.value)}
            placeholder="Tell us why you're leaving…"
            rows={3}
            className={profileTextareaClass}
          />
        </div>
      </ConfirmDialog>

      <ConfirmDialog
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={handleCancelDeletion}
        title="Cancel Account Deletion"
        message="Are you sure you want to cancel the account deletion request? Your account will remain active."
        confirmText={cancelling ? 'Cancelling...' : 'Yes, Cancel Deletion'}
        cancelText="Keep Deletion"
        variant="default"
        isLoading={cancelling}
      />

      {showVerificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className={`${asidePanelClass} max-h-[90vh] w-full max-w-lg overflow-y-auto p-4 sm:p-5`}>
            <div className="mb-4 flex items-center justify-between gap-2">
              <h3 className="flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">
                <BadgeCheck size={20} className="text-zinc-500" />
                Request verification
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowVerificationModal(false);
                  setVerificationReason('');
                }}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/[0.06]"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <ProfileAlert variant="info" title="Requirements">
                <ul className="mt-1 list-inside list-disc space-y-0.5 text-xs">
                  <li>Complete profile (bio, avatar, location)</li>
                  <li>{minReputation}+ reputation points</li>
                  <li>Reason with at least 50 characters</li>
                </ul>
              </ProfileAlert>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Why should you be verified? <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={verificationReason}
                  onChange={(e) => setVerificationReason(e.target.value)}
                  placeholder="Describe your expertise and contributions…"
                  rows={5}
                  className={profileTextareaClass}
                  minLength={50}
                  disabled={!canRequestVerification}
                />
                <p
                  className={`mt-1 text-[10px] tabular-nums ${
                    verificationReason.length >= 50
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-zinc-500'
                  }`}
                >
                  {verificationReason.length}/50 minimum
                </p>
              </div>

              <div className="flex gap-2 border-t border-zinc-100 pt-3 dark:border-white/[0.06]">
                <button
                  type="button"
                  onClick={handleRequestVerification}
                  disabled={
                    verificationLoading ||
                    verificationReason.trim().length < 50 ||
                    !canRequestVerification
                  }
                  className={`${profilePrimaryBtnClass} flex-1`}
                >
                  {verificationLoading ? (
                    <>
                      <Loader size={14} className="animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    <>
                      <BadgeCheck size={14} />
                      Submit
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowVerificationModal(false);
                    setVerificationReason('');
                  }}
                  className="rounded-lg border border-zinc-200/80 px-3 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-50 dark:border-white/10 dark:text-zinc-400 dark:hover:bg-white/[0.06]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
