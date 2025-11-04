import { useState, useEffect, useRef } from 'react';
import { 
  Award, 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  X, 
  Save, 
  Loader2,
  Search,
  Filter,
  Eye,
  EyeOff,
  Star,
  TrendingUp
} from 'lucide-react';
import { GlassCard } from '../GlassCard';
import { Badge } from '../Badge';
import { AchievementBadge } from '../AchievementBadge';
import achievementsService, { Achievement } from '../../services/api/achievements.service';
import adminService from '../../services/api/admin.service';

interface AchievementStats {
  total: number;
  unlocked: number;
  hidden: number;
  byDifficulty: Record<string, number>;
  byCategory: Record<string, number>;
  totalReputationRequired: number;
}

export function AdminAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<AchievementStats>({
    total: 0,
    unlocked: 0,
    hidden: 0,
    byDifficulty: {},
    byCategory: {},
    totalReputationRequired: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterHidden, setFilterHidden] = useState<string>('all');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image_url: '',
    category: 'general',
    difficulty: 'easy' as 'easy' | 'medium' | 'hard' | 'expert' | 'legendary',
    reputation_required: 10,
    criteria: {
      type: 'reputation',
      value: 10,
    },
    is_hidden: false,
    order: 0,
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadAchievements();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [achievements]);

  const loadAchievements = async () => {
    try {
      setIsLoading(true);
      const data = await achievementsService.getAll();
      setAchievements(data);
    } catch (error) {
      console.error('Failed to load achievements:', error);
      setAchievements([]);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = () => {
    const unlocked = achievements.filter(a => a.isUnlocked).length;
    const hidden = achievements.filter(a => a.is_hidden).length;
    
    const byDifficulty: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    let totalReputationRequired = 0;

    achievements.forEach(a => {
      byDifficulty[a.difficulty] = (byDifficulty[a.difficulty] || 0) + 1;
      byCategory[a.category] = (byCategory[a.category] || 0) + 1;
      totalReputationRequired += a.reputation_required || 0;
    });

    setStats({
      total: achievements.length,
      unlocked,
      hidden,
      byDifficulty,
      byCategory,
      totalReputationRequired,
    });
  };

  const handleEdit = (achievement: Achievement) => {
    setEditingAchievement(achievement);
    const criteriaValue = typeof achievement.criteria?.value === 'number' 
      ? achievement.criteria.value 
      : achievement.reputation_required || 0;
    setFormData({
      name: achievement.name,
      slug: achievement.slug, // Slug is read-only, will be auto-generated from name
      description: achievement.description,
      image_url: achievement.image_url || '',
      category: achievement.category,
      difficulty: achievement.difficulty,
      reputation_required: achievement.reputation_required || 0,
      criteria: {
        type: 'reputation',
        value: criteriaValue,
      },
      is_hidden: achievement.is_hidden,
      order: achievement.order,
    });
    setImagePreview(achievement.image_url || null);
    setImageFile(null);
    setShowCreateModal(true);
  };

  const handleCreate = () => {
    setEditingAchievement(null);
    setFormData({
      name: '',
      slug: '', // Will be auto-generated from name
      description: '',
      image_url: '',
      category: 'general',
      difficulty: 'easy',
      reputation_required: 10,
      criteria: {
        type: 'reputation',
        value: 10,
      },
      is_hidden: false,
      order: 0,
    });
    setImagePreview(null);
    setImageFile(null);
    setShowCreateModal(true);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      let imageUrl = formData.image_url;
      
      // Upload image if new file selected
      if (imageFile) {
        // Convert to base64
        const base64Image = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(imageFile!);
        });
        imageUrl = base64Image;
      }

      // Auto-generate slug from name (slug is read-only in UI)
      const achievementSlug = formData.name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const achievementData = {
        name: formData.name,
        description: formData.description,
        image_url: imageUrl,
        category: formData.category,
        difficulty: formData.difficulty,
        reputation_required: formData.reputation_required,
        criteria: {
          type: 'reputation',
          value: formData.reputation_required, // Use reputation_required as criteria value
        },
        is_hidden: formData.is_hidden,
        order: formData.order,
        // Don't send slug - backend will auto-generate it
      };

      if (editingAchievement) {
        // Update existing achievement
        await adminService.updateAchievement(editingAchievement.id, achievementData);
      } else {
        // Create new achievement
        await adminService.createAchievement(achievementData);
      }

      setShowCreateModal(false);
      setEditingAchievement(null);
      loadAchievements();
    } catch (error) {
      console.error('Failed to save achievement:', error);
      alert('Failed to save achievement');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this achievement? This action cannot be undone.')) return;
    
    try {
      await adminService.deleteAchievement(id);
      loadAchievements();
    } catch (error) {
      console.error('Failed to delete achievement:', error);
      alert('Failed to delete achievement');
    }
  };

  const handleToggleHidden = async (achievement: Achievement) => {
    try {
      await adminService.updateAchievement(achievement.id, {
        is_hidden: !achievement.is_hidden,
      });
      loadAchievements();
    } catch (error) {
      console.error('Failed to update achievement:', error);
      alert('Failed to update achievement');
    }
  };

  const filteredAchievements = achievements.filter(a => {
    if (searchQuery && !a.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !a.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filterDifficulty !== 'all' && a.difficulty !== filterDifficulty) {
      return false;
    }
    if (filterCategory !== 'all' && a.category !== filterCategory) {
      return false;
    }
    if (filterHidden === 'hidden' && !a.is_hidden) {
      return false;
    }
    if (filterHidden === 'visible' && a.is_hidden) {
      return false;
    }
    return true;
  });

  const categories = Array.from(new Set(achievements.map(a => a.category)));

  const difficultyColors = {
    easy: 'bg-green-500/10 text-green-600 dark:text-green-400',
    medium: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    hard: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    expert: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    legendary: 'bg-red-500/10 text-red-600 dark:text-red-400',
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 shadow-lg shadow-yellow-500/30">
              <Award className="text-white" size={24} />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">{stats.total}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Achievements</p>
        </GlassCard>

        <GlassCard className="p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg shadow-green-500/30">
              <Star className="text-white" size={24} />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">{stats.unlocked}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Unlocked</p>
        </GlassCard>

        <GlassCard className="p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30">
              <EyeOff className="text-white" size={24} />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">{stats.hidden}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Hidden</p>
        </GlassCard>

        <GlassCard className="p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/30">
              <TrendingUp className="text-white" size={24} />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">{stats.totalReputationRequired.toLocaleString()}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Rep Required</p>
        </GlassCard>
      </div>

      {/* Filters & Actions */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-500" />
            <h3 className="text-lg font-semibold">Filters</h3>
          </div>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all duration-300 flex items-center gap-2 shadow-lg shadow-purple-500/30"
          >
            <Plus size={18} />
            Create Achievement
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search achievements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
            <option value="expert">Expert</option>
            <option value="legendary">Legendary</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={filterHidden}
            onChange={(e) => setFilterHidden(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All</option>
            <option value="visible">Visible</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>
      </GlassCard>

      {/* Achievements Grid */}
      <GlassCard className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        ) : filteredAchievements.length === 0 ? (
          <div className="text-center py-12">
            <Award size={48} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No achievements found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 transition-all bg-white dark:bg-gray-800/50"
              >
                <div className="flex flex-col items-center mb-4">
                  <AchievementBadge
                    achievement={{
                      ...achievement,
                      isUnlocked: false, // Admin view: show all as locked (for preview)
                      image_url: achievement.image_url || undefined,
                    }}
                    size="md"
                  />
                  {achievement.is_hidden && (
                    <Badge className="bg-gray-500/10 text-gray-600 dark:text-gray-400 mt-2">
                      <EyeOff size={12} className="inline mr-1" />
                      Hidden
                    </Badge>
                  )}
                </div>

                <div className="text-center mb-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {achievement.name}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                    {achievement.description}
                  </p>
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <Badge className={difficultyColors[achievement.difficulty]}>
                      {achievement.difficulty}
                    </Badge>
                    <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      {achievement.reputation_required} rep
                    </Badge>
                    <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400">
                      {achievement.category}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(achievement)}
                    className="flex-1 px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors flex items-center justify-center gap-1 text-sm"
                  >
                    <Edit size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleHidden(achievement)}
                    className="px-3 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    title={achievement.is_hidden ? 'Show' : 'Hide'}
                  >
                    {achievement.is_hidden ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <button
                    onClick={() => handleDelete(achievement.id)}
                    className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => {
              setShowCreateModal(false);
              setEditingAchievement(null);
            }}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <GlassCard className="max-w-2xl w-full p-6 animate-scale-in max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">
                  {editingAchievement ? 'Edit Achievement' : 'Create Achievement'}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingAchievement(null);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Preview */}
                {imagePreview && (
                  <div className="flex justify-center mb-4">
                    <AchievementBadge
                      achievement={{
                        id: 0,
                        name: formData.name || 'Preview',
                        description: formData.description || '',
                        icon: '🏆', // Icon fallback removed, but keep for compatibility
                        image_url: imagePreview,
                        difficulty: formData.difficulty,
                        reputation_required: formData.reputation_required,
                        points: 0, // Points removed
                        isUnlocked: true,
                      }}
                      size="lg"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => {
                        const newName = e.target.value;
                        // Auto-generate slug from name
                        const autoSlug = newName.toLowerCase()
                          .replace(/[^a-z0-9]+/g, '-')
                          .replace(/^-+|-+$/g, '');
                        setFormData({ ...formData, name: newName, slug: autoSlug });
                      }}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                      placeholder="Achievement Name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Slug (Auto-generated)</label>
                    <input
                      type="text"
                      value={formData.slug}
                      readOnly
                      disabled
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      placeholder="auto-generated"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Description *</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                      placeholder="Achievement description"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Upload Image *</label>
                    <div className="flex items-center gap-2">
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                      <button
                        onClick={() => imageInputRef.current?.click()}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Upload size={16} />
                        {imagePreview ? 'Change Image' : 'Upload Image'}
                      </button>
                      {imagePreview && (
                        <button
                          onClick={() => {
                            setImagePreview(null);
                            setImageFile(null);
                            setFormData({ ...formData, image_url: '' });
                          }}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                          <X size={16} />
                          Remove
                        </button>
                      )}
                    </div>
                    {imagePreview && (
                      <div className="mt-3">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-32 h-32 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                      placeholder="general"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Difficulty</label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                      <option value="expert">Expert</option>
                      <option value="legendary">Legendary</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Reputation Required *</label>
                    <input
                      type="number"
                      value={formData.reputation_required}
                      onChange={(e) => {
                        const repValue = Number(e.target.value);
                        setFormData({ 
                          ...formData, 
                          reputation_required: repValue,
                          criteria: { type: 'reputation', value: repValue }
                        });
                      }}
                      min="0"
                      placeholder="Minimum reputation to unlock"
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                    />
                    <p className="text-xs text-gray-500 mt-1">Users need this amount of reputation to unlock this achievement</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Order</label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                    />
                  </div>

                  <div className="md:col-span-2 flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="is_hidden"
                      checked={formData.is_hidden}
                      onChange={(e) => setFormData({ ...formData, is_hidden: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <label htmlFor="is_hidden" className="cursor-pointer">
                      Hide achievement (users won't see it until unlocked)
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all duration-300 font-medium shadow-lg shadow-purple-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        {editingAchievement ? 'Update Achievement' : 'Create Achievement'}
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setEditingAchievement(null);
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

