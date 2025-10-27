import { useState, useRef } from 'react';
import { ArrowLeft, Check, FileText, Trophy, Calendar, Briefcase, Upload, X } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Button } from './Button';
import { MarkdownEditor } from './MarkdownEditor';
import { Avatar } from './Avatar';

interface CreatePostProps {
  onBack: () => void;
  pageId?: string;
  pageName?: string;
  pageLogo?: string;
}

type ContentType = 'post' | 'hackathon' | 'event' | 'opportunity';

const TITLE_MAX_LENGTH = 200;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_TAGS = 5;

const availableTags = [
  'staking', 'defi', 'ethereum', 'security', 'solidity', 'best-practices',
  'nft', 'royalties', 'marketplaces', 'dao', 'treasury', 'governance',
  'hack', 'bridge', 'optimization', 'gas', 'web3', 'smart-contracts',
  'blockchain', 'layer2', 'zk-rollups', 'consensus', 'evm', 'protocol'
];

export function CreatePost({ onBack, pageId, pageName, pageLogo }: CreatePostProps) {
  const [contentType, setContentType] = useState<ContentType>('post');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [tagsList, setTagsList] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(pageId || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredTags = tagInput.trim()
    ? availableTags.filter(tag =>
        tag.toLowerCase().includes(tagInput.toLowerCase()) &&
        !tagsList.includes(tag)
      )
    : [];

  const [prize, setPrize] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [difficulty, setDifficulty] = useState('intermediate');

  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [location, setLocation] = useState('');
  const [eventType, setEventType] = useState('online');
  const [maxAttendees, setMaxAttendees] = useState('');
  const [ticketPrice, setTicketPrice] = useState('');

  const [company, setCompany] = useState('');
  const [salary, setSalary] = useState('');
  const [jobType, setJobType] = useState('full-time');
  const [experience, setExperience] = useState('');
  const [remote, setRemote] = useState(true);

  const userPages = [
    {
      id: '1',
      name: 'Web3 Developers Hub',
      logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=web3dev'
    },
    {
      id: '2',
      name: 'DeFi Research Group',
      logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=defi'
    }
  ];

  const contentTypes = [
    { id: 'post' as ContentType, name: 'Post', icon: FileText, color: 'from-blue-500 to-cyan-500' },
    { id: 'hackathon' as ContentType, name: 'Hackathon', icon: Trophy, color: 'from-yellow-500 to-orange-500' },
    { id: 'event' as ContentType, name: 'Event', icon: Calendar, color: 'from-purple-500 to-pink-500' },
    { id: 'opportunity' as ContentType, name: 'Opportunity', icon: Briefcase, color: 'from-blue-500 to-indigo-500' }
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE) {
      setImageError('Image size must be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setImageError('Please upload a valid image file');
      return;
    }

    setImageError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCoverImage = () => {
    setCoverImage(null);
    setImageError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddTag = (tag: string) => {
    if (tagsList.length >= MAX_TAGS) {
      return;
    }
    if (!tagsList.includes(tag)) {
      setTagsList([...tagsList, tag]);
    }
    setTagInput('');
    setShowTagSuggestions(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTagsList(tagsList.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (tagsList.length >= MAX_TAGS) return;

      const matchedTag = availableTags.find(tag =>
        tag.toLowerCase() === tagInput.toLowerCase().trim()
      );

      if (matchedTag) {
        handleAddTag(matchedTag);
      } else if (filteredTags.length > 0) {
        handleAddTag(filteredTags[0]);
      }
    }
  };

  const handleSubmit = () => {
    const baseData = { title, content, tags: tagsList, coverImage, selectedPageId };

    let data = baseData;
    if (contentType === 'hackathon') {
      data = { ...baseData, prize, startDate, endDate, difficulty };
    } else if (contentType === 'event') {
      data = { ...baseData, eventDate, eventTime, location, eventType, maxAttendees, ticketPrice };
    } else if (contentType === 'opportunity') {
      data = { ...baseData, company, salary, jobType, experience, remote };
    }

    console.log({ contentType, ...data });
    onBack();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 animate-fade-in">
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold flex-1">Create New Content</h1>
      </div>

      <div className="max-w-2xl mx-auto pb-24">
        <div className="p-4 space-y-5">

          <div className="space-y-5">
            {/* Content Type Selection */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-800">
              <label className="block text-sm font-bold mb-3 text-gray-900 dark:text-white">Content Type</label>
              <div className="grid grid-cols-2 gap-2.5">
                {contentTypes.map(type => {
                  const Icon = type.icon;
                  const isActive = contentType === type.id;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setContentType(type.id)}
                      className={`relative flex flex-col items-center gap-2 p-3.5 rounded-xl transition-all duration-300 ${
                        isActive
                          ? 'text-white shadow-lg'
                          : 'border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {isActive && (
                        <div className={`absolute inset-0 bg-gradient-to-br ${type.color} rounded-xl`} />
                      )}
                      <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className="relative z-10" />
                      <span className="font-semibold text-xs relative z-10">{type.name}</span>
                      {isActive && <Check size={14} className="absolute top-2 right-2 z-10" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Post As Selection */}
            {!pageId && userPages.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-800">
                <label className="block text-sm font-bold mb-3 text-gray-900 dark:text-white">Post As</label>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedPageId(null)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      !selectedPageId
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30'
                        : 'border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <Avatar
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=Emma"
                      alt="Your Profile"
                      size="sm"
                      className="w-8 h-8 ring-2 ring-white/30"
                    />
                    <span className="font-semibold flex-1 text-left">Your Profile</span>
                    {!selectedPageId && <Check size={18} strokeWidth={2.5} />}
                  </button>

                  {userPages.map(page => (
                    <button
                      key={page.id}
                      onClick={() => setSelectedPageId(page.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                        selectedPageId === page.id
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30'
                          : 'border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg overflow-hidden ring-2 ring-white/30">
                        <img src={page.logo} alt={page.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="font-semibold flex-1 text-left">{page.name}</span>
                      {selectedPageId === page.id && <Check size={18} strokeWidth={2.5} />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Common Fields */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-800">
              <label className="block text-sm font-bold mb-2 text-gray-900 dark:text-white">
                Title
                <span className="text-xs text-gray-400 ml-2 font-normal">
                  ({title.length}/{TITLE_MAX_LENGTH})
                </span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  if (e.target.value.length <= TITLE_MAX_LENGTH) {
                    setTitle(e.target.value);
                  }
                }}
                placeholder={`Enter your ${contentType} title...`}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 text-base"
              />
            </div>

            {/* Hackathon Specific Fields */}
            {contentType === 'hackathon' && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-800 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-900 dark:text-white">Prize Amount</label>
                    <input
                      type="text"
                      value={prize}
                      onChange={(e) => setPrize(e.target.value)}
                      placeholder="$100,000"
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-900 dark:text-white">Difficulty</label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 text-base"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-900 dark:text-white">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-900 dark:text-white">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 text-base"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Event Specific Fields */}
            {contentType === 'event' && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-800 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-900 dark:text-white">Event Date</label>
                    <input
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-900 dark:text-white">Time</label>
                    <input
                      type="time"
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 text-base"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-900 dark:text-white">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="San Francisco, CA or Virtual Event"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 text-base"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-900 dark:text-white">Event Type</label>
                    <select
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 text-base"
                    >
                      <option value="online">Online</option>
                      <option value="in-person">In-Person</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-900 dark:text-white">Max Attendees</label>
                    <input
                      type="number"
                      value={maxAttendees}
                      onChange={(e) => setMaxAttendees(e.target.value)}
                      placeholder="100"
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 text-base"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-900 dark:text-white">Ticket Price</label>
                  <input
                    type="text"
                    value={ticketPrice}
                    onChange={(e) => setTicketPrice(e.target.value)}
                    placeholder="Free or $99"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 text-base"
                  />
                </div>
              </div>
            )}

            {/* Opportunity Specific Fields */}
            {contentType === 'opportunity' && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-800 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-900 dark:text-white">Company Name</label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Company Name"
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-900 dark:text-white">Salary Range</label>
                    <input
                      type="text"
                      value={salary}
                      onChange={(e) => setSalary(e.target.value)}
                      placeholder="$100k - $150k"
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 text-base"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-900 dark:text-white">Job Type</label>
                    <select
                      value={jobType}
                      onChange={(e) => setJobType(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 text-base"
                    >
                      <option value="full-time">Full-Time</option>
                      <option value="part-time">Part-Time</option>
                      <option value="contract">Contract</option>
                      <option value="internship">Internship</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-900 dark:text-white">Experience Level</label>
                    <input
                      type="text"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      placeholder="3+ years"
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 text-base"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-900 dark:text-white">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="San Francisco, CA or Remote"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 text-base"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <input
                      type="checkbox"
                      checked={remote}
                      onChange={(e) => setRemote(e.target.checked)}
                      className="w-5 h-5 rounded-lg border-gray-300 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                    />
                    <span className="text-sm font-bold text-gray-900 dark:text-white">Remote Position</span>
                  </label>
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-800">
              <label className="block text-sm font-bold mb-2 text-gray-900 dark:text-white">
                Cover Image
                <span className="text-xs text-gray-400 ml-2 font-normal">(Optional, max 5MB)</span>
              </label>
              {!coverImage ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-44 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-3"
                >
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500">
                    <Upload size={28} className="text-white" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Click to upload cover image</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="relative w-full h-44 rounded-xl overflow-hidden">
                  <img
                    src={coverImage}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={handleRemoveCoverImage}
                    className="absolute top-3 right-3 p-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white shadow-lg transition-all duration-300"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              {imageError && (
                <p className="text-red-500 text-xs mt-2 font-medium">{imageError}</p>
              )}
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-800">
              <label className="block text-sm font-bold mb-2 text-gray-900 dark:text-white">Description</label>
              <MarkdownEditor
                value={content}
                onChange={setContent}
                placeholder={`Write your ${contentType} description... (Markdown supported)`}
                minHeight="280px"
              />
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-800 relative">
              <label className="block text-sm font-bold mb-2 text-gray-900 dark:text-white">
                Tags
                <span className="text-xs text-gray-400 ml-2 font-normal">
                  ({tagsList.length}/{MAX_TAGS})
                </span>
              </label>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => {
                  setTagInput(e.target.value);
                  setShowTagSuggestions(true);
                }}
                onKeyDown={handleTagInputKeyDown}
                onFocus={() => setShowTagSuggestions(true)}
                onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
                placeholder={tagsList.length >= MAX_TAGS ? "Maximum tags reached" : "Type to search tags..."}
                disabled={tagsList.length >= MAX_TAGS}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-base"
              />
              {showTagSuggestions && filteredTags.length > 0 && tagsList.length < MAX_TAGS && (
                <div className="absolute z-10 left-4 right-4 mt-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl max-h-48 overflow-y-auto">
                  {filteredTags.slice(0, 10).map(tag => (
                    <button
                      key={tag}
                      onClick={() => handleAddTag(tag)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 text-sm font-medium border-b border-gray-100 dark:border-gray-700 last:border-0"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              )}
              {tagsList.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {tagsList.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-semibold shadow-sm"
                    >
                      #{tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:bg-white/20 rounded-full p-0.5 transition-all"
                      >
                        <X size={14} strokeWidth={2.5} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 shadow-2xl">
        <div className="max-w-2xl mx-auto flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 py-3.5 px-6 rounded-xl font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-3.5 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg shadow-blue-500/30 transition-all duration-300"
          >
            Publish {contentType.charAt(0).toUpperCase() + contentType.slice(1)}
          </button>
        </div>
      </div>
    </div>
  );
}
