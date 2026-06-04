import { useState, useEffect, useRef } from 'react';
import { AtSign, FileText, Check, AlertCircle, Loader2, X } from 'lucide-react';
import { BIO_MAX_LENGTH } from '../constants/bio';
import axios from 'axios';
import { getApiBaseUrl } from '../utils/apiUrl';
import {
  onboardingChipClass,
  onboardingChipSelectedClass,
  onboardingHintClass,
  onboardingHintErrClass,
  onboardingHintOkClass,
  onboardingInputClass,
  onboardingLabelClass,
  onboardingStepDescClass,
  onboardingStepTitleClass,
  onboardingTextareaClass,
} from './onboardingChrome';

const API_BASE_URL = getApiBaseUrl();

interface ProfileSetupProps {
  initialUsername?: string;
  initialBio?: string;
  initialSkills?: string[];
  onSave: (data: { username: string; bio: string; skills: string[] }) => void;
}

export function ProfileSetup({
  initialUsername = '',
  initialBio = '',
  initialSkills = [],
  onSave,
}: ProfileSetupProps) {
  const [username, setUsername] = useState(initialUsername);
  const [bio, setBio] = useState(initialBio);
  const [skills, setSkills] = useState<string[]>(initialSkills);
  const [skillInput, setSkillInput] = useState('');
  const [usernameValid, setUsernameValid] = useState<boolean | null>(initialUsername ? true : null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState('');

  const lastSavedRef = useRef({ username: initialUsername, bio: initialBio, skills: initialSkills });
  const currentValuesRef = useRef({ username, bio, skills });
  const isMountedRef = useRef(false);

  useEffect(() => {
    currentValuesRef.current = { username, bio, skills };
  }, [username, bio, skills]);

  useEffect(() => {
    if (!isMountedRef.current) {
      setUsername(initialUsername);
      setBio(initialBio);
      setSkills(initialSkills);
      setUsernameValid(initialUsername ? true : null);
      setUsernameError('');
      lastSavedRef.current = { username: initialUsername, bio: initialBio, skills: initialSkills };
      currentValuesRef.current = { username: initialUsername, bio: initialBio, skills: initialSkills };
      isMountedRef.current = true;
      return;
    }

    const current = currentValuesRef.current;
    if (initialUsername !== lastSavedRef.current.username && initialUsername !== current.username) {
      setUsername(initialUsername);
    }
    if (initialBio !== lastSavedRef.current.bio && initialBio !== current.bio) {
      setBio(initialBio);
    }
    const initialSkillsStr = JSON.stringify(initialSkills);
    const lastSavedSkillsStr = JSON.stringify(lastSavedRef.current.skills);
    const currentSkillsStr = JSON.stringify(current.skills);
    if (initialSkillsStr !== lastSavedSkillsStr && initialSkillsStr !== currentSkillsStr) {
      setSkills(initialSkills);
    }
  }, [initialUsername, initialBio, initialSkills]);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    const hasChanges =
      username !== lastSavedRef.current.username ||
      bio !== lastSavedRef.current.bio ||
      JSON.stringify(skills) !== JSON.stringify(lastSavedRef.current.skills);

    if (hasChanges) {
      saveTimeoutRef.current = setTimeout(() => {
        onSave({ username, bio, skills });
        lastSavedRef.current = { username, bio, skills };
      }, 300);
    }

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [username, bio, skills, onSave]);

  const suggestedSkills = [
    'JavaScript',
    'TypeScript',
    'React',
    'Node.js',
    'Python',
    'Solidity',
    'Rust',
    'Go',
    'Docker',
    'Web3',
    'Smart Contracts',
    'DevOps',
    'Blockchain',
  ];

  useEffect(() => {
    if (!username || username === initialUsername) {
      setUsernameValid(true);
      return;
    }

    const timer = setTimeout(async () => {
      await checkUsernameAvailability(username);
    }, 500);

    return () => clearTimeout(timer);
  }, [username, initialUsername]);

  const checkUsernameAvailability = async (usernameToCheck: string) => {
    if (usernameToCheck.length < 3) {
      setUsernameError('At least 3 characters');
      setUsernameValid(false);
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(usernameToCheck)) {
      setUsernameError('Letters, numbers, and underscores only');
      setUsernameValid(false);
      return;
    }

    setIsCheckingUsername(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`${API_BASE_URL}/auth/check-username/${usernameToCheck}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (response.data.available) {
        setUsernameValid(true);
        setUsernameError('');
      } else {
        setUsernameValid(false);
        setUsernameError('Username is taken');
      }
    } catch (error) {
      console.error('Error checking username:', error);
      setUsernameValid(false);
      setUsernameError('Could not verify username');
    } finally {
      setIsCheckingUsername(false);
    }
  };

  const handleAddSkill = (skill: string) => {
    const trimmedSkill = skill.trim();
    if (trimmedSkill && !skills.includes(trimmedSkill) && skills.length < 10) {
      setSkills([...skills, trimmedSkill]);
      setSkillInput('');
    }
  };

  const isValid =
    usernameValid && username.length >= 3 && bio.trim().length >= 10 && skills.length >= 3;

  return (
    <div className="space-y-4">
      <div>
        <h3 className={onboardingStepTitleClass}>Your profile</h3>
        <p className={onboardingStepDescClass}>Help others recognize you on DevCommunity.</p>
      </div>

      <div>
        <label htmlFor="onboarding-username" className={onboardingLabelClass}>
          <AtSign size={11} strokeWidth={2} />
          Username
        </label>
        <div className="relative">
          <input
            id="onboarding-username"
            type="text"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
            }
            placeholder="your_username"
            maxLength={30}
            className={`${onboardingInputClass} pr-9`}
            autoComplete="username"
          />
          <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2">
            {isCheckingUsername && (
              <Loader2 size={14} className="animate-spin text-zinc-400" strokeWidth={2} />
            )}
            {!isCheckingUsername && usernameValid === true && (
              <Check size={14} className="text-emerald-500" strokeWidth={2.5} />
            )}
            {!isCheckingUsername && usernameValid === false && (
              <AlertCircle size={14} className="text-red-500" strokeWidth={2} />
            )}
          </div>
        </div>
        {usernameError ? (
          <p className={`mt-1 ${onboardingHintErrClass}`}>{usernameError}</p>
        ) : usernameValid && username ? (
          <p className={`mt-1 ${onboardingHintOkClass}`}>Available</p>
        ) : (
          <p className={`mt-1 ${onboardingHintClass}`}>3+ characters</p>
        )}
      </div>

      <div>
        <label htmlFor="onboarding-bio" className={onboardingLabelClass}>
          <FileText size={11} strokeWidth={2} />
          Bio
        </label>
        <textarea
          id="onboarding-bio"
          value={bio}
          onChange={(e) => setBio(e.target.value.slice(0, BIO_MAX_LENGTH))}
          placeholder="A short intro — @mentions and #tags welcome."
          rows={3}
          maxLength={BIO_MAX_LENGTH}
          className={onboardingTextareaClass}
        />
        <div className="mt-1 flex justify-between">
          <span className={bio.length >= 10 ? onboardingHintOkClass : onboardingHintClass}>
            {bio.length >= 10 ? '10+ characters' : 'Min. 10 characters'}
          </span>
          <span className={onboardingHintClass}>
            {bio.length}/{BIO_MAX_LENGTH}
          </span>
        </div>
      </div>

      <div>
        <label htmlFor="onboarding-skill" className={onboardingLabelClass}>
          Skills
          <span className="font-normal normal-case tracking-normal text-zinc-400">
            · min. 3
          </span>
        </label>

        {skills.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {skills.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => setSkills(skills.filter((s) => s !== skill))}
                className={onboardingChipSelectedClass}
              >
                {skill}
                <X size={12} strokeWidth={2} />
              </button>
            ))}
          </div>
        )}

        <input
          id="onboarding-skill"
          type="text"
          value={skillInput}
          onChange={(e) => setSkillInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddSkill(skillInput);
            }
          }}
          placeholder="Type a skill, press Enter"
          disabled={skills.length >= 10}
          className={onboardingInputClass}
        />

        <p className={`mt-2 ${onboardingHintClass}`}>Popular</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {suggestedSkills
            .filter((skill) => !skills.includes(skill))
            .map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => handleAddSkill(skill)}
                disabled={skills.length >= 10}
                className={onboardingChipClass}
              >
                + {skill}
              </button>
            ))}
        </div>
        <p className={`mt-1.5 ${skills.length >= 3 ? onboardingHintOkClass : onboardingHintClass}`}>
          {skills.length}/10 selected
        </p>
      </div>

      <p
        className={`flex items-center gap-1.5 border-t border-zinc-100 pt-3 text-xs dark:border-white/[0.06] ${
          isValid ? onboardingHintOkClass : onboardingHintClass
        }`}
      >
        {isValid ? (
          <>
            <Check size={12} strokeWidth={2.5} />
            Ready for the next step
          </>
        ) : (
          <>
            <AlertCircle size={12} strokeWidth={2} />
            Complete the fields above to continue
          </>
        )}
      </p>
    </div>
  );
}
