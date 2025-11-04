import { useState, useEffect } from 'react';
import { X, Loader, Save, Upload, AlertCircle } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { MarkdownEditor } from './MarkdownEditor';
import { Post } from '../types';
import postsService from '../services/api/posts.service';
import hackathonsService from '../services/api/hackathons.service';
import eventsService from '../services/api/events.service';
import opportunitiesService from '../services/api/opportunities.service';

interface EditPostModalProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const TITLE_MAX_LENGTH = 200;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export function EditPostModal({ post, isOpen, onClose, onSuccess }: EditPostModalProps) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string>('');
  
  // Common fields
  const [title, setTitle] = useState(post.title || '');
  const [content, setContent] = useState(post.content || '');
  const [coverImage, setCoverImage] = useState<string | null>(post.coverImageUrl || post.coverImage || null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  // Hackathon fields
  const [hackathonData, setHackathonData] = useState<any>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [prizePool, setPrizePool] = useState('');
  const [requirements, setRequirements] = useState<string[]>([]);
  
  // Event fields
  const [eventData, setEventData] = useState<any>(null);
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [location, setLocation] = useState('');
  const [eventType, setEventType] = useState<'online' | 'in-person' | 'hybrid'>('online');
  const [maxAttendees, setMaxAttendees] = useState('');
  const [price, setPrice] = useState('Free');
  
  // Opportunity fields
  const [opportunityData, setOpportunityData] = useState<any>(null);
  const [companyName, setCompanyName] = useState('');
  const [salary, setSalary] = useState('');
  const [jobType, setJobType] = useState<'full-time' | 'part-time' | 'contract' | 'internship'>('full-time');
  const [experience, setExperience] = useState('');
  const [remote, setRemote] = useState(true);

  useEffect(() => {
    if (!isOpen || !post) return;
    
    const fetchFullData = async () => {
      try {
        setFetching(true);
        setError('');
        
        // Fetch full post data
        const fullPost = await postsService.getPostBySlug(post.slug);
        
        // Set common fields
        setTitle(fullPost.title || '');
        setContent(fullPost.content || '');
        setCoverImage(fullPost.coverImageUrl || fullPost.coverImage || null);
        setTags(fullPost.tags?.map((t: any) => t.name || t) || []);
        
        // Fetch type-specific data based on category
        // Check if post already includes the related data (from backend preload)
        if (fullPost.category === 'hackathon') {
          // Try to find hackathon in post data first
          let hackathon = (fullPost as any).hackathon;
          
          // If not found, fetch from API
          if (!hackathon && fullPost.id) {
            try {
              const hackathons = await hackathonsService.getHackathons({ limit: 1000 });
              hackathon = Array.isArray(hackathons.data) 
                ? hackathons.data.find((h: any) => h.postId === fullPost.id || h.post?.id === fullPost.id)
                : hackathons.hackathons?.find((h: any) => h.postId === fullPost.id || h.post?.id === fullPost.id);
            } catch (e) {
              console.error('Failed to fetch hackathon data:', e);
            }
          }
          
          if (hackathon) {
            setHackathonData(hackathon);
            setStartDate(hackathon.startDate ? new Date(hackathon.startDate).toISOString().split('T')[0] : '');
            setEndDate(hackathon.endDate ? new Date(hackathon.endDate).toISOString().split('T')[0] : '');
            setPrizePool(hackathon.prizePool?.toString() || hackathon.prize?.toString() || '');
            setRequirements(Array.isArray(hackathon.requirements) ? hackathon.requirements : []);
          }
        } else if (fullPost.category === 'event') {
          // Try to find event in post data first
          let event = (fullPost as any).event;
          
          // If not found, fetch from API
          if (!event && fullPost.id) {
            try {
              const events = await eventsService.getEvents({ limit: 1000 });
              event = Array.isArray(events.data)
                ? events.data.find((e: any) => e.postId === fullPost.id || e.post?.id === fullPost.id)
                : events.events?.find((e: any) => e.postId === fullPost.id || e.post?.id === fullPost.id);
            } catch (e) {
              console.error('Failed to fetch event data:', e);
            }
          }
          
          if (event) {
            setEventData(event);
            const eventDateTime = new Date(event.date);
            setEventDate(eventDateTime.toISOString().split('T')[0] || '');
            setEventTime(event.time || eventDateTime.toTimeString().slice(0, 5) || '');
            setLocation(event.location || '');
            setEventType(event.type || 'online');
            setMaxAttendees(event.maxAttendees?.toString() || '');
            setPrice(event.price || 'Free');
          }
        } else if (fullPost.category === 'opportunity') {
          // Try to find opportunity in post data first
          let opportunity = (fullPost as any).opportunity;
          
          // If not found, fetch from API
          if (!opportunity && fullPost.id) {
            try {
              const opportunities = await opportunitiesService.getOpportunities({ limit: 1000 });
              opportunity = Array.isArray(opportunities.data)
                ? opportunities.data.find((o: any) => o.postId === fullPost.id || o.post?.id === fullPost.id)
                : opportunities.opportunities?.find((o: any) => o.postId === fullPost.id || o.post?.id === fullPost.id);
            } catch (e) {
              console.error('Failed to fetch opportunity data:', e);
            }
          }
          
          if (opportunity) {
            setOpportunityData(opportunity);
            setCompanyName(opportunity.companyName || '');
            setSalary(opportunity.salary || opportunity.salaryRange || '');
            setJobType(opportunity.type || 'full-time');
            setExperience(opportunity.experience || '');
            setRemote(opportunity.remote !== undefined ? opportunity.remote : true);
          }
        }
      } catch (err: any) {
        console.error('Failed to fetch post data:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load post data');
      } finally {
        setFetching(false);
      }
    };
    
    fetchFullData();
  }, [isOpen, post]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE) {
      setError('Image size must be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file');
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed) && tags.length < 5) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Update post
      const updateData: any = {
        title: title.trim(),
        content: content.trim(),
        tags: tags,
      };

      if (coverImage && coverImage.startsWith('data:image/')) {
        updateData.coverImageUrl = coverImage;
      } else if (coverImage) {
        updateData.coverImageUrl = coverImage;
      }

      await postsService.updatePost(post.id, updateData);

      // Update type-specific data
      if (post.category === 'hackathon' && hackathonData) {
        await hackathonsService.updateHackathon(hackathonData.id, {
          title: title.trim(),
          description: content.trim(),
          startDate,
          endDate,
          prizePool: prizePool ? parseFloat(prizePool) : undefined,
          requirements,
          imageUrl: coverImage?.startsWith('http') ? coverImage : undefined,
        });
      } else if (post.category === 'event' && eventData) {
        const eventDateTime = new Date(`${eventDate}T${eventTime}`);
        await eventsService.updateEvent(eventData.id, {
          title: title.trim(),
          description: content.trim(),
          date: eventDateTime.toISOString(),
          time: eventTime,
          location,
          type: eventType,
          maxAttendees: maxAttendees ? parseInt(maxAttendees) : undefined,
          price,
          imageUrl: coverImage?.startsWith('http') ? coverImage : undefined,
        });
      } else if (post.category === 'opportunity' && opportunityData) {
        await opportunitiesService.updateOpportunity(opportunityData.id, {
          title: title.trim(),
          description: content.trim(),
          companyName,
          location,
          type: jobType,
          salary,
          experience,
          remote,
          logoUrl: coverImage?.startsWith('http') ? coverImage : undefined,
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to update post:', err);
      setError(err.response?.data?.message || err.message || 'Failed to update post');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <GlassCard className="w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold">Edit {post.category === 'hackathon' ? 'Hackathon' : post.category === 'event' ? 'Event' : post.category === 'opportunity' ? 'Opportunity' : 'Post'}</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          {fetching ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="animate-spin text-blue-500" size={32} />
            </div>
          ) : (
            <div className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
                  <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Title <span className="text-xs text-gray-500">({title.length}/{TITLE_MAX_LENGTH})</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    if (e.target.value.length <= TITLE_MAX_LENGTH) {
                      setTitle(e.target.value);
                    }
                  }}
                  className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium mb-2">Content</label>
                <MarkdownEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Write your content here..."
                />
              </div>

              {/* Cover Image */}
              <div>
                <label className="block text-sm font-medium mb-2">Cover Image</label>
                {coverImage ? (
                  <div className="relative">
                    <img src={coverImage} alt="Cover" className="w-full h-48 object-cover rounded-lg" />
                    <button
                      onClick={() => setCoverImage(null)}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                    <Upload size={24} className="text-gray-400 mr-2" />
                    <span className="text-gray-600 dark:text-gray-400">Click to upload image</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                )}
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium mb-2">Tags ({tags.length}/5)</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder="Add tag..."
                    className="flex-1 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                  <button
                    onClick={handleAddTag}
                    disabled={tags.length >= 5}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm flex items-center gap-2"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Hackathon Fields */}
              {post.category === 'hackathon' && hackathonData && (
                <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h3 className="font-semibold">Hackathon Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Start Date</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">End Date</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Prize Pool</label>
                      <input
                        type="number"
                        value={prizePool}
                        onChange={(e) => setPrizePool(e.target.value)}
                        placeholder="0"
                        className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Event Fields */}
              {post.category === 'event' && eventData && (
                <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h3 className="font-semibold">Event Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Date</label>
                      <input
                        type="date"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Time</label>
                      <input
                        type="time"
                        value={eventTime}
                        onChange={(e) => setEventTime(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Location</label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Event location"
                        className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Type</label>
                      <select
                        value={eventType}
                        onChange={(e) => setEventType(e.target.value as 'online' | 'in-person' | 'hybrid')}
                        className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                      >
                        <option value="online">Online</option>
                        <option value="in-person">In-Person</option>
                        <option value="hybrid">Hybrid</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Max Attendees</label>
                      <input
                        type="number"
                        value={maxAttendees}
                        onChange={(e) => setMaxAttendees(e.target.value)}
                        placeholder="Unlimited"
                        className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Price</label>
                      <input
                        type="text"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="Free"
                        className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Opportunity Fields */}
              {post.category === 'opportunity' && opportunityData && (
                <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h3 className="font-semibold">Job Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Company Name</label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Job Type</label>
                      <select
                        value={jobType}
                        onChange={(e) => setJobType(e.target.value as 'full-time' | 'part-time' | 'contract' | 'internship')}
                        className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                      >
                        <option value="full-time">Full-Time</option>
                        <option value="part-time">Part-Time</option>
                        <option value="contract">Contract</option>
                        <option value="internship">Internship</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Salary</label>
                      <input
                        type="text"
                        value={salary}
                        onChange={(e) => setSalary(e.target.value)}
                        placeholder="Salary range"
                        className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Experience</label>
                      <input
                        type="text"
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        placeholder="e.g., mid-level"
                        className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={remote}
                        onChange={(e) => setRemote(e.target.checked)}
                        className="w-4 h-4"
                      />
                      <label className="text-sm font-medium">Remote Position</label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-4 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || fetching || !title.trim()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            {loading ? (
              <>
                <Loader className="animate-spin" size={18} />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </GlassCard>
    </div>
  );
}

