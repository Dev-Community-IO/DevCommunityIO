import { useState, useEffect } from 'react';
import { Check, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import onboardingService from '../services/api/onboarding.service';
import { InterestSelection } from './InterestSelection';
import { UserSuggestions } from './UserSuggestions';
import { PageSuggestions } from './PageSuggestions';
import { ProfileSetup } from './ProfileSetup';
import { GlassCard } from './GlassCard';

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

type Step = 'profile' | 'interests' | 'users' | 'pages' | 'complete';

export function OnboardingWizard({ isOpen, onClose, onComplete }: OnboardingWizardProps) {
  const { user, updateUser, checkAuth, setShowOnboarding } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>('profile');
  const [profileData, setProfileData] = useState({
    username: '',
    bio: '',
    skills: [] as string[]
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedPages, setSelectedPages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const steps = [
    { id: 'profile', label: 'Profile', description: 'Set up your profile' },
    { id: 'interests', label: 'Interests', description: 'Pick topics' },
    { id: 'users', label: 'People', description: 'Follow creators' },
    { id: 'pages', label: 'Communities', description: 'Join pages' },
    { id: 'complete', label: 'Done', description: 'All set!' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  useEffect(() => {
    if (isOpen && currentStep === 'complete') {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [isOpen, currentStep]);

  // Load current data when modal opens and user is available
  useEffect(() => {
    if (isOpen && user) {
      loadCurrentData();
    }
  }, [isOpen, user?.id, user?.username, user?.bio, user?.skills]);

  const loadCurrentData = async () => {
    if (!user) return;
    
    setIsLoadingData(true);
    try {
      // Load current profile data from user (always use latest user data)
      setProfileData({
        username: user.username || '',
        bio: user.bio || '',
        skills: user.skills || []
      });

      // Load current onboarding data (interests, followed users, joined pages)
      const currentData = await onboardingService.getCurrentData();
      setSelectedTags(currentData.interests || []);
      setSelectedUsers(currentData.followedUsers || []);
      setSelectedPages(currentData.joinedPages || []);
    } catch (error) {
      console.error('Failed to load current onboarding data:', error);
      // Fallback to user data if API fails
      setProfileData({
        username: user.username || '',
        bio: user.bio || '',
        skills: user.skills || []
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  if (!isOpen) return null;

  const handleNext = async () => {
    setIsLoading(true);
    try {
      if (currentStep === 'profile') {
        // Profile data will be saved in the complete step
        setCurrentStep('interests');
      } else if (currentStep === 'interests') {
        await onboardingService.saveInterests(selectedTags);
        setCurrentStep('users');
      } else if (currentStep === 'users') {
        setCurrentStep('pages');
      } else if (currentStep === 'pages') {
        await onboardingService.saveFollows(selectedUsers, selectedPages);
        setCurrentStep('complete');
      } else if (currentStep === 'complete') {
        // Save profile and complete onboarding
        await onboardingService.updateProfile(profileData);
        await onboardingService.complete();
        // Update user with onboardingCompleted flag - this persists in localStorage
        updateUser({ onboardingCompleted: true, ...profileData });
        // Hide onboarding immediately
        setShowOnboarding(false);
        // Refresh auth state to ensure onboarding status is updated
        await checkAuth();
        onComplete();
        onClose();
      }
    } catch (error) {
      console.error('Onboarding error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep === 'interests') setCurrentStep('profile');
    else if (currentStep === 'users') setCurrentStep('interests');
    else if (currentStep === 'pages') setCurrentStep('users');
    else if (currentStep === 'complete') setCurrentStep('pages');
  };

  const handleSkip = async () => {
    try {
      setIsLoading(true);
      await onboardingService.skip();
      // Update user with onboardingCompleted flag - this persists in localStorage
      updateUser({ onboardingCompleted: true });
      // Hide onboarding immediately
      setShowOnboarding(false);
      // Refresh auth state to ensure onboarding status is updated
      await checkAuth();
      onComplete();
      onClose();
    } catch (error) {
      console.error('Skip onboarding error:', error);
      // Even if API call fails, close the modal and mark as completed locally
      updateUser({ onboardingCompleted: true });
      setShowOnboarding(false);
      onComplete();
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = () => {
    if (currentStep === 'profile') {
      return profileData.username.length >= 3 && 
             profileData.bio.trim().length >= 10 && 
             profileData.skills.length >= 3;
    }
    if (currentStep === 'interests') return selectedTags.length >= 3;
    if (currentStep === 'users') return selectedUsers.length >= 1;
    if (currentStep === 'pages') return selectedPages.length >= 1;
    return true;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10%',
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            >
              🎉
            </div>
          ))}
        </div>
      )}

      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleSkip} />

      {/* Modal */}
      <div className="relative w-full max-w-3xl max-h-[85vh] overflow-hidden">
        <GlassCard className="p-0">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                  <Sparkles className="text-white" size={18} />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold">Welcome to DevCommunity!</h2>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    Let's personalize your experience
                  </p>
                </div>
              </div>
              <button
                onClick={handleSkip}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm"
              >
                Skip for now
              </button>
            </div>

            {/* Progress Bar */}
            <div className="relative">
              <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {/* Step Indicators */}
              <div className="flex justify-between mt-3">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`flex flex-col items-center ${
                      index <= currentStepIndex ? 'opacity-100' : 'opacity-40'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center mb-1 transition-all duration-300 ${
                        index < currentStepIndex
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                          : index === currentStepIndex
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                          : 'bg-gray-300 dark:bg-gray-700'
                      }`}
                    >
                      {index < currentStepIndex ? (
                        <Check size={12} className="text-white" />
                      ) : (
                        <span className="text-white text-[10px] sm:text-xs font-bold">{index + 1}</span>
                      )}
                    </div>
                    <span className="text-[10px] sm:text-xs font-medium text-center">{step.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-5 overflow-y-auto max-h-[55vh]">
            {isLoadingData ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Loading your data...</p>
                </div>
              </div>
            ) : (
              <>
                {currentStep === 'profile' && (
                  <ProfileSetup
                    key={`profile-${user?.id}-${profileData.username}`}
                    initialUsername={profileData.username}
                    initialBio={profileData.bio}
                    initialSkills={profileData.skills}
                    onSave={setProfileData}
                  />
                )}
                {currentStep === 'interests' && (
                  <InterestSelection
                    selectedTags={selectedTags}
                    onTagsChange={setSelectedTags}
                  />
                )}
                {currentStep === 'users' && (
                  <UserSuggestions
                    selectedUsers={selectedUsers}
                    onUsersChange={setSelectedUsers}
                  />
                )}
                {currentStep === 'pages' && (
                  <PageSuggestions
                    selectedPages={selectedPages}
                    onPagesChange={setSelectedPages}
                  />
                )}
                {currentStep === 'complete' && (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4 animate-bounce">🎉</div>
                    <h3 className="text-3xl font-bold mb-2">All Set!</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Your feed is now personalized based on your interests
                    </p>
                    <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                      <div className="p-4 rounded-xl bg-blue-500/10">
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {selectedTags.length}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Topics</p>
                      </div>
                      <div className="p-4 rounded-xl bg-green-500/10">
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {selectedUsers.length}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Following</p>
                      </div>
                      <div className="p-4 rounded-xl bg-purple-500/10">
                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {selectedPages.length}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Communities</p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-5 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={currentStepIndex === 0}
              className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
              <span className="hidden sm:inline">Back</span>
            </button>

            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center flex-1 mx-2">
              {currentStep === 'profile' && 'Complete your profile'}
              {currentStep === 'interests' && '3+ topics'}
              {currentStep === 'users' && '1+ person'}
              {currentStep === 'pages' && '1+ community'}
              {currentStep === 'complete' && 'Ready!'}
            </div>

            <button
              onClick={handleNext}
              disabled={!canProceed() || isLoading}
              className="flex items-center gap-1 sm:gap-2 px-4 sm:px-6 py-2 text-sm rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                'Loading...'
              ) : currentStep === 'complete' ? (
                'Get Started'
              ) : (
                <>
                  Next
                  <ChevronRight size={16} />
                </>
              )}
            </button>
          </div>
        </GlassCard>
      </div>

      {/* CSS for confetti animation */}
      <style>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti 3s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
}

