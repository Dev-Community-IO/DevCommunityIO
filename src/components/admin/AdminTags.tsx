import { useState, useEffect, useRef } from 'react';
import { Hash, Star, TrendingUp, Edit, Upload, X, Save, Shield, Loader2, Trash2 } from 'lucide-react';
import { GlassCard } from '../GlassCard';
import { Badge } from '../Badge';
import tagsService, { Tag, UpdateTagParams } from '../../services/api/tags.service';
import { useAuth } from '../../contexts/AuthContext';
import adminService from '../../services/api/admin.service';

export function AdminTags() {
  const { user } = useAuth();
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [trendingTags, setTrendingTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFeatured, setFilterFeatured] = useState<string>('all');
  const [filterRestricted, setFilterRestricted] = useState<string>('all');
  
  // Edit modal state
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [editForm, setEditForm] = useState<UpdateTagParams>({
    name: '',
    category: '',
    featured: false,
    restrictedToRoles: [],
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const isSuperAdmin = user?.role === 'super_admin';
  const isAdmin = () => user?.role === 'admin' || user?.role === 'super_admin';

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      setIsLoading(true);
      const [tagsResponse, trendingResponse] = await Promise.all([
        tagsService.getTags({ search: searchQuery, featured: filterFeatured === 'featured' ? true : undefined }),
        tagsService.getTrendingTags('7d', 20),
      ]);

      setAllTags(tagsResponse.tags || tagsResponse.data || []);
      setTrendingTags(trendingResponse.tags || trendingResponse.data || []);
    } catch (error) {
      console.error('Failed to load tags:', error);
      setAllTags([]);
      setTrendingTags([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTags();
  }, [searchQuery, filterFeatured]);

  const handleEditTag = (tag: Tag) => {
    setEditingTag(tag);
    setEditForm({
      name: tag.name,
      category: tag.category || '',
      featured: tag.featured || false,
      restrictedToRoles: tag.restrictedToRoles || [],
    });
    setLogoPreview(tag.logoUrl || null);
    setLogoFile(null);
  };

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveTag = async () => {
    if (!editingTag) return;

    try {
      setIsSaving(true);
      const updateData: UpdateTagParams = { ...editForm };

      // Convert logo file to base64 if uploaded
      if (logoFile) {
        const reader = new FileReader();
        reader.onloadend = async () => {
          updateData.logoUrl = reader.result as string;
          await tagsService.updateTag(editingTag.slug, updateData);
          setIsSaving(false);
          setEditingTag(null);
          loadTags();
        };
        reader.readAsDataURL(logoFile);
      } else {
        await tagsService.updateTag(editingTag.slug, updateData);
        setIsSaving(false);
        setEditingTag(null);
        loadTags();
      }
    } catch (error) {
      console.error('Failed to update tag:', error);
      alert('Failed to update tag');
      setIsSaving(false);
    }
  };

  const handleDeleteTag = async (tagSlug: string) => {
    if (!confirm('Are you sure you want to delete this tag? This action cannot be undone.')) return;
    
    try {
      // Note: This endpoint might need to be created
      await adminService.removeContent('tag', tagSlug, 'Deleted by admin');
      loadTags();
    } catch (error) {
      console.error('Failed to delete tag:', error);
      alert('Failed to delete tag');
    }
  };

  const filteredTags = allTags.filter(tag => {
    if (filterRestricted === 'restricted' && (!tag.restrictedToRoles || tag.restrictedToRoles.length === 0)) {
      return false;
    }
    if (filterRestricted === 'unrestricted' && tag.restrictedToRoles && tag.restrictedToRoles.length > 0) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <GlassCard className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Hash size={20} className="text-gray-500" />
            <h3 className="text-lg font-semibold">Filters</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Search tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />

            <select
              value={filterFeatured}
              onChange={(e) => setFilterFeatured(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Tags</option>
              <option value="featured">Featured Only</option>
              <option value="unfeatured">Not Featured</option>
            </select>

            <select
              value={filterRestricted}
              onChange={(e) => setFilterRestricted(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Tags</option>
              <option value="restricted">Restricted</option>
              <option value="unrestricted">Not Restricted</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Trending Tags */}
      {trendingTags.length > 0 && (
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={20} className="text-green-500" />
            <h3 className="text-lg font-semibold">Trending Tags</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {trendingTags.map((tag) => (
              <div
                key={tag.id}
                className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 transition-all bg-white dark:bg-gray-800/50"
              >
                <div className="flex items-center gap-2 mb-2">
                  {tag.logoUrl ? (
                    <img src={tag.logoUrl} alt={tag.name} className="w-6 h-6 rounded object-cover" />
                  ) : (
                    <Hash size={16} className="text-gray-400" />
                  )}
                  <span className="font-medium text-sm">{tag.name}</span>
                  {tag.featured && <Star size={12} className="text-yellow-500 fill-yellow-500" />}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{tag.usageCount || 0} uses</span>
                  {isAdmin() && (
                    <button
                      onClick={() => handleEditTag(tag)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                      <Edit size={12} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* All Tags */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold mb-4">All Tags</h3>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        ) : filteredTags.length === 0 ? (
          <div className="text-center py-12">
            <Hash size={48} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No tags found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredTags.map((tag) => (
              <div
                key={tag.id}
                className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 transition-all bg-white dark:bg-gray-800/50"
              >
                <div className="flex items-center gap-2 mb-2">
                  {tag.logoUrl ? (
                    <img src={tag.logoUrl} alt={tag.name} className="w-6 h-6 rounded object-cover" />
                  ) : (
                    <Hash size={16} className="text-gray-400" />
                  )}
                  <span className="font-medium text-sm">{tag.name}</span>
                  {tag.featured && <Star size={12} className="text-yellow-500 fill-yellow-500" />}
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">{tag.usageCount || 0} uses</span>
                  {tag.restrictedToRoles && tag.restrictedToRoles.length > 0 && (
                    <Badge className="bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[10px] px-1.5 py-0.5">
                      <Shield size={8} className="inline mr-1" />
                      Restricted
                    </Badge>
                  )}
                </div>
                {isAdmin() && (
                  <div className="flex items-center gap-1 mt-2">
                    <button
                      onClick={() => handleEditTag(tag)}
                      className="flex-1 px-2 py-1 text-xs bg-purple-500 hover:bg-purple-600 text-white rounded transition-colors flex items-center justify-center gap-1"
                    >
                      <Edit size={12} />
                      Edit
                    </button>
                    {isSuperAdmin && (
                      <button
                        onClick={() => handleDeleteTag(tag.slug)}
                        className="px-2 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Edit Tag Modal */}
      {editingTag && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => {
              setEditingTag(null);
              setLogoPreview(null);
              setLogoFile(null);
            }}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <GlassCard className="max-w-2xl w-full p-6 animate-scale-in max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Edit Tag</h3>
                <button
                  onClick={() => {
                    setEditingTag(null);
                    setLogoPreview(null);
                    setLogoFile(null);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <input
                    type="text"
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                  />
                </div>

                {/* Logo Upload - Super Admin Only */}
                {isSuperAdmin && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Logo</label>
                    {logoPreview && (
                      <div className="mb-3">
                        <img src={logoPreview} alt="Logo preview" className="w-24 h-24 rounded-lg object-cover border border-gray-200 dark:border-gray-700" />
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLogoSelect}
                        className="hidden"
                      />
                      <button
                        onClick={() => logoInputRef.current?.click()}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Upload size={16} />
                        {logoPreview ? 'Change Logo' : 'Upload Logo'}
                      </button>
                      {logoPreview && (
                        <button
                          onClick={() => {
                            setLogoPreview(null);
                            setLogoFile(null);
                          }}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Featured Toggle - Super Admin Only */}
                {isSuperAdmin && (
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={editForm.featured || false}
                      onChange={(e) => setEditForm({ ...editForm, featured: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <label htmlFor="featured" className="flex items-center gap-2 cursor-pointer">
                      <Star size={16} className="text-yellow-500" />
                      <span className="font-medium">Featured Tag</span>
                    </label>
                  </div>
                )}

                {/* Role Restrictions */}
                {isAdmin() && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Role Restrictions</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editForm.restrictedToRoles?.includes('verified_user') || false}
                          onChange={(e) => {
                            const roles = editForm.restrictedToRoles || [];
                            if (e.target.checked) {
                              setEditForm({ ...editForm, restrictedToRoles: [...roles, 'verified_user'] });
                            } else {
                              setEditForm({ ...editForm, restrictedToRoles: roles.filter(r => r !== 'verified_user') });
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <span>Verified Users Only</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editForm.restrictedToRoles?.includes('verified_page') || false}
                          onChange={(e) => {
                            const roles = editForm.restrictedToRoles || [];
                            if (e.target.checked) {
                              setEditForm({ ...editForm, restrictedToRoles: [...roles, 'verified_page'] });
                            } else {
                              setEditForm({ ...editForm, restrictedToRoles: roles.filter(r => r !== 'verified_page') });
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <span>Verified Pages Only</span>
                      </label>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSaveTag}
                    disabled={isSaving}
                    className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Save Changes
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setEditingTag(null);
                      setLogoPreview(null);
                      setLogoFile(null);
                    }}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </GlassCard>
          </div>
        </>
      )}
    </div>
  );
}

