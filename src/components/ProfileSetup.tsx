import { useState, useEffect } from 'react';
import { User, AtSign, FileText, Check, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3333/api';

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
  onSave 
}: ProfileSetupProps) {
  const [username, setUsername] = useState(initialUsername);
  const [bio, setBio] = useState(initialBio);
  const [skills, setSkills] = useState<string[]>(initialSkills);
  const [skillInput, setSkillInput] = useState('');
  const [usernameValid, setUsernameValid] = useState<boolean | null>(initialUsername ? true : null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState('');

  // Sync with parent component changes
  useEffect(() => {
    if (username !== initialUsername || bio !== initialBio || JSON.stringify(skills) !== JSON.stringify(initialSkills)) {
      onSave({ username, bio, skills });
    }
  }, [username, bio, skills]);

  // Common skills suggestions
  const suggestedSkills = [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Solidity',
    'Rust', 'Go', 'Docker', 'Kubernetes', 'AWS', 'Web3', 'Smart Contracts',
    'UI/UX Design', 'DevOps', 'Blockchain', 'DeFi', 'NFT', 'DAO'
  ];

  // Debounce username validation
  useEffect(() => {
    if (!username || username === initialUsername) {
      setUsernameValid(true);
      return;
    }

    const timer = setTimeout(async () => {
      await checkUsernameAvailability(username);
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  const checkUsernameAvailability = async (usernameToCheck: string) => {
    if (usernameToCheck.length < 3) {
      setUsernameError('Username must be at least 3 characters');
      setUsernameValid(false);
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(usernameToCheck)) {
      setUsernameError('Username can only contain letters, numbers, and underscores');
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
        setUsernameError('Username is already taken');
      }
    } catch (error) {
      console.error('Error checking username:', error);
      setUsernameValid(false);
      setUsernameError('Error checking username availability');
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

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleSubmit = () => {
    if (usernameValid && username && bio.trim()) {
      onSave({ username, bio, skills });
    }
  };

  const isValid = usernameValid && username.length >= 3 && bio.trim().length >= 10 && skills.length >= 3;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 mb-4">
          <User className="text-white" size={32} />
        </div>
        <h3 className="text-2xl font-bold mb-2">Complete Your Profile</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Tell us about yourself to personalize your experience
        </p>
      </div>

      {/* Username Field */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-semibold">
          <AtSign size={16} />
          Username
        </label>
        <div className="relative">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
            placeholder="your_username"
            maxLength={30}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isCheckingUsername && <Loader2 size={20} className="animate-spin text-gray-400" />}
            {!isCheckingUsername && usernameValid === true && (
              <Check size={20} className="text-green-500" />
            )}
            {!isCheckingUsername && usernameValid === false && (
              <AlertCircle size={20} className="text-red-500" />
            )}
          </div>
        </div>
        {usernameError && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <AlertCircle size={12} />
            {usernameError}
          </p>
        )}
        {usernameValid && username && !usernameError && (
          <p className="text-xs text-green-500 flex items-center gap-1">
            <Check size={12} />
            Username is available!
          </p>
        )}
      </div>

      {/* Bio Field */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-semibold">
          <FileText size={16} />
          Bio
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell us about yourself... (min 10 characters)"
          rows={4}
          maxLength={500}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-all resize-none"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>{bio.length >= 10 ? '✓' : '✗'} At least 10 characters</span>
          <span>{bio.length}/500</span>
        </div>
      </div>

      {/* Skills Field */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-semibold">
          <User size={16} />
          Skills (select at least 3)
        </label>
        
        {/* Selected Skills */}
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-gradient-to-r from-blue-500 to-cyan-500 text-white cursor-pointer hover:from-blue-600 hover:to-cyan-600 transition-all"
                onClick={() => handleRemoveSkill(skill)}
              >
                {skill}
                <span className="text-xs">×</span>
              </span>
            ))}
          </div>
        )}

        {/* Skill Input */}
        <div className="relative">
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddSkill(skillInput);
              }
            }}
            placeholder="Type a skill and press Enter..."
            disabled={skills.length >= 10}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
          {skills.length >= 10 && (
            <p className="text-xs text-amber-500 mt-1">Maximum 10 skills allowed</p>
          )}
        </div>

        {/* Suggested Skills */}
        <div className="space-y-2">
          <p className="text-xs text-gray-500">Popular skills:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedSkills
              .filter(skill => !skills.includes(skill))
              .slice(0, 12)
              .map((skill) => (
                <button
                  key={skill}
                  onClick={() => handleAddSkill(skill)}
                  disabled={skills.length >= 10}
                  className="px-3 py-1 rounded-full text-xs border border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  + {skill}
                </button>
              ))}
          </div>
        </div>
        
        <p className="text-xs text-gray-500">
          {skills.length >= 3 ? '✓' : '✗'} At least 3 skills required ({skills.length}/10)
        </p>
      </div>

      {/* Submit Info */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          {isValid ? (
            <>
              <Check size={16} className="text-green-500" />
              <span>Ready to continue!</span>
            </>
          ) : (
            <>
              <AlertCircle size={16} className="text-amber-500" />
              <span>Please complete all required fields</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

