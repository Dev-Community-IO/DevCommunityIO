import { useState, useRef, useEffect } from 'react';
import { Check, FileText, Trophy, Calendar, Briefcase, Upload, X, Plus, Trash2, Award, AlertCircle, TrendingUp, Star, Hash, UserPlus } from 'lucide-react';
import { MarkdownEditor } from './MarkdownEditor';
import { Avatar } from './Avatar';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import postsService from '../services/api/posts.service';
import pagesService from '../services/api/pages.service';
import hackathonsService from '../services/api/hackathons.service';
import eventsService from '../services/api/events.service';
import opportunitiesService from '../services/api/opportunities.service';
import adminService from '../services/api/admin.service';
import tagsService, { Tag } from '../services/api/tags.service';

interface CreatePostProps {
  onBack: () => void;
  pageId?: string;
  pageName?: string;
  pageLogo?: string;
  editPostId?: string;
  initialContentType?: 'post' | 'hackathon' | 'event' | 'opportunity';
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

export function CreatePost({ onBack, pageId, editPostId, initialContentType }: CreatePostProps) {
  // Initialize contentType from prop or default to 'post'
  const [contentType, setContentType] = useState<ContentType>(
    initialContentType && ['post', 'hackathon', 'event', 'opportunity'].includes(initialContentType)
      ? initialContentType
      : 'post'
  );
  const [isEditMode, setIsEditMode] = useState(false);

  // Update contentType when initialContentType prop changes (e.g., from URL query param)
  useEffect(() => {
    if (initialContentType && !isEditMode && ['post', 'hackathon', 'event', 'opportunity'].includes(initialContentType)) {
      setContentType(initialContentType);
    }
  }, [initialContentType, isEditMode]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [companyLogoImage, setCompanyLogoImage] = useState<string | null>(null);
  const [companyLogoError, setCompanyLogoError] = useState<string | null>(null);
  const [tagsList, setTagsList] = useState<{ tag: string; color: string }[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [availableTags, setAvailableTags] = useState(defaultTags);
  const [newTagsWithColors, setNewTagsWithColors] = useState<Record<string, string>>({});
  const [tagSuggestions, setTagSuggestions] = useState<Tag[]>([]);
  const [trendingTags, setTrendingTags] = useState<Tag[]>([]);
  const [featuredTags, setFeaturedTags] = useState<Tag[]>([]);
  const [loadingTags, setLoadingTags] = useState(false);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(pageId || null);
  const [postOrigin, setPostOrigin] = useState('');
  const [originSource, setOriginSource] = useState('');
  const [originUrl, setOriginUrl] = useState('');
  const [userPagesData, setUserPagesData] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [reputationRequirements, setReputationRequirements] = useState<Record<string, number>>({});
  const [reputationError, setReputationError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const companyLogoInputRef = useRef<HTMLInputElement>(null);
  const organizerLogoInputRef = useRef<HTMLInputElement>(null);
  const isSubmittingRef = useRef(false);
  const editDataRef = useRef<{ postId: string; hackathonId?: string; eventId?: string; opportunityId?: string } | null>(null);

  // Fetch reputation requirements on mount
  useEffect(() => {
    const fetchReputationRequirements = async () => {
      try {
        const data = await adminService.getReputationRequirements();
        if (data.requirements) {
          setReputationRequirements(data.requirements);
        }
      } catch (error) {
        console.error('Failed to fetch reputation requirements:', error);
      }
    };
    
    fetchReputationRequirements();
  }, []);

  // Fetch trending and featured tags on mount
  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoadingTags(true);
        const [trendingResponse, featuredResponse] = await Promise.all([
          tagsService.getTrendingTags('7d', 20).catch(() => ({ tags: [] })),
          tagsService.getFeaturedTags(15).catch(() => ({ tags: [] }))
        ]);
        
        if (trendingResponse.tags) {
          setTrendingTags(trendingResponse.tags);
        }
        if (featuredResponse.tags) {
          setFeaturedTags(featuredResponse.tags);
          // Also add to available tags
          const tagNames = featuredResponse.tags.map((t: Tag) => t.name);
          setAvailableTags([...new Set([...defaultTags, ...tagNames])]);
        }
      } catch (error) {
        console.error('Failed to fetch tags:', error);
      } finally {
        setLoadingTags(false);
      }
    };
    
    fetchTags();
  }, []);

  // Fetch tag suggestions based on input
  useEffect(() => {
    const fetchTagSuggestions = async () => {
      if (!tagInput.trim() || tagInput.length < 2) {
        setTagSuggestions([]);
        return;
      }

      try {
        setLoadingTags(true);
        const response = await tagsService.getTags({
          search: tagInput.trim(),
          limit: 15
        });
        
        if (response.tags) {
          setTagSuggestions(response.tags);
        }
      } catch (error) {
        console.error('Failed to fetch tag suggestions:', error);
        setTagSuggestions([]);
      } finally {
        setLoadingTags(false);
      }
    };

    // Debounce the search
    const timeoutId = setTimeout(fetchTagSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [tagInput]);

  // Helper function to get page logo URL from database
  // Trust the API response - if logoUrl exists, use it
  const getPageLogoUrl = (page: any): string | null => {
    // Get logo URL from any possible field
    const logoUrl = page.logoUrl || page.logo || null;
    
    // If null or undefined, there's no logo in database
    if (!logoUrl) {
      return null;
    }
    
    // Must be a string
    if (typeof logoUrl !== 'string') {
      return null;
    }
    
    // Trim and check if empty
    const trimmed = logoUrl.trim();
    if (trimmed === '' || trimmed === 'null' || trimmed === 'undefined') {
      return null;
    }
    
    // Return the logo URL - API should return full URLs (S3 URLs) from database
    // Don't filter dicebear URLs here - API should not return them, but if it does, 
    // we'll let the image load and show fallback on error
    return trimmed;
  };

  // Fetch user's pages on mount
  useEffect(() => {
    const fetchUserPages = async () => {
      if (!user) return;
      
      try {
        const response = await pagesService.getMyPostablePages();
        const pages = response.pages || [];
        // Process pages - preserve logoUrl exactly as returned from API
        // API returns null if no logo, or the actual logo URL from database
        const pagesWithLogos = pages.map((page: any) => {
          // Get logoUrl from API response - API should return the actual logo URL from database
          const rawLogoUrl = page.logoUrl || page.logo || null;
          
          // Keep logoUrl if it's a valid non-empty string
          // Don't filter dicebear URLs here - API should not return them anyway
          const logoUrl = rawLogoUrl && 
                         typeof rawLogoUrl === 'string' && 
                         rawLogoUrl.trim() !== '' 
            ? rawLogoUrl.trim()
            : null;
          
          return {
            ...page,
            logoUrl: logoUrl, // Logo URL from database or null
            logo: logoUrl, // Also set logo field for backward compatibility
          };
        });
        
        // Debug: Log what we received from API
        console.log('[CreatePost] Raw API response:', pages);
        console.log('[CreatePost] Processed pages with logos:', pagesWithLogos);
        console.log('[CreatePost] Logo URLs summary:', pagesWithLogos.map((p: any) => ({ 
          name: p.name, 
          logoUrl: p.logoUrl, 
          hasLogo: !!p.logoUrl 
        })));
        
        setUserPagesData(pagesWithLogos);
      } catch (error) {
        console.error('Failed to fetch user pages:', error);
        setUserPagesData([]);
      }
    };
    
    fetchUserPages();
  }, [user]);

  // Load post data for edit mode
  useEffect(() => {
    if (!editPostId) return;
    
    const loadPostData = async () => {
      try {
        setIsLoading(true);
        const post = await postsService.getPost(editPostId);
        
        // Set common fields
        setTitle(post.title || '');
        setContent(post.content || '');
        setCoverImage(post.coverImageUrl || null);
        setTagsList(post.tags?.map((t: any) => ({ tag: t.name || t, color: getRandomTagColor() })) || []);
        if (post.pageId) {
          setSelectedPageId(post.pageId);
        }
        // Set post origin fields
        setPostOrigin(post.postOrigin || '');
        setOriginSource(post.originSource || '');
        setOriginUrl(post.originUrl || '');
        
        // Determine content type and set category-specific fields
        const category = post.category?.toLowerCase();
        
        // Set content type first to ensure UI updates correctly
        const contentTypeValue = (category === 'hackathon' || category === 'event' || category === 'opportunity') 
          ? category 
          : 'post';
        setContentType(contentTypeValue as ContentType);
        setIsEditMode(true);
        
        // Store post ID in ref
        editDataRef.current = { postId: post.id };
        
        // Use preloaded relationships from the post object
        if (category === 'hackathon' && post.hackathon) {
          const hackathon = post.hackathon;
          editDataRef.current = { ...editDataRef.current, hackathonId: hackathon.id };
          setStartDate(hackathon.startDate ? new Date(hackathon.startDate).toISOString().split('T')[0] : '');
          setEndDate(hackathon.endDate ? new Date(hackathon.endDate).toISOString().split('T')[0] : '');
          setPrize(hackathon.prize || hackathon.prizePool?.toString() || '');
          setHackathonCategory(hackathon.category || '');
          setDifficulty(hackathon.difficulty || 'intermediate');
          setMaxParticipants(hackathon.maxParticipants?.toString() || '');
          setOrganizerName(hackathon.organizerName || '');
          setOrganizerLogoUrl(hackathon.organizerLogoUrl || '');
          setRegistrationUrl(hackathon.registrationUrl || '');
          setCtaButtonText(hackathon.ctaButtonText || '');
          setImportantDates(hackathon.importantDates || []);
          setRequirements(hackathon.requirements || []);
        } else if (category === 'event' && post.event) {
          const event = post.event;
          editDataRef.current = { ...editDataRef.current, eventId: event.id };
          const eventDateTime = new Date(event.date);
          setEventDate(eventDateTime.toISOString().split('T')[0] || '');
          setEventTime(event.time || '');
          setLocation(event.location || '');
          setEventType(event.type || 'online');
          setEventCategory(event.category || '');
          setMaxAttendees(event.maxAttendees?.toString() || '');
          setTicketPrice(event.price || 'Free');
          setRegistrationUrl(event.registrationUrl || '');
          setCtaButtonText(event.ctaButtonText || '');
        } else if (category === 'opportunity' && post.opportunity) {
          const opportunity = post.opportunity;
          editDataRef.current = { ...editDataRef.current, opportunityId: opportunity.id };
          setCompany(opportunity.companyName || '');
          setLocation(opportunity.location || '');
          setOpportunityCategory(opportunity.category || '');
          setJobType(opportunity.type || 'full-time');
          setSalary(opportunity.salary || '');
          setExperience(opportunity.experience || '');
          setRemote(opportunity.remote !== undefined ? opportunity.remote : true);
          setApplicationUrl(opportunity.applicationUrl || '');
          setCtaButtonTextOpportunity(opportunity.ctaButtonText || '');
        }
      } catch (error) {
        console.error('Failed to load post data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPostData();
  }, [editPostId]);

  // Get filtered tags from suggestions or fallback to available tags
  const getFilteredTags = () => {
    if (tagInput.trim()) {
      // Use API suggestions if available, otherwise fallback to local filtering
      if (tagSuggestions.length > 0) {
        return tagSuggestions
          .map((t: Tag) => t.name)
          .filter(tag => !tagsList.some(t => t.tag.toLowerCase() === tag.toLowerCase()));
      }
      // Fallback to local filtering
      return availableTags.filter(tag =>
        tag.toLowerCase().includes(tagInput.toLowerCase()) &&
        !tagsList.some(t => t.tag.toLowerCase() === tag.toLowerCase())
      );
    }
    return [];
  };

  const filteredTags = getFilteredTags();
  
  // Get popular tags to show when input is empty
  const getPopularTags = () => {
    const allPopular = [...trendingTags, ...featuredTags]
      .filter((tag, index, self) => 
        index === self.findIndex((t) => t.slug === tag.slug)
      )
      .slice(0, 12);
    
    return allPopular
      .map((t: Tag) => t.name)
      .filter(tag => !tagsList.some(t => t.tag.toLowerCase() === tag.toLowerCase()));
  };

  const popularTags = !tagInput.trim() ? getPopularTags() : [];

  // Hackathon fields
  const [prize, setPrize] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [hackathonCategory, setHackathonCategory] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [organizerName, setOrganizerName] = useState('');
  const [organizerLogoUrl, setOrganizerLogoUrl] = useState('');
  const [organizerLogoImage, setOrganizerLogoImage] = useState<string | null>(null);
  const [organizerLogoError, setOrganizerLogoError] = useState<string | null>(null);
  const [importantDates, setImportantDates] = useState<Array<{ label: string; date: string }>>([]);
  const [importantDateLabel, setImportantDateLabel] = useState('');
  const [importantDateDate, setImportantDateDate] = useState('');
  const [requirements, setRequirements] = useState<string[]>([]);
  const [requirementInput, setRequirementInput] = useState('');
  const [registrationUrl, setRegistrationUrl] = useState('');
  const [ctaButtonText, setCtaButtonText] = useState('');

  // Event fields
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [location, setLocation] = useState('');
  const [eventType, setEventType] = useState('online');
  const [maxAttendees, setMaxAttendees] = useState('');
  const [ticketPrice, setTicketPrice] = useState('');
  const [eventCategory, setEventCategory] = useState('');

  // Opportunity fields
  const [applicationUrl, setApplicationUrl] = useState('');
  const [ctaButtonTextOpportunity, setCtaButtonTextOpportunity] = useState('');
  const [company, setCompany] = useState('');
  const [salary, setSalary] = useState('');
  const [jobType, setJobType] = useState('full-time');
  const [experience, setExperience] = useState('');
  const [remote, setRemote] = useState(true);
  const [opportunityCategory, setOpportunityCategory] = useState('');

  // Filter pages where user can post (owner, moderator, or admin only)
  // Filter pages where user can post and remove duplicates by page ID
  const canPostPages = userPagesData
    .filter(page => 
      page.role === 'owner' || page.role === 'moderator' || page.role === 'admin'
    )
    .filter((page, index, self) => 
      // Keep only first occurrence of each page ID
      index === self.findIndex((p) => p.id === page.id)
    )
    .map(page => {
      // Preserve logoUrl exactly as it is - don't override with null
      const logoUrl = page.logoUrl || page.logo || null;
      return {
        ...page,
        logoUrl: logoUrl, // Preserve logoUrl from API
        logo: logoUrl, // Also set logo field for backward compatibility
      };
    });

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

  const handleCompanyLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE) {
      setCompanyLogoError('Image size must be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setCompanyLogoError('Please upload a valid image file');
      return;
    }

    setCompanyLogoError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setCompanyLogoImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCompanyLogo = () => {
    setCompanyLogoImage(null);
    setCompanyLogoError(null);
    if (companyLogoInputRef.current) {
      companyLogoInputRef.current.value = '';
    }
  };

  const handleOrganizerLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE) {
      setOrganizerLogoError('Image size must be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setOrganizerLogoError('Please upload a valid image file');
      return;
    }

    setOrganizerLogoError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setOrganizerLogoImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveOrganizerLogo = () => {
    setOrganizerLogoImage(null);
    setOrganizerLogoError(null);
    if (organizerLogoInputRef.current) {
      organizerLogoInputRef.current.value = '';
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

  const handleAddImportantDate = () => {
    if (importantDateLabel.trim() && importantDateDate) {
      setImportantDates([...importantDates, { label: importantDateLabel.trim(), date: importantDateDate }]);
      setImportantDateLabel('');
      setImportantDateDate('');
    }
  };

  const handleRemoveImportantDate = (index: number) => {
    setImportantDates(importantDates.filter((_, i) => i !== index));
  };

  const handleAddRequirement = () => {
    if (requirementInput.trim() && !requirements.includes(requirementInput.trim())) {
      setRequirements([...requirements, requirementInput.trim()]);
      setRequirementInput('');
    }
  };

  const handleRemoveRequirement = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    // Prevent duplicate submissions (especially in React StrictMode)
    if (isSubmittingRef.current || isSubmitting) {
      return;
    }

    setSubmitError(null);
    setReputationError(null);

    // Check reputation requirement for non-post content types
    if (contentType !== 'post' && user) {
      const requiredReputation = reputationRequirements[contentType] || 0;
      if (requiredReputation > 0 && user.reputation < requiredReputation) {
        setReputationError(
          `You need at least ${requiredReputation} reputation points to create a ${contentType}. Your current reputation: ${user.reputation}`
        );
        isSubmittingRef.current = false;
        return;
      }
    }

    // Validation
    if (!title.trim()) {
      setSubmitError('Title is required');
      isSubmittingRef.current = false;
      return;
    }

    if (!content.trim()) {
      setSubmitError('Content is required');
      isSubmittingRef.current = false;
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    setSubmitError(null);
    setReputationError(null);

    try {
      if (contentType === 'post') {
        // Create or update regular post
        const postData = { 
          title, 
          content, 
          category: contentType,
          tags: tagsList.map(t => t.tag),
          coverImageUrl: coverImage || null,
          pageId: selectedPageId || undefined,
          status: 'published',
          postOrigin: postOrigin || null,
          originSource: postOrigin ? originSource : null,
          originUrl: postOrigin ? originUrl : null
        };

        if (isEditMode && editDataRef.current?.postId) {
          const updatedPost = await postsService.updatePost(editDataRef.current.postId, postData);
          if (!updatedPost) {
            throw new Error('Failed to update post: No response from server');
          }
          if (!updatedPost.slug && !updatedPost.id) {
            throw new Error('Failed to update post: Invalid response from server (missing slug/id)');
          }
          const identifier = updatedPost.slug || updatedPost.id;
          navigate(`/post/${identifier}`, { replace: true, state: { post: updatedPost } });
        } else {
          const createdPost = await postsService.createPost(postData);
          if (!createdPost) {
            throw new Error('Failed to create post: No response from server');
          }
          if (!createdPost.slug && !createdPost.id) {
            throw new Error('Failed to create post: Invalid response from server (missing slug/id)');
          }
          const identifier = createdPost.slug || createdPost.id;
          navigate(`/post/${identifier}`, { replace: true, state: { post: createdPost } });
        }
      } else if (contentType === 'hackathon') {
        // Create or update hackathon
        if (!startDate || !endDate) {
          setSubmitError('Start date and end date are required');
          setIsSubmitting(false);
          isSubmittingRef.current = false;
          return;
        }

        const hackathonData = {
          title,
          description: content,
          imageUrl: coverImage || undefined,
          organizerName: organizerName || user?.username || user?.pseudo || undefined,
          organizerLogoUrl: organizerLogoImage || organizerLogoUrl || undefined,
          startDate,
          endDate,
          importantDates: importantDates.length > 0 ? importantDates : undefined,
          prize: prize || undefined,
          maxParticipants: maxParticipants ? parseInt(maxParticipants) : undefined,
          category: hackathonCategory || 'general',
          difficulty: difficulty as 'beginner' | 'intermediate' | 'advanced',
          requirements: requirements.length > 0 ? requirements : undefined,
          registrationUrl: registrationUrl || undefined,
          ctaButtonText: ctaButtonText || undefined,
          postOrigin: postOrigin || null,
          originSource: postOrigin ? originSource : null,
          originUrl: postOrigin ? originUrl : null,
        };

        if (isEditMode && editDataRef.current?.hackathonId) {
          const result = await hackathonsService.updateHackathon(editDataRef.current.hackathonId, hackathonData);
          const hackathon = result.hackathon || result;
          if (!hackathon) {
            throw new Error('Failed to update hackathon: No response from server');
          }
          const identifier = hackathon.slug || hackathon.id;
          if (!identifier) {
            throw new Error('Failed to update hackathon: Invalid response from server (missing slug/id)');
          }
          navigate(`/hackathons/${identifier}`, { replace: true });
        } else {
          const result = await hackathonsService.createHackathon(hackathonData);
          const hackathon = result.hackathon || result;
          if (!hackathon) {
            throw new Error('Failed to create hackathon: No response from server');
          }
          const identifier = hackathon.slug || hackathon.id;
          if (!identifier) {
            throw new Error('Failed to create hackathon: Invalid response from server (missing slug/id)');
          }
          navigate(`/hackathons/${identifier}`, { replace: true });
        }
      } else if (contentType === 'event') {
        // Create or update event
        if (!eventDate || !eventTime || !location) {
          setSubmitError('Date, time, and location are required');
          setIsSubmitting(false);
          isSubmittingRef.current = false;
          return;
        }

        const eventData = {
          title,
          description: content,
          imageUrl: coverImage || undefined,
          date: eventDate,
          time: eventTime,
          location,
          type: eventType as 'online' | 'in-person' | 'hybrid',
          category: eventCategory || 'general',
          maxAttendees: maxAttendees ? parseInt(maxAttendees) : undefined,
          price: ticketPrice || 'Free',
          registrationUrl: registrationUrl || undefined,
          ctaButtonText: ctaButtonText || undefined,
          postOrigin: postOrigin || null,
          originSource: postOrigin ? originSource : null,
          originUrl: postOrigin ? originUrl : null,
        };

        if (isEditMode && editDataRef.current?.eventId) {
          const result = await eventsService.updateEvent(editDataRef.current.eventId, eventData);
          const event = result.event || result;
          if (!event) {
            throw new Error('Failed to update event: No response from server');
          }
          const identifier = event.slug || event.id;
          if (!identifier) {
            throw new Error('Failed to update event: Invalid response from server (missing slug/id)');
          }
          navigate(`/events/${identifier}`, { replace: true });
        } else {
          const result = await eventsService.createEvent(eventData);
          const event = result.event || result;
          if (!event) {
            throw new Error('Failed to create event: No response from server');
          }
          const identifier = event.slug || event.id;
          if (!identifier) {
            throw new Error('Failed to create event: Invalid response from server (missing slug/id)');
          }
          navigate(`/events/${identifier}`, { replace: true });
        }
      } else if (contentType === 'opportunity') {
        // Create or update opportunity
        if (!company || !location) {
          setSubmitError('Company name and location are required');
          setIsSubmitting(false);
          isSubmittingRef.current = false;
          return;
        }

        const opportunityData = {
          title,
          description: content,
          companyName: company,
          logoUrl: companyLogoImage || undefined,
          location,
          type: jobType as 'full-time' | 'part-time' | 'contract' | 'internship',
          category: opportunityCategory || 'general',
          salary: salary || undefined,
          experience: experience || 'Not specified',
          remote,
          applicationUrl: applicationUrl || undefined,
          ctaButtonText: ctaButtonTextOpportunity || undefined,
          postOrigin: postOrigin || null,
          originSource: postOrigin ? originSource : null,
          originUrl: postOrigin ? originUrl : null,
        };

        if (isEditMode && editDataRef.current?.opportunityId) {
          const result = await opportunitiesService.updateOpportunity(editDataRef.current.opportunityId, opportunityData);
          const opportunity = result.opportunity || result;
          if (!opportunity) {
            throw new Error('Failed to update opportunity: No response from server');
          }
          const identifier = opportunity.slug || opportunity.id;
          if (!identifier) {
            throw new Error('Failed to update opportunity: Invalid response from server (missing slug/id)');
          }
          navigate(`/opportunities/${identifier}`, { replace: true });
        } else {
          const result = await opportunitiesService.createOpportunity(opportunityData);
          const opportunity = result.opportunity || result;
          if (!opportunity) {
            throw new Error('Failed to create opportunity: No response from server');
          }
          const identifier = opportunity.slug || opportunity.id;
          if (!identifier) {
            throw new Error('Failed to create opportunity: Invalid response from server (missing slug/id)');
          }
          navigate(`/opportunities/${identifier}`, { replace: true });
        }
      }
      
      // Scroll to top for better UX
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: any) {
      console.error('Failed to create/update content:', error);
      
      // Handle specific error cases
      if (error.response?.status === 413) {
        setSubmitError('Request payload is too large. Please reduce the size of your content or images.');
      } else if (error.response?.status === 502) {
        setSubmitError('Server is temporarily unavailable. Please try again in a moment.');
      } else if (error.response?.data?.errors) {
        // Handle validation errors array
        const errors = error.response.data.errors;
        if (Array.isArray(errors)) {
          setSubmitError(errors.join('. '));
        } else if (typeof errors === 'object') {
          setSubmitError(Object.values(errors).flat().join('. '));
        } else {
          setSubmitError(String(errors));
        }
      } else if (error.response?.data?.message) {
        setSubmitError(error.response.data.message);
      } else if (error.message) {
        setSubmitError(error.message);
      } else {
        setSubmitError(`Failed to ${isEditMode ? 'update' : 'create'} ${contentType}. Please try again.`);
      }
    } finally {
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 animate-fade-in pt-16 sm:pt-20 pb-16 sm:pb-20">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-5 md:py-6">
        <div className="relative">
          {/* Title - Mobile Optimized */}
          <div className="mb-5 sm:mb-6 md:mb-8">
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-sm flex-shrink-0">
                {contentType === 'post' && <FileText size={20} className="sm:w-6 sm:h-6 text-white" />}
                {contentType === 'hackathon' && <Trophy size={20} className="sm:w-6 sm:h-6 text-white" />}
                {contentType === 'event' && <Calendar size={20} className="sm:w-6 sm:h-6 text-white" />}
                {contentType === 'opportunity' && <Briefcase size={20} className="sm:w-6 sm:h-6 text-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white leading-tight mb-1.5">
              {isEditMode ? `Edit ${contentType.charAt(0).toUpperCase() + contentType.slice(1)}` : `Create ${contentType.charAt(0).toUpperCase() + contentType.slice(1)}`}
            </h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {isEditMode ? 'Make your changes and update your content' : 'Share your thoughts and connect with the community'}
            </p>
              </div>
            </div>
          </div>
          
          {/* Main Content Area - Responsive Width */}
            <div className="lg:mr-80 space-y-4 sm:space-y-5 md:space-y-6">

              {/* Post As Selection - Mobile Only */}
              {!pageId && canPostPages.length > 0 && (
                <div className="lg:hidden backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-200/50 dark:border-gray-800/50">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                      <UserPlus size={16} className="text-white" />
                    </div>
                    <label className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">Post As</label>
                  </div>
                  <div className="space-y-2.5">
                    <button
                      onClick={() => setSelectedPageId(null)}
                      className={`w-full min-h-[44px] flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-300 touch-manipulation ${
                        !selectedPageId
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-sm'
                          : 'border-2 border-gray-200 dark:border-gray-700 active:border-gray-300 dark:active:border-gray-600 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <Avatar
                        src={user?.avatarUrl || user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'user'}`}
                        alt={user?.username || 'Your Profile'}
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
                        className={`w-full min-h-[44px] flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-300 touch-manipulation ${
                          selectedPageId === page.id
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30'
                            : 'border-2 border-gray-200 dark:border-gray-700 active:border-gray-300 dark:active:border-gray-600 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 ${
                          selectedPageId === page.id
                            ? 'ring-2 ring-white/50 shadow-sm'
                            : 'ring-1 ring-gray-200 dark:ring-gray-700'
                        } bg-white dark:bg-gray-800 flex items-center justify-center`}>
                          {(() => {
                            const logoUrl = getPageLogoUrl(page);
                            if (logoUrl) {
                              return (
                                <img 
                                  src={logoUrl}
                                  alt={page.name} 
                                  className="w-full h-full object-contain p-0.5"
                                  loading="lazy"
                                  onError={(e) => {
                                    // If image fails to load, replace with fallback
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const fallback = document.createElement('div');
                                    fallback.className = 'w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30';
                                    fallback.innerHTML = `<span class="text-xs font-bold text-purple-600 dark:text-purple-400">${page.name.charAt(0).toUpperCase()}</span>`;
                                    target.parentElement?.appendChild(fallback);
                                  }}
                                />
                              );
                            }
                            // No logo in database - show initial fallback
                            return (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30">
                                <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                                  {page.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            );
                          })()}
                        </div>
                        <span className="font-semibold flex-1 text-left">{page.name}</span>
                        {selectedPageId === page.id && <Check size={18} strokeWidth={2.5} />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

            {/* Common Fields - Title */}
            <div className="backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-200/50 dark:border-gray-800/50">
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                  <FileText size={18} className="text-blue-500" />
                  Title
              </label>
                <span className="text-xs font-medium px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                  {title.length}/{TITLE_MAX_LENGTH}
                </span>
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  if (e.target.value.length <= TITLE_MAX_LENGTH) {
                    setTitle(e.target.value);
                  }
                }}
                placeholder={`Enter your ${contentType} title...`}
                className="w-full px-4 py-3.5 sm:py-4 rounded-xl bg-gray-50/80 dark:bg-gray-800/80 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 text-base sm:text-lg touch-manipulation"
              />
            </div>

            {/* Hackathon Specific Fields */}
            {contentType === 'hackathon' && (
              <div className="backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 rounded-2xl p-4 sm:p-5 md:p-6 shadow-lg border border-gray-200/50 dark:border-gray-800/50 space-y-4 sm:space-y-5">
                <div className="flex items-center gap-3 mb-4 sm:mb-5">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500">
                    <Trophy size={20} className="text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Hackathon Details</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-bold mb-2 text-gray-900 dark:text-white">Category <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={hackathonCategory}
                      onChange={(e) => setHackathonCategory(e.target.value)}
                      placeholder="e.g., Blockchain, DeFi, NFT"
                      className="w-full px-4 py-3.5 sm:py-4 rounded-xl bg-gray-50/80 dark:bg-gray-800/80 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 text-base sm:text-lg touch-manipulation"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-bold mb-2 text-gray-900 dark:text-white">Difficulty</label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full px-4 py-3.5 sm:py-4 rounded-xl bg-gray-50/80 dark:bg-gray-800/80 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 text-base sm:text-lg touch-manipulation"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-bold mb-2 text-gray-900 dark:text-white">Start Date <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                      className="w-full px-4 py-3.5 sm:py-4 rounded-xl bg-gray-50/80 dark:bg-gray-800/80 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 text-base sm:text-lg touch-manipulation"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-bold mb-2 text-gray-900 dark:text-white">End Date <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                      className="w-full px-4 py-3.5 sm:py-4 rounded-xl bg-gray-50/80 dark:bg-gray-800/80 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 text-base sm:text-lg touch-manipulation"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-900 dark:text-white">Prize Amount</label>
                    <input
                      type="text"
                      value={prize}
                      onChange={(e) => setPrize(e.target.value)}
                      placeholder="$100,000"
                      className="w-full px-4 py-3.5 sm:py-4 rounded-xl bg-gray-50/80 dark:bg-gray-800/80 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 text-base sm:text-lg touch-manipulation"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-900 dark:text-white">Max Participants</label>
                    <input
                      type="number"
                      value={maxParticipants}
                      onChange={(e) => setMaxParticipants(e.target.value)}
                      placeholder="100"
                      className="w-full px-4 py-3.5 sm:py-4 rounded-xl bg-gray-50/80 dark:bg-gray-800/80 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 text-base sm:text-lg touch-manipulation"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-900 dark:text-white">Organizer Name</label>
                    <input
                      type="text"
                      value={organizerName}
                      onChange={(e) => setOrganizerName(e.target.value)}
                      placeholder={user?.username || user?.pseudo || "Organizer name"}
                      className="w-full px-4 py-3.5 sm:py-4 rounded-xl bg-gray-50/80 dark:bg-gray-800/80 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 text-base sm:text-lg touch-manipulation"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-900 dark:text-white">
                      Organizer Logo
                      <span className="text-xs text-gray-400 ml-2 font-normal">(Optional, max 5MB)</span>
                    </label>
{!organizerLogoImage && !organizerLogoUrl ? (
                      <div
                        onClick={() => organizerLogoInputRef.current?.click()}
                        className="w-full h-32 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-2"
                      >
                        <Upload size={24} className="text-gray-400" />
                        <div className="text-center">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">Click to upload logo</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                        </div>
                        <input
                          ref={organizerLogoInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleOrganizerLogoUpload}
                          className="hidden"
                        />
                      </div>
                    ) : (
                      <div className="relative w-full h-32 rounded-xl overflow-hidden">
                        <img
                          src={organizerLogoImage || organizerLogoUrl || ''}
                          alt="Organizer Logo"
                          className="w-full h-full object-contain bg-gray-50 dark:bg-gray-800"
                        />
                        <button
                          onClick={handleRemoveOrganizerLogo}
                          className="absolute top-2 right-2 p-2 rounded-xl bg-red-500 hover:bg-red-600 text-white shadow-sm transition-all duration-300"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                    {organizerLogoError && (
                      <p className="text-red-500 text-xs mt-2 font-medium">{organizerLogoError}</p>
                    )}
                  </div>
                </div>

                {/* Important Dates */}
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-900 dark:text-white">Important Dates</label>
                  <div className="space-y-2">
                    {importantDates.map((date, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="flex-1 text-sm font-medium">{date.label}</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{date.date}</span>
                        <button
                          onClick={() => handleRemoveImportantDate(index)}
                          className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={importantDateLabel}
                        onChange={(e) => setImportantDateLabel(e.target.value)}
                        placeholder="e.g., Registration Deadline"
                        className="flex-1 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:outline-none text-sm"
                      />
                      <input
                        type="date"
                        value={importantDateDate}
                        onChange={(e) => setImportantDateDate(e.target.value)}
                        className="px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:outline-none text-sm"
                      />
                      <button
                        onClick={handleAddImportantDate}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all flex items-center gap-1.5"
                      >
                        <Plus size={16} />
                        <span className="text-sm">Add</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Requirements */}
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-900 dark:text-white">Requirements</label>
                  <div className="space-y-2">
                    {requirements.map((req, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="flex-1 text-sm">{req}</span>
                        <button
                          onClick={() => handleRemoveRequirement(index)}
                          className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={requirementInput}
                        onChange={(e) => setRequirementInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddRequirement()}
                        placeholder="e.g., Team size: 2-4 members"
                        className="flex-1 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:outline-none text-sm"
                      />
                      <button
                        onClick={handleAddRequirement}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all flex items-center gap-1.5"
                      >
                        <Plus size={16} />
                        <span className="text-sm">Add</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Registration URL and CTA Button */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-900 dark:text-white">Registration URL</label>
                    <input
                      type="url"
                      value={registrationUrl}
                      onChange={(e) => setRegistrationUrl(e.target.value)}
                      placeholder="https://example.com/register"
                      className="w-full px-4 py-3.5 sm:py-4 rounded-xl bg-gray-50/80 dark:bg-gray-800/80 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 text-base sm:text-lg touch-manipulation"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-900 dark:text-white">Button Text</label>
                    <input
                      type="text"
                      value={ctaButtonText}
                      onChange={(e) => setCtaButtonText(e.target.value)}
                      placeholder="e.g., Register Now"
                      className="w-full px-4 py-3.5 sm:py-4 rounded-xl bg-gray-50/80 dark:bg-gray-800/80 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 text-base sm:text-lg touch-manipulation"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Event Specific Fields */}
            {contentType === 'event' && (
              <div className="backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 rounded-2xl p-4 sm:p-5 md:p-6 shadow-lg border border-gray-200/50 dark:border-gray-800/50 space-y-4 sm:space-y-5">
                <div className="flex items-center gap-3 mb-4 sm:mb-5">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                    <Calendar size={20} className="text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Event Details</h3>
                </div>
                
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-900 dark:text-white">Category <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={eventCategory}
                    onChange={(e) => setEventCategory(e.target.value)}
                    placeholder="e.g., Conference, Workshop, Meetup"
                    className="w-full px-4 py-3.5 sm:py-4 rounded-xl bg-gray-50/80 dark:bg-gray-800/80 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 text-base sm:text-lg touch-manipulation"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-900 dark:text-white">Event Date <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      required
                      className="w-full px-4 py-3.5 sm:py-4 rounded-xl bg-gray-50/80 dark:bg-gray-800/80 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 text-base sm:text-lg touch-manipulation"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-900 dark:text-white">Time <span className="text-red-500">*</span></label>
                    <input
                      type="time"
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                      required
                      className="w-full px-4 py-3.5 sm:py-4 rounded-xl bg-gray-50/80 dark:bg-gray-800/80 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 text-base sm:text-lg touch-manipulation"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-900 dark:text-white">Location <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="San Francisco, CA or Virtual Event"
                    required
                    className="w-full px-4 py-3.5 sm:py-4 rounded-xl bg-gray-50/80 dark:bg-gray-800/80 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 text-base sm:text-lg touch-manipulation"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-900 dark:text-white">Event Type</label>
                    <select
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                      className="w-full px-4 py-3.5 sm:py-4 rounded-xl bg-gray-50/80 dark:bg-gray-800/80 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 text-base sm:text-lg touch-manipulation"
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
                      className="w-full px-4 py-3.5 sm:py-4 rounded-xl bg-gray-50/80 dark:bg-gray-800/80 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 text-base sm:text-lg touch-manipulation"
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
                    className="w-full px-4 py-3.5 sm:py-4 rounded-xl bg-gray-50/80 dark:bg-gray-800/80 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 text-base sm:text-lg touch-manipulation"
                  />
                </div>

                {/* Registration URL and CTA Button */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-900 dark:text-white">Registration URL</label>
                    <input
                      type="url"
                      value={registrationUrl}
                      onChange={(e) => setRegistrationUrl(e.target.value)}
                      placeholder="https://example.com/register"
                      className="w-full px-4 py-3.5 sm:py-4 rounded-xl bg-gray-50/80 dark:bg-gray-800/80 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 text-base sm:text-lg touch-manipulation"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-900 dark:text-white">Button Text</label>
                    <input
                      type="text"
                      value={ctaButtonText}
                      onChange={(e) => setCtaButtonText(e.target.value)}
                      placeholder="e.g., Get Tickets"
                      className="w-full px-4 py-3.5 sm:py-4 rounded-xl bg-gray-50/80 dark:bg-gray-800/80 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 text-base sm:text-lg touch-manipulation"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Opportunity Specific Fields */}
            {contentType === 'opportunity' && (
              <div className="backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 rounded-2xl p-4 sm:p-5 md:p-6 shadow-lg border border-gray-200/50 dark:border-gray-800/50 space-y-4 sm:space-y-5">
                <div className="flex items-center gap-3 mb-4 sm:mb-5">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500">
                    <Briefcase size={20} className="text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Job Details</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-900 dark:text-white">Company Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Company Name"
                      required
                      className="w-full px-4 py-3.5 sm:py-4 rounded-xl bg-gray-50/80 dark:bg-gray-800/80 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 text-base sm:text-lg touch-manipulation"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-bold mb-2 text-gray-900 dark:text-white">Category <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={opportunityCategory}
                      onChange={(e) => setOpportunityCategory(e.target.value)}
                      placeholder="e.g., Engineering, Marketing, Design"
                      required
                      className="w-full px-4 py-3.5 sm:py-4 rounded-xl bg-gray-50/80 dark:bg-gray-800/80 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 text-base sm:text-lg touch-manipulation"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-900 dark:text-white">Salary Range</label>
                    <input
                      type="text"
                      value={salary}
                      onChange={(e) => setSalary(e.target.value)}
                      placeholder="$100k - $150k"
                      className="w-full px-4 py-3.5 sm:py-4 rounded-xl bg-gray-50/80 dark:bg-gray-800/80 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 text-base sm:text-lg touch-manipulation"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-900 dark:text-white">
                      Company Logo
                      <span className="text-xs text-gray-400 ml-2 font-normal">(Optional, max 5MB)</span>
                    </label>
                    {!companyLogoImage ? (
                      <div
                        onClick={() => companyLogoInputRef.current?.click()}
                        className="w-full h-32 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-2"
                      >
                        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                          <Upload size={20} className="text-white" />
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-semibold text-gray-900 dark:text-white">Click to upload logo</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">PNG, JPG up to 5MB</p>
                        </div>
                        <input
                          ref={companyLogoInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleCompanyLogoUpload}
                          className="hidden"
                        />
                      </div>
                    ) : (
                      <div className="relative w-full h-32 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                        <img
                          src={companyLogoImage}
                          alt="Company Logo"
                          className="w-full h-full object-contain"
                        />
                        <button
                          onClick={handleRemoveCompanyLogo}
                          className="absolute top-2 right-2 p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white shadow-sm transition-all duration-300"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                    {companyLogoError && (
                      <p className="text-red-500 text-xs mt-2 font-medium">{companyLogoError}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-900 dark:text-white">Job Type</label>
                    <select
                      value={jobType}
                      onChange={(e) => setJobType(e.target.value)}
                      className="w-full px-4 py-3.5 sm:py-4 rounded-xl bg-gray-50/80 dark:bg-gray-800/80 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 text-base sm:text-lg touch-manipulation"
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
                      className="w-full px-4 py-3.5 sm:py-4 rounded-xl bg-gray-50/80 dark:bg-gray-800/80 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 text-base sm:text-lg touch-manipulation"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-900 dark:text-white">Location <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="San Francisco, CA or Remote"
                    required
                    className="w-full px-4 py-3.5 sm:py-4 rounded-xl bg-gray-50/80 dark:bg-gray-800/80 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 text-base sm:text-lg touch-manipulation"
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

                {/* Application URL and CTA Button */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-900 dark:text-white">Application URL</label>
                    <input
                      type="url"
                      value={applicationUrl}
                      onChange={(e) => setApplicationUrl(e.target.value)}
                      placeholder="https://example.com/apply"
                      className="w-full px-4 py-3.5 sm:py-4 rounded-xl bg-gray-50/80 dark:bg-gray-800/80 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 text-base sm:text-lg touch-manipulation"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-900 dark:text-white">Button Text</label>
                    <input
                      type="text"
                      value={ctaButtonTextOpportunity}
                      onChange={(e) => setCtaButtonTextOpportunity(e.target.value)}
                      placeholder="e.g., Apply Now"
                      className="w-full px-4 py-3.5 sm:py-4 rounded-xl bg-gray-50/80 dark:bg-gray-800/80 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 text-base sm:text-lg touch-manipulation"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Cover Image */}
            <div className="backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 rounded-2xl p-4 sm:p-5 md:p-6 shadow-lg border border-gray-200/50 dark:border-gray-800/50">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                  <Upload size={18} className="text-white" />
                </div>
                <label className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                Cover Image
                <span className="text-xs text-gray-400 ml-2 font-normal">(Optional, max 5MB)</span>
              </label>
              </div>
              {!coverImage ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-48 sm:h-56 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 active:border-blue-500 dark:active:border-blue-500 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-3 sm:gap-4 touch-manipulation"
                >
                  <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-sm">
                    <Upload size={24} className="sm:w-7 sm:h-7 text-white" />
                  </div>
                  <div className="text-center px-4">
                    <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">Tap to upload cover image</p>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">PNG, JPG up to 5MB</p>
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
                <div className="relative w-full h-48 sm:h-56 rounded-xl overflow-hidden shadow-sm border-2 border-gray-200 dark:border-gray-700">
                  <img
                    src={coverImage}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={handleRemoveCoverImage}
                    className="absolute top-3 right-3 p-2.5 sm:p-3 rounded-xl bg-red-500 active:bg-red-600 text-white shadow-sm transition-all duration-300 touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
                    aria-label="Remove cover image"
                  >
                    <X size={18} className="sm:w-5 sm:h-5" />
                  </button>
                </div>
              )}
              {imageError && (
                <div className="mt-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <p className="text-red-600 dark:text-red-400 text-xs sm:text-sm font-medium flex items-center gap-2">
                    <AlertCircle size={16} />
                    {imageError}
                  </p>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 rounded-2xl p-4 sm:p-5 md:p-6 shadow-lg border border-gray-200/50 dark:border-gray-800/50">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                  <FileText size={18} className="text-white" />
                </div>
                <label className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">Description</label>
              </div>
              <MarkdownEditor
                value={content}
                onChange={setContent}
                placeholder={`Write your ${contentType} description... (Markdown supported)`}
                minHeight="240px"
              />
            </div>

            {/* Tags */}
            <div className="backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 rounded-2xl p-4 sm:p-5 md:p-6 shadow-sm border border-gray-200/50 dark:border-gray-800/50 relative z-10">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500">
                    <Hash size={18} className="text-white" />
                  </div>
                  <label className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">Tags</label>
                </div>
                <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                  {tagsList.length}/{MAX_TAGS}
                </span>
              </div>
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
                className="w-full px-4 py-3.5 sm:py-4 rounded-xl bg-gray-50/80 dark:bg-gray-800/80 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-lg touch-manipulation"
              />
              {showTagSuggestions && tagsList.length < MAX_TAGS && (
                <div className="absolute z-[100] left-4 right-4 mt-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg max-h-80 overflow-y-auto">
                  {loadingTags ? (
                    <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-400 text-sm">
                      Loading suggestions...
                    </div>
                  ) : tagInput.trim() ? (
                    // Show search results when typing
                    filteredTags.length > 0 ? (
                      <>
                        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Search Results</p>
                        </div>
                        {filteredTags.slice(0, 15).map(tagName => {
                          const tag = tagSuggestions.find((t: Tag) => t.name === tagName) || 
                                     trendingTags.find((t: Tag) => t.name === tagName) ||
                                     featuredTags.find((t: Tag) => t.name === tagName);
                          const usageCount = tag?.usageCount || 0;
                          const isFeatured = tag?.featured || false;
                          
                          return (
                            <button
                              key={tagName}
                              onClick={() => handleAddTag(tagName)}
                              className="w-full px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 text-sm border-b border-gray-100 dark:border-gray-700 last:border-0 group"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <Hash size={16} className="text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors flex-shrink-0" />
                                  <span className="font-medium text-gray-900 dark:text-white truncate">#{tagName}</span>
                                  {isFeatured && (
                                    <Star size={14} className="text-yellow-500 fill-yellow-500 flex-shrink-0" />
                                  )}
                                </div>
                                {usageCount > 0 && (
                                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                                    <TrendingUp size={12} />
                                    <span>{usageCount.toLocaleString()}</span>
                                  </div>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </>
                    ) : (
                      <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-400 text-sm">
                        No tags found. Press Enter to create "{tagInput.trim()}"
                      </div>
                    )
                  ) : (
                    // Show popular tags when input is empty
                    popularTags.length > 0 && (
                      <>
                        <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-b border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-2">
                            <TrendingUp size={14} className="text-blue-500 dark:text-blue-400" />
                            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Popular Tags</p>
                          </div>
                        </div>
                        <div className="p-3">
                          <div className="flex flex-wrap gap-2">
                            {popularTags.map(tagName => {
                              const tag = trendingTags.find((t: Tag) => t.name === tagName) ||
                                         featuredTags.find((t: Tag) => t.name === tagName);
                              const usageCount = tag?.usageCount || 0;
                              const isFeatured = tag?.featured || false;
                              
                              return (
                                <button
                                  key={tagName}
                                  onClick={() => handleAddTag(tagName)}
                                  className="group px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 hover:text-white dark:hover:from-blue-600 dark:hover:to-purple-600 transition-all duration-200 text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5"
                                >
                                  <Hash size={14} className="group-hover:text-white transition-colors" />
                                  <span>{tagName}</span>
                                  {isFeatured && (
                                    <Star size={12} className="text-yellow-500 fill-yellow-500 group-hover:text-white group-hover:fill-white transition-colors" />
                                  )}
                                  {usageCount > 0 && (
                                    <span className="text-xs opacity-70 group-hover:text-white">
                                      {usageCount > 1000 ? `${(usageCount / 1000).toFixed(1)}k` : usageCount}
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    )
                  )}
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

            {/* Action Buttons - Integrated in Main Content */}
            <div className="space-y-4">
              {/* Error Messages */}
              {reputationError && (
                <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-start gap-3">
                    <AlertCircle size={18} className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-yellow-900 dark:text-yellow-100 mb-1">Reputation Required</p>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">{reputationError}</p>
                    </div>
                  </div>
                </div>
              )}

              {submitError && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <div className="flex items-start gap-3">
                    <AlertCircle size={18} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700 dark:text-red-400 font-medium flex-1">{submitError}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={onBack}
                  disabled={isSubmitting}
                  className="flex-1 min-h-[48px] px-6 rounded-xl font-semibold text-base text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={
                    isSubmitting || 
                    !title.trim() || 
                    !content.trim() || 
                    !!(contentType !== 'post' && user && reputationRequirements[contentType] > 0 && user.reputation < reputationRequirements[contentType])
                  }
                  className="flex-1 min-h-[48px] px-6 rounded-xl font-semibold text-base text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 active:from-blue-700 active:to-cyan-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{isEditMode ? 'Updating...' : 'Publishing...'}</span>
                    </>
                  ) : (
                    <>
                      <Check size={20} />
                      <span>{isEditMode ? 'Update' : 'Publish'}</span>
                    </>
                  )}
                </button>
              </div>
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
                          onClick={() => !isEditMode && setContentType(type.id)}
                          disabled={isEditMode}
                          className={`flex flex-col items-center gap-1.5 p-2.5 rounded-lg text-xs transition-all ${
                            isActive
                              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                              : 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                          } ${
                            isEditMode ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                          }`}
                        >
                          <Icon size={18} strokeWidth={2} />
                          <span className="font-medium">{type.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Reputation Warning - Right Sidebar */}
                {contentType !== 'post' && user && reputationRequirements[contentType] > 0 && user.reputation < reputationRequirements[contentType] && (
                  <div className="border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 bg-yellow-50 dark:bg-yellow-900/20">
                    <div className="flex items-start gap-2">
                      <Award size={16} className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-yellow-900 dark:text-yellow-100 mb-1">Reputation Required</p>
                        <p className="text-xs text-yellow-700 dark:text-yellow-300">
                          You need <strong>{reputationRequirements[contentType]}</strong> reputation points to create a {contentType}. Your current: <strong>{user.reputation}</strong>
                        </p>
                      </div>
                    </div>
                  </div>
                )}

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
                          src={user?.avatarUrl || user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'user'}`}
                          alt={user?.username || 'Your Profile'}
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
                          <div className={`w-6 h-6 rounded overflow-hidden flex-shrink-0 ${
                            selectedPageId === page.id
                              ? 'ring-1 ring-blue-400 dark:ring-blue-500 shadow-sm'
                              : 'ring-1 ring-gray-200 dark:ring-gray-700'
                          } bg-white dark:bg-gray-800 flex items-center justify-center`}>
                            {(() => {
                              const logoUrl = getPageLogoUrl(page) || page.logoUrl || page.logo;
                              if (logoUrl) {
                                return (
                              <img 
                                    src={logoUrl}
                                alt={page.name} 
                                    className="w-full h-full object-contain p-0.5"
                                loading="lazy"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(page.name)}`;
                                      target.className = 'w-full h-full object-cover';
                                }}
                              />
                                );
                              }
                              return (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30">
                                <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400">
                                  {page.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              );
                            })()}
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
    </div>
  );
}
