import { useState, useEffect, useCallback } from 'react';
import { Check, ChevronRight, ChevronLeft, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import onboardingService from '../services/api/onboarding.service';
import { celebrateOnboarding } from '../utils/celebrateOnboarding';
import { markOnboardingDone } from '../utils/onboardingStorage';
import { InterestSelection } from './InterestSelection';
import { PageSuggestions } from './PageSuggestions';
import { ProfileSetup } from './ProfileSetup';
import {
  onboardingGhostBtnClass,
  onboardingPrimaryBtnClass,
  onboardingShellClass,
  onboardingStatusBarClass,
} from './onboardingChrome';

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

type Step = 'profile' | 'interests' | 'pages' | 'complete';

const steps: { id: Step; label: string; hint: string }[] = [
  { id: 'profile', label: 'Profile', hint: 'Username, bio & skills' },
  { id: 'interests', label: 'Interests', hint: 'Pick 3+ topics' },
  { id: 'pages', label: 'Pages', hint: 'Follow at least one page' },
  { id: 'complete', label: 'Done', hint: 'You\'re all set' },
];

export function OnboardingWizard({ isOpen, onClose, onComplete }: OnboardingWizardProps) {
  const { user, updateUser, setShowOnboarding } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>('profile');
  const [profileData, setProfileData] = useState({
    username: '',
    bio: '',
    skills: [] as string[],
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedPages, setSelectedPages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;
  const activeStep = steps[currentStepIndex];

  useEffect(() => {
    if (isOpen && user) {
      setAuthError(null);
      loadCurrentData();
    }
  }, [isOpen, user?.id]);

  const loadCurrentData = async () => {
    if (!user) return;

    setIsLoadingData(true);
    try {
      setProfileData({
        username: user.username || '',
        bio: user.bio || '',
        skills: user.skills || [],
      });

      const currentData = await onboardingService.getCurrentData();
      setSelectedTags(currentData.interests || []);
      setSelectedPages(currentData.joinedPages || []);
    } catch (error) {
      console.error('Failed to load current onboarding data:', error);
      setProfileData({
        username: user.username || '',
        bio: user.bio || '',
        skills: user.skills || [],
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleProfileSave = useCallback((data: { username: string; bio: string; skills: string[] }) => {
    setProfileData(data);
  }, []);

  const canProceed = () => {
    if (currentStep === 'profile') {
      return (
        profileData.username.length >= 3 &&
        profileData.bio.trim().length >= 10 &&
        profileData.skills.length >= 3
      );
    }
    if (currentStep === 'interests') return selectedTags.length >= 3;
    if (currentStep === 'pages') return selectedPages.length >= 1;
    return true;
  };

  if (!isOpen) return null;

  const finishOnboarding = () => {
    if (user?.id) {
      markOnboardingDone(user.id);
    }
    updateUser({ onboardingCompleted: true, ...profileData });
    setShowOnboarding(false);
    celebrateOnboarding();
    onComplete();
    onClose();
  };

  const handleNext = async () => {
    setIsLoading(true);
    setAuthError(null);
    try {
      if (currentStep === 'profile') {
        setCurrentStep('interests');
      } else if (currentStep === 'interests') {
        await onboardingService.saveInterests(selectedTags);
        setCurrentStep('pages');
      } else if (currentStep === 'pages') {
        await onboardingService.saveFollows([], selectedPages);
        setCurrentStep('complete');
      } else if (currentStep === 'complete') {
        finishOnboarding();

        void (async () => {
          try {
            await onboardingService.updateProfile(profileData);
          } catch (error) {
            console.error('Failed to update profile:', error);
          }

          try {
            await onboardingService.complete();
          } catch (error) {
            console.error('Failed to complete onboarding:', error);
          }
        })();
      }
    } catch (error: any) {
      console.error('Onboarding error:', error);
      const status = error?.response?.status ?? error?.status;
      if (status === 401) {
        setAuthError('Your session expired. Please sign in again to continue setup.');
        setShowOnboarding(false);
        return;
      }
      if (currentStep === 'complete') {
        finishOnboarding();
        return;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep === 'interests') setCurrentStep('profile');
    else if (currentStep === 'pages') setCurrentStep('interests');
    else if (currentStep === 'complete') setCurrentStep('pages');
  };

  const handleSkip = async () => {
    try {
      setIsLoading(true);
      await onboardingService.skip();
    } catch (error) {
      console.error('Skip onboarding error:', error);
    } finally {
      if (user?.id) {
        markOnboardingDone(user.id);
      }
      updateUser({ onboardingCompleted: true });
      setShowOnboarding(false);
      celebrateOnboarding();
      onComplete();
      onClose();
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] overflow-y-auto overscroll-contain animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" aria-hidden />

      <div className="relative flex min-h-full items-start justify-center p-3 pb-6 pt-16 sm:items-center sm:p-4 sm:py-8">
        <div className={`w-full max-w-lg ${onboardingShellClass}`}>
        {/* Header */}
        <div className="shrink-0 border-b border-zinc-100 px-4 py-3 dark:border-white/[0.06] sm:px-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-200/80 bg-zinc-50 text-zinc-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-400"
                aria-hidden
              >
                <Sparkles size={15} strokeWidth={2} />
              </span>
              <div className="min-w-0">
                <h2
                  id="onboarding-title"
                  className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100"
                >
                  Welcome to DevCommunity
                </h2>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Step {currentStepIndex + 1} of {steps.length} · {activeStep.label}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSkip}
              className="shrink-0 text-[11px] font-medium text-zinc-500 transition-colors hover:text-zinc-800 dark:hover:text-zinc-200"
            >
              Skip
            </button>
          </div>

          <div className="mt-3 h-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-zinc-900 transition-all duration-300 dark:bg-zinc-100"
              style={{ width: `${progress}%` }}
            />
          </div>

          <nav className="mt-2.5 flex gap-1" aria-label="Onboarding progress">
            {steps.map((step, index) => {
              const done = index < currentStepIndex;
              const active = index === currentStepIndex;
              return (
                <div
                  key={step.id}
                  className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 ${
                    index <= currentStepIndex ? 'opacity-100' : 'opacity-35'
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold transition-colors ${
                      done
                        ? 'bg-emerald-600 text-white dark:bg-emerald-500'
                        : active
                          ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                          : 'bg-zinc-200 text-zinc-500 dark:bg-white/10 dark:text-zinc-500'
                    }`}
                  >
                    {done ? <Check size={10} strokeWidth={3} /> : index + 1}
                  </span>
                  <span
                    className={`hidden truncate text-[9px] font-medium sm:block ${
                      active ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-500'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
          {authError ? (
            <p className="rounded-lg border border-red-200/80 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-500/30 dark:bg-red-950/40 dark:text-red-300">
              {authError}
            </p>
          ) : isLoadingData ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10">
              <Loader2 size={22} className="animate-spin text-zinc-400" strokeWidth={2} />
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Loading your profile…</p>
            </div>
          ) : (
            <>
              {currentStep === 'profile' && (
                <ProfileSetup
                  key={`profile-${user?.id}`}
                  initialUsername={profileData.username}
                  initialBio={profileData.bio}
                  initialSkills={profileData.skills}
                  onSave={handleProfileSave}
                />
              )}
              {currentStep === 'interests' && (
                <InterestSelection selectedTags={selectedTags} onTagsChange={setSelectedTags} />
              )}
              {currentStep === 'pages' && (
                <PageSuggestions
                  selectedPages={selectedPages}
                  selectedTagIds={selectedTags}
                  onPagesChange={setSelectedPages}
                />
              )}
              {currentStep === 'complete' && (
                <div className="py-4 text-center">
                  <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-emerald-200/80 bg-emerald-50 text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-950/50 dark:text-emerald-400">
                    <Check size={22} strokeWidth={2.5} />
                  </span>
                  <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    You&apos;re all set
                  </h3>
                  <p className="mx-auto mt-1 max-w-xs text-xs text-zinc-500 dark:text-zinc-400">
                    Your feed is personalized from the topics and communities you chose.
                  </p>
                  <div className="mx-auto mt-4 flex max-w-xs justify-center gap-3">
                    <div className={onboardingStatusBarClass}>
                      <span className="tabular-nums font-semibold text-zinc-800 dark:text-zinc-200">
                        {selectedTags.length}
                      </span>
                      <span>topics</span>
                    </div>
                    <div className={onboardingStatusBarClass}>
                      <span className="tabular-nums font-semibold text-zinc-800 dark:text-zinc-200">
                        {selectedPages.length}
                      </span>
                      <span>pages</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between gap-2 border-t border-zinc-100 px-4 py-3 dark:border-white/[0.06] sm:px-5">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStepIndex === 0 || isLoading}
            className={onboardingGhostBtnClass}
          >
            <ChevronLeft size={16} strokeWidth={2} />
            <span className="hidden sm:inline">Back</span>
          </button>

          <p className="min-w-0 flex-1 truncate text-center text-[11px] text-zinc-500 dark:text-zinc-400">
            {activeStep.hint}
          </p>

          <button
            type="button"
            onClick={handleNext}
            disabled={!canProceed() || isLoading || isLoadingData}
            className={onboardingPrimaryBtnClass}
          >
            {isLoading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span className="hidden sm:inline">Saving…</span>
              </>
            ) : currentStep === 'complete' ? (
              'Get started'
            ) : (
              <>
                Next
                <ChevronRight size={14} strokeWidth={2} />
              </>
            )}
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
