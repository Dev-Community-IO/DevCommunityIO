import { useState, useRef, useEffect } from 'react';
import { Check, FileText, Trophy, Calendar, Briefcase, Upload, X } from 'lucide-react';
import { MarkdownEditor } from './MarkdownEditor';
import { Avatar } from './Avatar';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import postsService from '../services/api/posts.service';
import pagesService from '../services/api/pages.service';

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

const defaultTags = [
  'staking', 'defi', 'ethereum', 'security', 'solidity', 'best-practices',
  'nft', 'royalties', 'marketplaces', 'dao', 'treasury', 'governance',
  'hack', 'bridge', 'optimization', 'gas', 'web3', 'smart-contracts',
  'blockchain', 'layer2', 'zk-rollups', 'consensus', 'evm', 'protocol'
];

// Generate a random color for custom tags
const getRandomTagColor = () => {
  const colors = [
    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
    'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export function CreatePost({ onBack, pageId }: CreatePostProps) {
  const [contentType, setContentType] = useState<ContentType>('post');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [tagsList, setTagsList] = useState<{ tag: string; color: string }[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [availableTags, setAvailableTags] = useState(defaultTags);
  const [newTagsWithColors, setNewTagsWithColors] = useState<Record<string, string>>({});
  const [selectedPageId, setSelectedPageId] = useState<string | null>(pageId || null);
  const [postOrigin, setPostOrigin] = useState('');
  const [originSource, setOriginSource] = useState('');
  const [originUrl, setOriginUrl] = useState('');
  const [userPagesData, setUserPagesData] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch user's pages on mount
  useEffect(() => {
    const fetchUserPages = async () => {
      if (!user) return;
      
      try {
        const response = await pagesService.getMyPostablePages();
        setUserPagesData(response.pages || []);
      } catch (error) {
        console.error('Failed to fetch user pages:', error);
        setUserPagesData([]);
      }
    };
    
    fetchUserPages();
  }, [user]);

  const filteredTags = tagInput.trim()
    ? availableTags.filter(tag =>
        tag.toLowerCase().includes(tagInput.toLowerCase()) &&
        !tagsList.some(t => t.tag === tag)
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

  // Filter pages where user can post (owner, moderator, or admin only)
  const canPostPages = userPagesData.filter(page => 
    page.role === 'owner' || page.role === 'moderator' || page.role === 'admin'
  );

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
    
    // Check if tag is already in the list
    if (tagsList.some(t => t.tag === tag)) {
      return;
    }

    // Get color for the tag (from saved colors or generate new)
    let tagColor = newTagsWithColors[tag];
    if (!tagColor) {
      tagColor = getRandomTagColor();
      setNewTagsWithColors({ ...newTagsWithColors, [tag]: tagColor });
    }

    // Add to available tags if it's a new tag
    if (!availableTags.includes(tag)) {
      setAvailableTags([...availableTags, tag]);
    }

    setTagsList([...tagsList, { tag, color: tagColor }]);
    setTagInput('');
    setShowTagSuggestions(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTagsList(tagsList.filter(t => t.tag !== tagToRemove));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (tagsList.length >= MAX_TAGS) return;

      const normalizedInput = tagInput.toLowerCase().trim();
      
      // Check if exact match exists in available tags
      const matchedTag = availableTags.find(tag =>
        tag.toLowerCase() === normalizedInput
      );

      if (matchedTag) {
        handleAddTag(matchedTag);
      } else if (filteredTags.length > 0) {
        // Use first filtered suggestion if available
        handleAddTag(filteredTags[0]);
      } else {
        // Create new tag from input
        handleAddTag(normalizedInput);
      }
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setSubmitError('Title is required');
      return;
    }

    if (!content.trim()) {
      setSubmitError('Content is required');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const baseData: any = { 
        title, 
        content, 
        category: contentType,
        tags: tagsList.map(t => t.tag), // Extract just tag names for submission
        coverImageUrl: coverImage || null,
        pageId: selectedPageId || null,
        status: 'published',
        postOrigin: postOrigin || null,
        originSource: postOrigin ? originSource : null,
        originUrl: postOrigin ? originUrl : null
      };

      // Add contentType-specific fields
      if (contentType === 'hackathon') {
        baseData.prize = prize;
        baseData.startDate = startDate;
        baseData.endDate = endDate;
        baseData.difficulty = difficulty;
      } else if (contentType === 'event') {
        baseData.eventDate = eventDate;
        baseData.eventTime = eventTime;
        baseData.location = location;
        baseData.eventType = eventType;
        baseData.maxAttendees = maxAttendees;
        baseData.ticketPrice = ticketPrice;
      } else if (contentType === 'opportunity') {
        baseData.company = company;
        baseData.salary = salary;
        baseData.jobType = jobType;
        baseData.experience = experience;
        baseData.remote = remote;
      }

      const createdPost = await postsService.createPost(baseData);
      
      // Navigate to the created post (replace to remove create-post from history)
      // Pass post data via state for instant loading
      navigate(`/post/${createdPost.slug}`, { 
        replace: true,
        state: { post: createdPost }
      });
      
      // Scroll to top for better UX
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: any) {
      console.error('Failed to create post:', error);
      setSubmitError(error.response?.data?.message || 'Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 animate-fade-in pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="relative">
          {/* Main Content Area - Responsive Width */}
            <div className="lg:mr-80 space-y-6">

              {/* Post As Selection - Mobile Only */}
              {!pageId && canPostPages.length > 0 && (
                <div className="lg:hidden bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-800">
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

                    {canPostPages.map((page: any) => (
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
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                Title <span className="text-xs text-gray-400">({title.length}/{TITLE_MAX_LENGTH})</span>
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
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 space-y-4">
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
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 space-y-4">
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
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 space-y-4">
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

            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
              <label className="block text-base font-bold mb-3 text-gray-900 dark:text-white">
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

            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
              <label className="block text-base font-bold mb-3 text-gray-900 dark:text-white">Description</label>
              <MarkdownEditor
                value={content}
                onChange={setContent}
                placeholder={`Write your ${contentType} description... (Markdown supported)`}
                minHeight="280px"
              />
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 relative">
              <label className="block text-base font-bold mb-3 text-gray-900 dark:text-white">
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
                  {tagsList.map(({ tag, color }) => (
                    <span
                      key={tag}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${color}`}
                    >
                      #{tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:opacity-70 rounded-full p-0.5 transition-all"
                      >
                        <X size={14} strokeWidth={2.5} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            {/* Sticky Right Sidebar - Desktop Only */}
            <div className="hidden lg:block lg:absolute lg:right-0 lg:top-0 lg:w-72">
              <div className="sticky top-24 space-y-4">
                {/* Content Type Selection - Right Sidebar */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                  <label className="block text-xs font-medium mb-2 text-gray-600 dark:text-gray-400 uppercase tracking-wide">Content Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {contentTypes.map(type => {
                      const Icon = type.icon;
                      const isActive = contentType === type.id;
                      return (
                        <button
                          key={type.id}
                          onClick={() => setContentType(type.id)}
                          className={`flex flex-col items-center gap-1.5 p-2.5 rounded-lg text-xs transition-all ${
                            isActive
                              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                              : 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        >
                          <Icon size={18} strokeWidth={2} />
                          <span className="font-medium">{type.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Post Origin - Right Sidebar */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                  <label className="block text-xs font-medium mb-2 text-gray-600 dark:text-gray-400 uppercase tracking-wide">Post Origin</label>
                  <select
                    value={postOrigin}
                    onChange={(e) => setPostOrigin(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  >
                    <option value="">Select (if any)</option>
                    <option value="original">Original</option>
                    <option value="translated">Translated</option>
                    <option value="reposted">Reposted</option>
                  </select>
                  
                  {(postOrigin === 'translated' || postOrigin === 'reposted') && (
                    <div className="space-y-2 mt-2">
                      <input
                        type="text"
                        value={originSource}
                        onChange={(e) => setOriginSource(e.target.value)}
                        placeholder="Source/author"
                        className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                      <input
                        type="url"
                        value={originUrl}
                        onChange={(e) => setOriginUrl(e.target.value)}
                        placeholder="Source URL"
                        className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </div>
                  )}
                </div>

                {/* Post As Selection - Right Sidebar */}
                {!pageId && canPostPages.length > 0 && (
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                    <label className="block text-xs font-medium mb-2 text-gray-600 dark:text-gray-400 uppercase tracking-wide">Post As</label>
                    <div className="space-y-1.5">
                      <button
                        onClick={() => setSelectedPageId(null)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all ${
                          !selectedPageId
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                            : 'border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <Avatar
                          src="https://api.dicebear.com/7.x/avataaars/svg?seed=Emma"
                          alt="Your Profile"
                          size="sm"
                          className="w-6 h-6"
                        />
                        <span className="flex-1 text-left">Your Profile</span>
                      </button>

                      {canPostPages.map(page => (
                        <button
                          key={page.id}
                          onClick={() => setSelectedPageId(page.id)}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all ${
                            selectedPageId === page.id
                              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                              : 'border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <div className="w-6 h-6 rounded overflow-hidden">
                            <img src={page.logo} alt={page.name} className="w-full h-full object-cover" />
                          </div>
                          <span className="flex-1 text-left">{page.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tips Section */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800/30">
                  <h3 className="text-xs font-medium mb-2 text-gray-600 dark:text-gray-400 uppercase tracking-wide">Tips</h3>
                  <ul className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
                    <li className="flex items-start gap-1.5">
                      <span className="mt-0.5">•</span>
                      <span>Use clear, descriptive titles</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="mt-0.5">•</span>
                      <span>Add relevant tags</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="mt-0.5">•</span>
                      <span>Include a cover image</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="mt-0.5">•</span>
                      <span>Use markdown formatting</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="border-t border-gray-200 dark:border-gray-800 py-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {submitError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
              {submitError}
            </div>
          )}
          <div className="flex gap-3 max-w-2xl">
            <button
              onClick={onBack}
              disabled={isSubmitting}
              className="flex-1 py-3 px-6 rounded-xl font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !title.trim() || !content.trim()}
              className="flex-1 py-3 px-6 rounded-xl font-semibold text-white bg-blue-500 hover:bg-blue-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
