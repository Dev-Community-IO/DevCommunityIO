import { useState, useEffect, useRef } from 'react';
import { 
  Settings, 
  Upload, 
  Image, 
  Globe, 
  Twitter, 
  Save, 
  X,
  Eye,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Github,
  ExternalLink,
  Database,
  Lock,
  EyeOff,
  Server,
  Mail,
  Cloud,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { GlassCard } from '../GlassCard';
import adminService from '../../services/api/admin.service';
import siteSettingsService from '../../services/api/siteSettings.service';
import envSettingsService, { EnvSetting } from '../../services/api/envSettings.service';
import { useToast } from '../Toast';

interface AppSettings {
  // SEO
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterCard: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  
  // Assets
  logoUrl: string;
  faviconUrl: string;
  iconUrl: string;
  
  // General
  siteName: string;
  siteDescription: string;
  defaultLanguage: string;
  timezone: string;
}

export function AdminApp() {
  const toast = useToast();
  const [settings, setSettings] = useState<AppSettings>({
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    twitterCard: 'summary_large_image',
    twitterTitle: '',
    twitterDescription: '',
    twitterImage: '',
    logoUrl: '',
    faviconUrl: '',
    iconUrl: '',
    siteName: '',
    siteDescription: '',
    defaultLanguage: 'en',
    timezone: 'UTC',
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    seo: false,
    assets: false,
    general: false,
    github: false,
    env: false,
  });
  
  // Individual save states for each section
  const [savingSeo, setSavingSeo] = useState(false);
  const [savingAssets, setSavingAssets] = useState(false);
  const [savingGeneral, setSavingGeneral] = useState(false);
  const [savingGithub, setSavingGithub] = useState(false);
  const [saveSuccessSeo, setSaveSuccessSeo] = useState(false);
  const [saveSuccessAssets, setSaveSuccessAssets] = useState(false);
  const [saveSuccessGeneral, setSaveSuccessGeneral] = useState(false);
  const [saveSuccessGithub, setSaveSuccessGithub] = useState(false);
  
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };
  
  // GitHub URLs from site settings
  const [githubUrls, setGithubUrls] = useState({
    repo: '',
    issues: '',
    frontend: '',
    contribute: ''
  });

  // Environment Settings
  const [envSettings, setEnvSettings] = useState<Record<string, EnvSetting>>({});
  const [envCategories, setEnvCategories] = useState<string[]>([]);
  const [envGrouped, setEnvGrouped] = useState<Record<string, EnvSetting[]>>({});
  const [envLoading, setEnvLoading] = useState(false);
  const [envSaving, setEnvSaving] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  
  // File uploads
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [ogImageFile, setOgImageFile] = useState<File | null>(null);
  const [ogImagePreview, setOgImagePreview] = useState<string | null>(null);
  const [twitterImageFile, setTwitterImageFile] = useState<File | null>(null);
  const [twitterImagePreview, setTwitterImagePreview] = useState<string | null>(null);
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);
  const ogImageInputRef = useRef<HTMLInputElement>(null);
  const twitterImageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSettings();
    loadGithubUrls();
    loadEnvSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      
      // Load SEO settings from site_settings
      const seoSettings = await siteSettingsService.getSettings([
        'seo_default_title',
        'seo_default_description',
        'seo_default_keywords',
        'seo_og_title',
        'seo_og_description',
        'seo_og_image',
        'seo_twitter_card',
        'seo_twitter_title',
        'seo_twitter_description',
        'seo_twitter_image',
        'seo_logo_url',
        'seo_favicon_url',
        'seo_apple_touch_icon',
        'seo_site_name',
        'site_name',
        'site_description',
        'tagline',
      ]);
      
      setSettings({
        metaTitle: seoSettings.seo_default_title || '',
        metaDescription: seoSettings.seo_default_description || '',
        metaKeywords: seoSettings.seo_default_keywords || '',
        ogTitle: seoSettings.seo_og_title || '',
        ogDescription: seoSettings.seo_og_description || '',
        ogImage: seoSettings.seo_og_image || '',
        twitterCard: seoSettings.seo_twitter_card || 'summary_large_image',
        twitterTitle: seoSettings.seo_twitter_title || '',
        twitterDescription: seoSettings.seo_twitter_description || '',
        twitterImage: seoSettings.seo_twitter_image || '',
        logoUrl: seoSettings.seo_logo_url || '',
        faviconUrl: seoSettings.seo_favicon_url || '',
        iconUrl: seoSettings.seo_apple_touch_icon || '',
        siteName: seoSettings.seo_site_name || seoSettings.site_name || '',
        siteDescription: seoSettings.site_description || seoSettings.tagline || '',
        defaultLanguage: 'en',
        timezone: 'UTC',
      });
      
      setLogoPreview(seoSettings.seo_logo_url || null);
      setFaviconPreview(seoSettings.seo_favicon_url || null);
      setIconPreview(seoSettings.seo_apple_touch_icon || null);
      setOgImagePreview(seoSettings.seo_og_image || null);
      setTwitterImagePreview(seoSettings.seo_twitter_image || null);
    } catch (error) {
      console.error('Failed to load app settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadGithubUrls = async () => {
    try {
      const settings = await siteSettingsService.getSettings([
        'github_repo_url',
        'github_issues_url',
        'github_frontend_repo_url',
        'github_contribute_url'
      ]);
      setGithubUrls({
        repo: settings.github_repo_url || '',
        issues: settings.github_issues_url || '',
        frontend: settings.github_frontend_repo_url || '',
        contribute: settings.github_contribute_url || ''
      });
    } catch (error) {
      console.error('Failed to load GitHub URLs:', error);
      setGithubUrls({
        repo: '',
        issues: '',
        frontend: '',
        contribute: ''
      });
    }
  };

  const handleFileSelect = (
    file: File | null,
    type: 'logo' | 'favicon' | 'icon' | 'ogImage' | 'twitterImage',
    setPreview: (preview: string | null) => void
  ) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleAssetUpload = async (type: 'logo' | 'favicon' | 'icon' | 'ogImage' | 'twitterImage', file: File): Promise<string> => {
    try {
      const result = await adminService.uploadAsset(type, file);
      const url = result.url || result[`${type}Url`] || result[`${type === 'ogImage' ? 'ogImageUrl' : type === 'twitterImage' ? 'twitterImageUrl' : type === 'logo' ? 'logoUrl' : type === 'favicon' ? 'faviconUrl' : 'iconUrl'}`];
      
      if (!url) {
        throw new Error(`No URL returned for ${type}`);
      }
      
      if (type === 'logo') {
        setSettings({ ...settings, logoUrl: url });
        setLogoPreview(url);
      } else if (type === 'favicon') {
        setSettings({ ...settings, faviconUrl: url });
        setFaviconPreview(url);
      } else if (type === 'icon') {
        setSettings({ ...settings, iconUrl: url });
        setIconPreview(url);
      } else if (type === 'ogImage') {
        setSettings({ ...settings, ogImage: url });
        setOgImagePreview(url);
      } else if (type === 'twitterImage') {
        setSettings({ ...settings, twitterImage: url });
        setTwitterImagePreview(url);
      }
      
      // Clear file inputs
      if (type === 'logo') setLogoFile(null);
      else if (type === 'favicon') setFaviconFile(null);
      else if (type === 'icon') setIconFile(null);
      else if (type === 'ogImage') setOgImageFile(null);
      else if (type === 'twitterImage') setTwitterImageFile(null);
      
      return url;
    } catch (error) {
      console.error(`Failed to upload ${type}:`, error);
      throw error;
    }
  };

  const loadEnvSettings = async () => {
    try {
      setEnvLoading(true);
      const data = await envSettingsService.getSettings();
      
      // Convert array to object for easier access
      const settingsMap: Record<string, EnvSetting> = {};
      data.settings.forEach((setting: EnvSetting) => {
        settingsMap[setting.key] = setting;
      });

      setEnvSettings(settingsMap);
      setEnvCategories(data.categories);
      setEnvGrouped(data.grouped);
    } catch (error) {
      console.error('Failed to load environment settings:', error);
    } finally {
      setEnvLoading(false);
    }
  };

  const handleEnvSettingChange = (key: string, value: string) => {
    setEnvSettings(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        value,
      },
    }));
  };

  const handleSaveEnvSettings = async () => {
    try {
      setEnvSaving(true);
      const settingsToSave: Record<string, string | number | boolean> = {};

      Object.values(envSettings).forEach(setting => {
        if (setting.type === 'number') {
          settingsToSave[setting.key] = Number(setting.value) || 0;
        } else if (setting.type === 'boolean') {
          settingsToSave[setting.key] = setting.value === 'true';
        } else {
          settingsToSave[setting.key] = setting.value;
        }
      });

      await envSettingsService.updateSettings(settingsToSave);
      toast.success('Environment settings saved successfully!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to save environment settings';
      toast.error(errorMessage);
    } finally {
      setEnvSaving(false);
    }
  };

  const togglePasswordVisibility = (key: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Database':
        return <Database size={18} className="text-blue-500" />;
      case 'Redis':
        return <Server size={18} className="text-red-500" />;
      case 'AWS S3':
        return <Cloud size={18} className="text-orange-500" />;
      case 'OAuth':
        return <Lock size={18} className="text-purple-500" />;
      case 'Session':
        return <Lock size={18} className="text-green-500" />;
      case 'Rate Limiting':
        return <Settings size={18} className="text-yellow-500" />;
      case 'CORS':
        return <Globe size={18} className="text-cyan-500" />;
      case 'Email':
        return <Mail size={18} className="text-pink-500" />;
      case 'Push Notifications':
        return <Settings size={18} className="text-indigo-500" />;
      default:
        return <Settings size={18} className="text-gray-500" />;
    }
  };

  // Individual save handlers for each section
  const handleSaveSeo = async () => {
    try {
      setSavingSeo(true);
      
      // Upload OG image if needed
      if (ogImageFile) {
        const result = await adminService.uploadAsset('ogImage' as any, ogImageFile);
        setSettings({ ...settings, ogImage: result.url || result.ogImageUrl });
        setOgImagePreview(result.url || result.ogImageUrl);
        setOgImageFile(null);
      }
      
      // Upload Twitter image if needed
      if (twitterImageFile) {
        const result = await adminService.uploadAsset('twitterImage' as any, twitterImageFile);
        setSettings({ ...settings, twitterImage: result.url || result.twitterImageUrl });
        setTwitterImagePreview(result.url || result.twitterImageUrl);
        setTwitterImageFile(null);
      }
      
      // Save SEO settings to site_settings
      const seoSettings = {
        'seo_default_title': settings.metaTitle,
        'seo_default_description': settings.metaDescription,
        'seo_default_keywords': settings.metaKeywords,
        'seo_og_title': settings.ogTitle,
        'seo_og_description': settings.ogDescription,
        'seo_og_image': settings.ogImage || ogImagePreview || '',
        'seo_twitter_card': settings.twitterCard,
        'seo_twitter_title': settings.twitterTitle,
        'seo_twitter_description': settings.twitterDescription,
        'seo_twitter_image': settings.twitterImage || twitterImagePreview || '',
      };
      
      for (const [key, value] of Object.entries(seoSettings)) {
        if (value) {
          await adminService.updateSiteSetting(key, value);
        }
      }
      
      setSaveSuccessSeo(true);
      setTimeout(() => setSaveSuccessSeo(false), 3000);
      toast.success('SEO settings saved successfully!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to save SEO settings';
      toast.error(errorMessage);
    } finally {
      setSavingSeo(false);
    }
  };

  const handleSaveAssets = async () => {
    try {
      setSavingAssets(true);
      
      const uploadedUrls: Record<string, string> = {};
      
      // Upload files if any and collect URLs
      if (logoFile) {
        const url = await handleAssetUpload('logo', logoFile);
        uploadedUrls.logoUrl = url;
      }
      if (faviconFile) {
        const url = await handleAssetUpload('favicon', faviconFile);
        uploadedUrls.faviconUrl = url;
      }
      if (iconFile) {
        const url = await handleAssetUpload('icon', iconFile);
        uploadedUrls.iconUrl = url;
      }
      if (ogImageFile) {
        const url = await handleAssetUpload('ogImage', ogImageFile);
        uploadedUrls.ogImageUrl = url;
      }
      
      // Save asset URLs to site_settings (use uploaded URLs or current settings)
      const logoUrlToSave = uploadedUrls.logoUrl || settings.logoUrl;
      const faviconUrlToSave = uploadedUrls.faviconUrl || settings.faviconUrl;
      const iconUrlToSave = uploadedUrls.iconUrl || settings.iconUrl;
      const ogImageUrlToSave = uploadedUrls.ogImageUrl || settings.ogImage;
      
      if (logoUrlToSave) {
        await adminService.updateSiteSetting('seo_logo_url', logoUrlToSave);
      }
      if (faviconUrlToSave) {
        await adminService.updateSiteSetting('seo_favicon_url', faviconUrlToSave);
      }
      if (iconUrlToSave) {
        await adminService.updateSiteSetting('seo_apple_touch_icon', iconUrlToSave);
      }
      if (ogImageUrlToSave) {
        await adminService.updateSiteSetting('seo_og_image', ogImageUrlToSave);
      }
      
      setSaveSuccessAssets(true);
      setTimeout(() => setSaveSuccessAssets(false), 3000);
      toast.success('Asset settings saved successfully!');
      
      // Invalidate cache and reload dynamic assets to apply changes immediately
      if (typeof window !== 'undefined') {
        const { loadAndApplyDynamicAssets } = await import('../../utils/dynamicAssets');
        const { localStorageCache, CacheKeys } = await import('../../utils/cache');
        // Invalidate dynamic assets cache to force fresh load
        localStorageCache.remove(CacheKeys.DYNAMIC_ASSETS);
        loadAndApplyDynamicAssets().catch(console.error);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save asset settings';
      toast.error(errorMessage);
    } finally {
      setSavingAssets(false);
      }
  };

  const handleSaveGeneral = async () => {
    try {
      setSavingGeneral(true);
      
      // Save general settings to site_settings
      const generalSettings = {
        'seo_site_name': settings.siteName,
        'site_name': settings.siteName,
        'site_description': settings.siteDescription,
        'tagline': settings.siteDescription,
      };
      
      for (const [key, value] of Object.entries(generalSettings)) {
        if (value) {
          await adminService.updateSiteSetting(key, value);
        }
      }
      
      setSaveSuccessGeneral(true);
      setTimeout(() => setSaveSuccessGeneral(false), 3000);
      toast.success('General settings saved successfully!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to save general settings';
      toast.error(errorMessage);
    } finally {
      setSavingGeneral(false);
    }
  };

  const handleSaveGithub = async () => {
    try {
      setSavingGithub(true);
      
      // Save GitHub URLs to site_settings
      if (githubUrls.repo) {
        await adminService.updateSiteSetting('github_repo_url', githubUrls.repo);
      }
      if (githubUrls.issues) {
        await adminService.updateSiteSetting('github_issues_url', githubUrls.issues);
      }
      if (githubUrls.frontend) {
        await adminService.updateSiteSetting('github_frontend_repo_url', githubUrls.frontend);
      }
      if (githubUrls.contribute) {
        await adminService.updateSiteSetting('github_contribute_url', githubUrls.contribute);
      }
      
      setSaveSuccessGithub(true);
      setTimeout(() => setSaveSuccessGithub(false), 3000);
      toast.success('GitHub settings saved successfully!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to save GitHub settings';
      toast.error(errorMessage);
    } finally {
      setSavingGithub(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* SEO Settings */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
          <Globe size={22} className="text-purple-500" />
          <h3 className="text-xl font-bold">SEO Settings</h3>
          </div>
          <div className="flex items-center gap-2">
            {saveSuccessSeo && (
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm">
                <CheckCircle2 size={16} />
                <span>Saved!</span>
              </div>
            )}
            <button
              onClick={handleSaveSeo}
              disabled={savingSeo}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all duration-300 font-medium shadow-lg shadow-purple-500/30 disabled:opacity-50 flex items-center gap-2"
            >
              {savingSeo ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save SEO
                </>
              )}
            </button>
            <button
              onClick={() => toggleSection('seo')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              {expandedSections.seo ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </button>
          </div>
        </div>

        {expandedSections.seo && (
        <div className="space-y-6">
          {/* Meta Tags */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-700 dark:text-gray-300">Meta Tags</h4>
            
            <div>
              <label className="block text-sm font-medium mb-2">Meta Title</label>
              <input
                type="text"
                value={settings.metaTitle}
                onChange={(e) => setSettings({ ...settings, metaTitle: e.target.value })}
                placeholder="Your Site Title"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                maxLength={60}
              />
              <p className="text-xs text-gray-500 mt-1">{settings.metaTitle.length}/60 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Meta Description</label>
              <textarea
                value={settings.metaDescription}
                onChange={(e) => setSettings({ ...settings, metaDescription: e.target.value })}
                placeholder="Your site description"
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                maxLength={160}
              />
              <p className="text-xs text-gray-500 mt-1">{settings.metaDescription.length}/160 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Meta Keywords</label>
              <input
                type="text"
                value={settings.metaKeywords}
                onChange={(e) => setSettings({ ...settings, metaKeywords: e.target.value })}
                placeholder="keyword1, keyword2, keyword3"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              />
            </div>
          </div>

          {/* Open Graph */}
          <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6">
            <h4 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Image size={18} />
              Open Graph Tags
            </h4>
            
            <div>
              <label className="block text-sm font-medium mb-2">OG Title</label>
              <input
                type="text"
                value={settings.ogTitle}
                onChange={(e) => setSettings({ ...settings, ogTitle: e.target.value })}
                placeholder="Open Graph Title"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">OG Description</label>
              <textarea
                value={settings.ogDescription}
                onChange={(e) => setSettings({ ...settings, ogDescription: e.target.value })}
                placeholder="Open Graph Description"
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">OG Image</label>
              {ogImagePreview && (
                <div className="mb-3">
                  <img 
                    src={ogImagePreview} 
                    alt="OG Image Preview" 
                    className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                  />
                </div>
              )}
              <div className="flex items-center gap-3">
                <input
                  ref={ogImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setOgImageFile(file);
                    handleFileSelect(file, 'ogImage', setOgImagePreview);
                  }}
                  className="hidden"
                />
                <button
                  onClick={() => ogImageInputRef.current?.click()}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Upload size={16} />
                  {ogImagePreview ? 'Change Image' : 'Upload OG Image'}
                </button>
                {ogImagePreview && (
                  <button
                    onClick={() => {
                      setOgImagePreview(null);
                      setOgImageFile(null);
                      setSettings({ ...settings, ogImage: '' });
                    }}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Twitter Cards */}
          <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6">
            <h4 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Twitter size={18} />
              Twitter Cards
            </h4>
            
            <div>
              <label className="block text-sm font-medium mb-2">Card Type</label>
              <select
                value={settings.twitterCard}
                onChange={(e) => setSettings({ ...settings, twitterCard: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              >
                <option value="summary">Summary</option>
                <option value="summary_large_image">Summary Large Image</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Twitter Title</label>
              <input
                type="text"
                value={settings.twitterTitle}
                onChange={(e) => setSettings({ ...settings, twitterTitle: e.target.value })}
                placeholder="Twitter Card Title"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Twitter Description</label>
              <textarea
                value={settings.twitterDescription}
                onChange={(e) => setSettings({ ...settings, twitterDescription: e.target.value })}
                placeholder="Twitter Card Description"
                rows={2}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Twitter Image</label>
              {twitterImagePreview && (
                <div className="mb-3">
                  <img 
                    src={twitterImagePreview} 
                    alt="Twitter Image Preview" 
                    className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                  />
                </div>
              )}
              <div className="flex items-center gap-3">
              <input
                  ref={twitterImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setTwitterImageFile(file);
                    handleFileSelect(file, 'twitterImage', setTwitterImagePreview);
                  }}
                  className="hidden"
                />
                <button
                  onClick={() => twitterImageInputRef.current?.click()}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Upload size={16} />
                  {twitterImagePreview ? 'Change Image' : 'Upload Twitter Image'}
                </button>
                {twitterImagePreview && (
                  <button
                    onClick={() => {
                      setTwitterImagePreview(null);
                      setTwitterImageFile(null);
                      setSettings({ ...settings, twitterImage: '' });
                    }}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* SEO Preview */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <Eye size={18} />
              SEO Preview
            </h4>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="text-blue-600 dark:text-blue-400 text-sm mb-1">
                {settings.metaTitle || 'Your Site Title'}
              </div>
              <div className="text-green-700 dark:text-green-400 text-xs mb-2">
                {window.location.origin}
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">
                {settings.metaDescription || 'Your site description will appear here'}
              </div>
            </div>
          </div>
        </div>
        )}
      </GlassCard>

      {/* Assets */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
          <Image size={22} className="text-purple-500" />
          <h3 className="text-xl font-bold">Assets</h3>
          </div>
          <div className="flex items-center gap-2">
            {saveSuccessAssets && (
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm">
                <CheckCircle2 size={16} />
                <span>Saved!</span>
              </div>
            )}
            <button
              onClick={handleSaveAssets}
              disabled={savingAssets}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all duration-300 font-medium shadow-lg shadow-purple-500/30 disabled:opacity-50 flex items-center gap-2"
            >
              {savingAssets ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Assets
                </>
              )}
            </button>
            <button
              onClick={() => toggleSection('assets')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              {expandedSections.assets ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </button>
          </div>
        </div>

        {expandedSections.assets && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Logo */}
          <div>
            <label className="block text-sm font-medium mb-2">Logo</label>
            {logoPreview && (
              <div className="mb-3">
                <img 
                  src={logoPreview} 
                  alt="Logo Preview" 
                  className="w-full h-32 object-contain rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-2"
                />
              </div>
            )}
            <div className="flex items-center gap-2">
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setLogoFile(file);
                  handleFileSelect(file, 'logo', setLogoPreview);
                }}
                className="hidden"
              />
              <button
                onClick={() => logoInputRef.current?.click()}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Upload size={16} />
                {logoPreview ? 'Change' : 'Upload'}
              </button>
              {logoPreview && (
                <button
                  onClick={() => {
                    setLogoPreview(null);
                    setLogoFile(null);
                    setSettings({ ...settings, logoUrl: '' });
                  }}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Favicon */}
          <div>
            <label className="block text-sm font-medium mb-2">Favicon</label>
            {faviconPreview && (
              <div className="mb-3">
                <img 
                  src={faviconPreview} 
                  alt="Favicon Preview" 
                  className="w-16 h-16 object-contain rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 mx-auto"
                />
              </div>
            )}
            <div className="flex items-center gap-2">
              <input
                ref={faviconInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setFaviconFile(file);
                  handleFileSelect(file, 'favicon', setFaviconPreview);
                }}
                className="hidden"
              />
              <button
                onClick={() => faviconInputRef.current?.click()}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Upload size={16} />
                {faviconPreview ? 'Change' : 'Upload'}
              </button>
              {faviconPreview && (
                <button
                  onClick={() => {
                    setFaviconPreview(null);
                    setFaviconFile(null);
                    setSettings({ ...settings, faviconUrl: '' });
                  }}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* PWA Icon (for App Install) */}
          <div>
            <label className="block text-sm font-medium mb-2">
              PWA Icon <span className="text-xs text-gray-500">(for app install)</span>
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Square icon used for PWA installation on Android/iOS. Will be resized to 180x180, 192x192, and 512x512.
            </p>
            {iconPreview && (
              <div className="mb-3">
                <img 
                  src={iconPreview} 
                  alt="PWA Icon Preview" 
                  className="w-16 h-16 object-contain rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 mx-auto"
                />
              </div>
            )}
            <div className="flex items-center gap-2">
              <input
                ref={iconInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setIconFile(file);
                  handleFileSelect(file, 'icon', setIconPreview);
                }}
                className="hidden"
              />
              <button
                onClick={() => iconInputRef.current?.click()}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Upload size={16} />
                {iconPreview ? 'Change' : 'Upload'}
              </button>
              {iconPreview && (
                <button
                  onClick={() => {
                    setIconPreview(null);
                    setIconFile(null);
                    setSettings({ ...settings, iconUrl: '' });
                  }}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
        )}
      </GlassCard>

      {/* General Settings */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
          <Settings size={22} className="text-purple-500" />
          <h3 className="text-xl font-bold">General Settings</h3>
          </div>
          <div className="flex items-center gap-2">
            {saveSuccessGeneral && (
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm">
                <CheckCircle2 size={16} />
                <span>Saved!</span>
              </div>
            )}
            <button
              onClick={handleSaveGeneral}
              disabled={savingGeneral}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all duration-300 font-medium shadow-lg shadow-purple-500/30 disabled:opacity-50 flex items-center gap-2"
            >
              {savingGeneral ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save General
                </>
              )}
            </button>
            <button
              onClick={() => toggleSection('general')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              {expandedSections.general ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </button>
          </div>
        </div>

        {expandedSections.general && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Site Name</label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              placeholder="Your Site Name"
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Default Language</label>
            <select
              value={settings.defaultLanguage}
              onChange={(e) => setSettings({ ...settings, defaultLanguage: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            >
              <option value="en">English</option>
              <option value="fr">French</option>
              <option value="es">Spanish</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Site Description</label>
            <textarea
              value={settings.siteDescription}
              onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
              placeholder="Brief description of your site"
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Timezone</label>
            <select
              value={settings.timezone}
              onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="Europe/London">London</option>
              <option value="Europe/Paris">Paris</option>
              <option value="Asia/Tokyo">Tokyo</option>
            </select>
          </div>
        </div>
        )}
      </GlassCard>

      {/* GitHub Settings */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
          <Github size={22} className="text-purple-500" />
          <h3 className="text-xl font-bold">GitHub Settings</h3>
          </div>
          <div className="flex items-center gap-2">
            {saveSuccessGithub && (
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm">
                <CheckCircle2 size={16} />
                <span>Saved!</span>
              </div>
            )}
            <button
              onClick={handleSaveGithub}
              disabled={savingGithub}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all duration-300 font-medium shadow-lg shadow-purple-500/30 disabled:opacity-50 flex items-center gap-2"
            >
              {savingGithub ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save GitHub
                </>
              )}
            </button>
            <button
              onClick={() => toggleSection('github')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              {expandedSections.github ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </button>
          </div>
        </div>

        {expandedSections.github && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Main Repository URL</label>
            <input
              type="url"
              value={githubUrls.repo}
              onChange={(e) => setGithubUrls({ ...githubUrls, repo: e.target.value })}
              placeholder="https://github.com/your-org/devcommunity"
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Issues URL (Report Issue)</label>
            <input
              type="url"
              value={githubUrls.issues}
              onChange={(e) => setGithubUrls({ ...githubUrls, issues: e.target.value })}
              placeholder="https://github.com/your-org/devcommunity/issues"
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Frontend Repository URL</label>
            <input
              type="url"
              value={githubUrls.frontend}
              onChange={(e) => setGithubUrls({ ...githubUrls, frontend: e.target.value })}
              placeholder="https://github.com/your-org/devcommunity-frontend"
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Contribute/CONTRIBUTING.md URL</label>
            <input
              type="url"
              value={githubUrls.contribute}
              onChange={(e) => setGithubUrls({ ...githubUrls, contribute: e.target.value })}
              placeholder="https://github.com/your-org/devcommunity/blob/main/CONTRIBUTING.md"
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            />
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Note:</strong> These GitHub URLs will be used throughout the platform for "Report Issue" buttons and contribution links. 
              They will be stored in the site_settings database table and managed here.
            </p>
          </div>
        </div>
        )}
      </GlassCard>

      {/* Environment Settings */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Server size={22} className="text-purple-500" />
            <h3 className="text-xl font-bold">Environment Variables</h3>
          </div>
          <div className="flex items-center gap-2">
          <button
            onClick={handleSaveEnvSettings}
            disabled={envSaving || envLoading}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all duration-300 font-medium shadow-lg shadow-purple-500/30 disabled:opacity-50 flex items-center gap-2"
          >
            {envSaving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Environment Settings
              </>
            )}
          </button>
            <button
              onClick={() => toggleSection('env')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              {expandedSections.env ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </button>
          </div>
        </div>

        {expandedSections.env && (
          <>
        {envLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        ) : (
          <div className="space-y-6">
            {envCategories.map((category) => (
              <div key={category} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                  {getCategoryIcon(category)}
                  <h4 className="text-lg font-semibold">{category}</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {envGrouped[category]?.map((setting) => (
                    <div key={setting.key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          {setting.key}
                          {setting.isSensitive && (
                            <Lock size={12} className="inline ml-2 text-red-500" />
                          )}
                        </label>
                        {setting.type === 'password' && (
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(setting.key)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                            aria-label={showPasswords[setting.key] ? 'Hide' : 'Show'}
                          >
                            {showPasswords[setting.key] ? (
                              <EyeOff size={16} className="text-gray-500" />
                            ) : (
                              <Eye size={16} className="text-gray-500" />
                            )}
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {setting.description}
                      </p>
                      {setting.type === 'boolean' ? (
                        <select
                          value={setting.value}
                          onChange={(e) => handleEnvSettingChange(setting.key, e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                        >
                          <option value="true">True</option>
                          <option value="false">False</option>
                        </select>
                      ) : (
                        <input
                          type={setting.type === 'password' && !showPasswords[setting.key] ? 'password' : setting.type === 'number' ? 'number' : 'text'}
                          value={setting.value}
                          onChange={(e) => handleEnvSettingChange(setting.key, e.target.value)}
                          placeholder={`Enter ${setting.key}`}
                          className={`w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 ${
                            setting.isSensitive ? 'font-mono text-sm' : ''
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle size={18} className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>Important:</strong> Environment variable changes are stored in the database and will take effect after server restart. 
                  Sensitive fields (marked with 🔒) are masked by default. Click the eye icon to reveal them when editing.
                </div>
              </div>
            </div>
          </div>
        )}
            </>
          )}
      </GlassCard>
    </div>
  );
}

