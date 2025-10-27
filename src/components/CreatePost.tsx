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
    <div className="min-h-screen pt-20 px-3 sm:px-4 md:px-6 lg:px-12 xl:px-24 2xl:px-48 animate-fade-in">
      <div className="max-w-4xl mx-auto pb-8">
        <div className="mb-6">
          <Button variant="ghost" icon={ArrowLeft} onClick={onBack}>
            Back to Feed
          </Button>
        </div>

        <GlassCard className="p-6">
          <h1 className="text-2xl font-bold mb-6">Create New Content</h1>

          <div className="space-y-6">
            {/* Content Type Selection */}
            <div>
              <label className="block text-sm font-semibold mb-3">Content Type</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {contentTypes.map(type => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setContentType(type.id)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        contentType === type.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <span className="font-medium text-sm">{type.name}</span>
                      {contentType === type.id && <Check size={16} className="text-blue-500" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Post As Selection */}
            {!pageId && userPages.length > 0 && (
              <div>
                <label className="block text-sm font-semibold mb-2">Post As</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedPageId(null)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                      !selectedPageId
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <Avatar
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=Emma"
                      alt="Your Profile"
                      size="sm"
                      className="w-6 h-6"
                    />
                    <span className="font-medium">Your Profile</span>
                    {!selectedPageId && <Check size={16} className="text-blue-500" />}
                  </button>

                  {userPages.map(page => (
                    <button
                      key={page.id}
                      onClick={() => setSelectedPageId(page.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                        selectedPageId === page.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="w-6 h-6 rounded-md overflow-hidden">
                        <img src={page.logo} alt={page.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="font-medium">{page.name}</span>
                      {selectedPageId === page.id && <Check size={16} className="text-blue-500" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Common Fields */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Title
                <span className="text-xs text-gray-500 ml-2">
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
                className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
              />
            </div>

            {/* Hackathon Specific Fields */}
            {contentType === 'hackathon' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Prize Amount</label>
                    <input
                      type="text"
                      value={prize}
                      onChange={(e) => setPrize(e.target.value)}
                      placeholder="$100,000"
                      className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Difficulty</label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Event Specific Fields */}
            {contentType === 'event' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Event Date</label>
                    <input
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Time</label>
                    <input
                      type="time"
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Location</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="San Francisco, CA or Virtual Event"
                      className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Event Type</label>
                    <select
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
                    >
                      <option value="online">Online</option>
                      <option value="in-person">In-Person</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Max Attendees</label>
                    <input
                      type="number"
                      value={maxAttendees}
                      onChange={(e) => setMaxAttendees(e.target.value)}
                      placeholder="100"
                      className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Ticket Price</label>
                    <input
                      type="text"
                      value={ticketPrice}
                      onChange={(e) => setTicketPrice(e.target.value)}
                      placeholder="Free or $99"
                      className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Opportunity Specific Fields */}
            {contentType === 'opportunity' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Company Name</label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Company Name"
                      className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Salary Range</label>
                    <input
                      type="text"
                      value={salary}
                      onChange={(e) => setSalary(e.target.value)}
                      placeholder="$100k - $150k"
                      className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Job Type</label>
                    <select
                      value={jobType}
                      onChange={(e) => setJobType(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
                    >
                      <option value="full-time">Full-Time</option>
                      <option value="part-time">Part-Time</option>
                      <option value="contract">Contract</option>
                      <option value="internship">Internship</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Experience Level</label>
                    <input
                      type="text"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      placeholder="3+ years"
                      className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="San Francisco, CA or Remote"
                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={remote}
                      onChange={(e) => setRemote(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-sm font-semibold">Remote Position</span>
                  </label>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-semibold mb-2">
                Cover Image
                <span className="text-xs text-gray-500 ml-2">(Optional, max 5MB)</span>
              </label>
              {!coverImage ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-48 rounded-lg bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-white/10 hover:border-blue-500 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-3"
                >
                  <Upload size={32} className="text-gray-400" />
                  <div className="text-center">
                    <p className="text-sm font-medium">Click to upload cover image</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
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
                <div className="relative w-full h-48 rounded-lg overflow-hidden">
                  <img
                    src={coverImage}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={handleRemoveCoverImage}
                    className="absolute top-2 right-2 p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-all duration-300"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              {imageError && (
                <p className="text-red-500 text-xs mt-2">{imageError}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Description</label>
              <MarkdownEditor
                value={content}
                onChange={setContent}
                placeholder={`Write your ${contentType} description... (Markdown supported)`}
                minHeight="300px"
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-semibold mb-2">
                Tags
                <span className="text-xs text-gray-500 ml-2">
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
                className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {showTagSuggestions && filteredTags.length > 0 && tagsList.length < MAX_TAGS && (
                <div className="absolute z-10 w-full mt-1 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 shadow-lg max-h-48 overflow-y-auto">
                  {filteredTags.slice(0, 10).map(tag => (
                    <button
                      key={tag}
                      onClick={() => handleAddTag(tag)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 text-sm"
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
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm"
                    >
                      #{tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-blue-900 dark:hover:text-blue-100"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="primary" onClick={handleSubmit}>
                Publish {contentType.charAt(0).toUpperCase() + contentType.slice(1)}
              </Button>
              <Button variant="secondary" onClick={onBack}>
                Cancel
              </Button>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
