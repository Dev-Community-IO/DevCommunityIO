import { useState, useRef, useEffect } from 'react';
import { X, Upload, Camera, Image as ImageIcon, Globe, Twitter, Linkedin, Github, Loader, AlertCircle, CheckCircle, Award, Send, MessageCircle, Facebook, Instagram, Youtube, Gamepad2 } from 'lucide-react';
import pagesService from '../services/api/pages.service';
import { apiClient } from '../services/api/config';
import { useAuth } from '../contexts/AuthContext';
import adminService from '../services/api/admin.service';

interface CreatePageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const categories = [
  'Development',
  'DeFi',
  'NFTs',
  'DAOs',
  'Blockchain',
  'Web3',
  'Gaming',
  'Art',
  'Music',
  'Other'
];

export function CreatePageModal({ isOpen, onClose, onSuccess }: CreatePageModalProps) {
  const { isAuthenticated, user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shortBio: '',
    category: '',
    username: '',
    url: '',
    socialLinks: {
      website: '',
      twitter: '',
      linkedin: '',
      github: '',
      discord: '',
      telegram: '',
      whatsapp: '',
      facebook: '',
      instagram: '',
      youtube: '',
    },
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [requiredReputation, setRequiredReputation] = useState<number>(0);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Fetch reputation requirement on mount
  useEffect(() => {
    const fetchReputationRequirement = async () => {
      try {
        const data = await adminService.getReputationRequirements();
        if (data.requirements?.page) {
          setRequiredReputation(data.requirements.page);
        }
      } catch (error) {
        console.error('Failed to fetch reputation requirement:', error);
      }
    };
    
    fetchReputationRequirement();
  }, []);

  if (!isOpen) return null;

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Logo image must be less than 5MB');
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Cover image must be less than 10MB');
        return;
      }
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  // NOTE: This function is no longer used for page creation
  // Page images are converted to base64 and sent directly to PagesController
  // which handles S3 upload with correct page-specific prefixes
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const uploadImage = async (file: File, type: 'avatar' | 'cover'): Promise<string> => {
    // Ensure user is authenticated
    if (!isAuthenticated || !user) {
      throw new Error('Authentication required. Please log in.');
    }

    // Validate file exists
    if (!file || file.size === 0) {
      throw new Error('No file provided or file is empty');
    }

    console.log('Original file:', {
      name: file.name,
      size: file.size,
      type: file.type,
      isFile: file instanceof File,
    });

    // For now, use original file directly to debug the upload issue
    // Compression can be re-enabled once basic upload works
    const fileToUpload: File = file;
    
    console.log('File to upload:', {
      name: fileToUpload.name,
      size: fileToUpload.size,
      type: fileToUpload.type,
      isFile: fileToUpload instanceof File,
      constructor: fileToUpload.constructor.name,
    });

    // Ensure we have a valid File object
    if (!(fileToUpload instanceof File)) {
      console.error('fileToUpload is not a File object:', fileToUpload);
      throw new Error('Invalid file object');
    }
    
    // Verify file has content
    if (fileToUpload.size === 0) {
      console.error('File size is 0');
      throw new Error('File is empty');
    }

    // Create FormData - use the original file directly to ensure it works
    const uploadFormData = new FormData();
    
    // Append file to FormData - use the file directly without modification
    uploadFormData.append('image', fileToUpload);
    uploadFormData.append('type', type);

    // Debug: Verify FormData contents
    const formDataFile = uploadFormData.get('image') as File | null;
    console.log('FormData check:', {
      hasImage: uploadFormData.has('image'),
      imageIsFile: formDataFile instanceof File,
      imageName: formDataFile?.name,
      imageSize: formDataFile?.size,
      imageType: formDataFile?.type,
      typeValue: uploadFormData.get('type'),
    });
    
    if (!formDataFile || !(formDataFile instanceof File)) {
      console.error('File not properly added to FormData!', formDataFile);
      throw new Error('Failed to prepare file for upload');
    }

    // apiClient interceptor handles authentication automatically:
    // - For token-based auth: adds Authorization header from localStorage
    // - For session-based auth (OAuth): uses cookies via withCredentials (withCredentials: true)
    // The backend authMiddleware will authenticate the request
    
    try {
      // Log the actual FormData before sending
      const formDataEntries: string[] = [];
      for (const pair of uploadFormData.entries()) {
        if (pair[1] instanceof File) {
          formDataEntries.push(`${pair[0]}: File(${pair[1].name}, ${pair[1].size} bytes, ${pair[1].type})`);
        } else {
          formDataEntries.push(`${pair[0]}: ${pair[1]}`);
        }
      }
      console.log('Sending FormData with entries:', formDataEntries);
      
      const uploadResponse = await apiClient.post('/upload/image', uploadFormData, {
        headers: {
          // Don't set Content-Type - let axios handle it for FormData
        },
      });
      return uploadResponse.data.url || uploadResponse.data.imageUrl;
    } catch (error: any) {
      // Handle specific auth errors with better messages
      if (error?.status === 401 || error?.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
      
      // Handle network errors
      if (error?.message === 'Network Error' || !error?.response) {
        throw new Error('Network error. Please check your connection and try again.');
      }
      
      // Log detailed error for debugging
      console.error('Upload error details:', {
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        message: error?.message,
      });
      
      // Handle file upload errors
      if (error?.response?.status === 400) {
        const errorMessage = error?.response?.data?.message || 'Invalid file. Please check file size and format.';
        throw new Error(errorMessage);
      }
      
      // Handle other errors
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to upload image';
      throw new Error(errorMessage);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check authentication
    if (!isAuthenticated || !user) {
      setError('You must be logged in to create a page. Please log in and try again.');
      return;
    }

    // Check reputation requirement
    if (requiredReputation > 0 && user.reputation < requiredReputation) {
      setError(`You need at least ${requiredReputation} reputation points to create a page. Your current reputation: ${user.reputation}`);
      return;
    }
    
    if (!formData.name.trim()) {
      setError('Page name is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      // Convert logo to base64 if provided (PagesController will handle S3 upload with correct prefix)
      let logoUrl = '';
      if (logoFile) {
        logoUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64String = reader.result as string;
            resolve(base64String);
          };
          reader.onerror = reject;
          reader.readAsDataURL(logoFile);
        });
      }

      // Convert cover to base64 if provided (PagesController will handle S3 upload with correct prefix)
      let coverImageUrl = '';
      if (coverFile) {
        coverImageUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64String = reader.result as string;
            resolve(base64String);
          };
          reader.onerror = reject;
          reader.readAsDataURL(coverFile);
        });
      }

      // Prepare social links - include website and all social platforms
      const socialLinks: Record<string, string> = {};
      if (formData.url) socialLinks.website = formData.url;
      if (formData.socialLinks.website) socialLinks.website = formData.socialLinks.website;
      if (formData.socialLinks.twitter) socialLinks.twitter = formData.socialLinks.twitter;
      if (formData.socialLinks.linkedin) socialLinks.linkedin = formData.socialLinks.linkedin;
      if (formData.socialLinks.github) socialLinks.github = formData.socialLinks.github;
      if (formData.socialLinks.discord) socialLinks.discord = formData.socialLinks.discord;
      if (formData.socialLinks.telegram) socialLinks.telegram = formData.socialLinks.telegram;
      if (formData.socialLinks.whatsapp) socialLinks.whatsapp = formData.socialLinks.whatsapp;
      if (formData.socialLinks.facebook) socialLinks.facebook = formData.socialLinks.facebook;
      if (formData.socialLinks.instagram) socialLinks.instagram = formData.socialLinks.instagram;
      if (formData.socialLinks.youtube) socialLinks.youtube = formData.socialLinks.youtube;

      // Create page
      await pagesService.createPage({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        shortBio: formData.shortBio.trim() || undefined,
        category: formData.category || undefined,
        username: formData.username.trim() || undefined,
        url: formData.url.trim() || undefined,
        logoUrl: logoUrl || undefined,
        coverImageUrl: coverImageUrl || undefined,
        socialLinks: Object.keys(socialLinks).length > 0 ? socialLinks : undefined,
      });

      setSuccess(true);
      setTimeout(() => {
        handleClose();
        onSuccess();
      }, 1500);
    } catch (err: any) {
      console.error('Error creating page:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to create page. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    
    setFormData({
      name: '',
      description: '',
      shortBio: '',
      category: '',
      username: '',
      url: '',
      socialLinks: {
      website: '',
        twitter: '',
        linkedin: '',
        github: '',
      discord: '',
      telegram: '',
      whatsapp: '',
      facebook: '',
      instagram: '',
      youtube: '',
      },
    });
    setLogoFile(null);
    setCoverFile(null);
    setLogoPreview(null);
    setCoverPreview(null);
    setError(null);
    setSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-800 backdrop-blur-sm">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Page</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Start building your community page
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <X size={24} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Success Message */}
          {success && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3">
              <CheckCircle size={20} className="text-green-600 dark:text-green-400 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-900 dark:text-green-100">Page created successfully!</p>
                <p className="text-sm text-green-700 dark:text-green-300">Redirecting...</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
              <AlertCircle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-red-900 dark:text-red-100">Error</p>
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          )}

          {/* Reputation Warning */}
          {requiredReputation > 0 && user && user.reputation < requiredReputation && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-start gap-3">
              <Award size={20} className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-yellow-900 dark:text-yellow-100">Reputation Required</p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  You need at least <strong>{requiredReputation}</strong> reputation points to create a page. Your current reputation: <strong>{user.reputation}</strong>
                </p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                  Gain reputation by posting quality content, getting upvotes, and engaging with the community.
                </p>
              </div>
            </div>
          )}

          {/* Cover Image */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">
              Cover Image <span className="text-gray-500 dark:text-gray-400 font-normal">(optional)</span>
            </label>
            <div className="relative h-32 rounded-xl overflow-hidden bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 group">
              {coverPreview && (
                <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
              )}
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 cursor-pointer transition-colors group-hover:bg-black/60">
                <div className="text-center text-white">
                  <Camera size={28} className="mx-auto mb-2" />
                  <span className="text-sm font-semibold">
                    {coverPreview ? 'Change Cover' : 'Upload Cover Image'}
                  </span>
                  <p className="text-xs mt-1 opacity-90">Recommended: 1200x300px</p>
                </div>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCoverSelect}
                  className="hidden"
                  disabled={isSubmitting}
                />
              </label>
              {coverPreview && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCoverFile(null);
                    setCoverPreview(null);
                    if (coverInputRef.current) coverInputRef.current.value = '';
                  }}
                  className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Logo */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">
              Page Logo <span className="text-gray-500 dark:text-gray-400 font-normal">(optional)</span>
            </label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex-shrink-0 flex items-center justify-center">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon size={32} className="text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <label
                  onClick={() => logoInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl font-semibold cursor-pointer transition-colors text-sm"
                >
                  <Upload size={18} />
                  {logoPreview ? 'Change Logo' : 'Upload Logo'}
                </label>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoSelect}
                  className="hidden"
                  disabled={isSubmitting}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Recommended: Square image, 512x512px
                </p>
              </div>
            </div>
          </div>

          {/* Page Name */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">
              Page Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter page name..."
              required
              disabled={isSubmitting}
              className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all"
            />
          </div>

          {/* Username (optional) */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">
              Username <span className="text-gray-500 dark:text-gray-400 font-normal">(optional, unique)</span>
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => {
                const sanitized = e.target.value.replace(/[^a-z0-9_-]/gi, '').toLowerCase();
                setFormData({ ...formData, username: sanitized });
              }}
              placeholder="username"
              pattern="[a-z0-9_-]+"
              title="Username can only contain lowercase letters, numbers, hyphens, and underscores"
              disabled={isSubmitting}
              className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all lowercase"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Only lowercase letters, numbers, hyphens, and underscores
            </p>
          </div>

          {/* Short Bio */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">
              Short Bio <span className="text-gray-500 dark:text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={formData.shortBio}
              onChange={(e) => setFormData({ ...formData, shortBio: e.target.value })}
              placeholder="A brief tagline for your page..."
              maxLength={160}
              disabled={isSubmitting}
              className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formData.shortBio.length}/160 characters
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">
              Description <span className="text-gray-500 dark:text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your page and what it's about..."
              rows={4}
              maxLength={500}
              disabled={isSubmitting}
              className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none resize-none transition-all"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formData.description.length}/500 characters
            </p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">
              Category <span className="text-gray-500 dark:text-gray-400 font-normal">(optional)</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              disabled={isSubmitting}
              className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Website URL */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">
              Website URL <span className="text-gray-500 dark:text-gray-400 font-normal">(optional)</span>
            </label>
            <div className="relative">
              <Globe size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://yourwebsite.com"
                disabled={isSubmitting}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all"
              />
            </div>
          </div>

          {/* Social Links */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">
              Social Links <span className="text-gray-500 dark:text-gray-400 font-normal">(optional)</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <Globe size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500" />
                <input
                  type="url"
                  value={formData.socialLinks.website}
                  onChange={(e) => setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, website: e.target.value }
                  })}
                  placeholder="https://yourwebsite.com"
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 outline-none transition-all"
                />
              </div>
              <div className="relative">
                <Twitter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-900 dark:text-slate-100" />
                <input
                  type="url"
                  value={formData.socialLinks.twitter}
                  onChange={(e) => setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, twitter: e.target.value }
                  })}
                  placeholder="https://twitter.com/yourhandle or @handle"
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-slate-500 focus:ring-4 focus:ring-slate-500/20 outline-none transition-all"
                />
              </div>
              <div className="relative">
                <Linkedin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600" />
                <input
                  type="url"
                  value={formData.socialLinks.linkedin}
                  onChange={(e) => setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, linkedin: e.target.value }
                  })}
                  placeholder="https://linkedin.com/company/yourcompany"
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all"
                />
              </div>
              <div className="relative">
                <Github size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-900 dark:text-gray-100" />
                <input
                  type="url"
                  value={formData.socialLinks.github}
                  onChange={(e) => setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, github: e.target.value }
                  })}
                  placeholder="https://github.com/yourorg"
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-gray-500 focus:ring-4 focus:ring-gray-500/20 outline-none transition-all"
                />
              </div>
              <div className="relative">
                <Gamepad2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-600" />
                <input
                  type="url"
                  value={formData.socialLinks.discord}
                  onChange={(e) => setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, discord: e.target.value }
                  })}
                  placeholder="https://discord.gg/invitecode or invitecode"
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all"
                />
              </div>
              <div className="relative">
                <Send size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-500" />
                <input
                  type="url"
                  value={formData.socialLinks.telegram}
                  onChange={(e) => setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, telegram: e.target.value }
                  })}
                  placeholder="https://t.me/yourchannel or @channel"
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20 outline-none transition-all"
                />
              </div>
              <div className="relative">
                <MessageCircle size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                <input
                  type="text"
                  value={formData.socialLinks.whatsapp}
                  onChange={(e) => setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, whatsapp: e.target.value }
                  })}
                  placeholder="+1234567890 or https://wa.me/1234567890"
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all"
                />
              </div>
              <div className="relative">
                <Facebook size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-700" />
                <input
                  type="url"
                  value={formData.socialLinks.facebook}
                  onChange={(e) => setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, facebook: e.target.value }
                  })}
                  placeholder="https://facebook.com/yourpage"
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-700 focus:ring-4 focus:ring-blue-700/20 outline-none transition-all"
                />
              </div>
              <div className="relative">
                <Instagram size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-600" />
                <input
                  type="url"
                  value={formData.socialLinks.instagram}
                  onChange={(e) => setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, instagram: e.target.value }
                  })}
                  placeholder="https://instagram.com/yourhandle or @handle"
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 outline-none transition-all"
                />
              </div>
              <div className="relative">
                <Youtube size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-red-600" />
                <input
                  type="url"
                  value={formData.socialLinks.youtube}
                  onChange={(e) => setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, youtube: e.target.value }
                  })}
                  placeholder="https://youtube.com/@yourchannel"
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-6 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-xl font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.name.trim()}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  Create Page
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
