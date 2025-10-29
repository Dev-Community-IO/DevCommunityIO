import { useState, useEffect } from 'react';
import { Search, Hash, TrendingUp } from 'lucide-react';
import onboardingService from '../services/api/onboarding.service';

interface InterestSelectionProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
  postsCount: number;
  color: string;
}

export function InterestSelection({ selectedTags, onTagsChange }: InterestSelectionProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadSuggestedTags();
  }, []);

  const loadSuggestedTags = async () => {
    try {
      const data = await onboardingService.getSuggestedTags();
      setTags(data);
    } catch (error) {
      console.error('Failed to load tags:', error);
      setTags([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onTagsChange(selectedTags.filter((id) => id !== tagId));
    } else {
      onTagsChange([...selectedTags, tagId]);
    }
  };

  const popularTags = tags.slice(0, 6);
  const trendingTags = tags.slice(6, 12);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold mb-2">Choose Your Interests</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Select at least 3 topics you're interested in to personalize your feed
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search topics..."
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Loading topics...</p>
        </div>
      ) : (
        <>
          {/* Popular Topics */}
          {!searchQuery && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={18} className="text-orange-500" />
                <h4 className="font-semibold">Popular Topics</h4>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {popularTags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                      selectedTags.includes(tag.id)
                        ? 'border-blue-500 bg-blue-500/10 shadow-lg scale-105'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tag.color} mb-2 flex items-center justify-center`}>
                      <Hash className="text-white" size={20} />
                    </div>
                    <p className="font-semibold mb-1">{tag.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {tag.postsCount} posts
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* All Topics or Search Results */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Hash size={18} className="text-blue-500" />
              <h4 className="font-semibold">
                {searchQuery ? 'Search Results' : 'More Topics'}
              </h4>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(searchQuery ? filteredTags : trendingTags).map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={`px-4 py-2 rounded-lg border transition-all duration-200 text-sm font-medium ${
                    selectedTags.includes(tag.id)
                      ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:bg-blue-500/5'
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Count */}
          <div className="flex items-center justify-between p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <p className="text-sm font-medium">
              {selectedTags.length === 0 && 'No topics selected yet'}
              {selectedTags.length === 1 && '1 topic selected'}
              {selectedTags.length === 2 && '2 topics selected - 1 more needed'}
              {selectedTags.length >= 3 && `${selectedTags.length} topics selected - Great!`}
            </p>
            {selectedTags.length >= 3 && (
              <span className="text-green-600 dark:text-green-400 text-2xl">✓</span>
            )}
          </div>
        </>
      )}
    </div>
  );
}

