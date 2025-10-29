import { useState, useEffect } from 'react';
import { Search, Users as UsersIcon, Check } from 'lucide-react';
import onboardingService from '../services/api/onboarding.service';
import { Avatar } from './Avatar';

interface PageSuggestionsProps {
  selectedPages: string[];
  onPagesChange: (pages: string[]) => void;
}

interface SuggestedPage {
  id: string;
  name: string;
  logo: string;
  description: string;
  category: string;
  members: number;
  postsCount: number;
}

export function PageSuggestions({ selectedPages, onPagesChange }: PageSuggestionsProps) {
  const [pages, setPages] = useState<SuggestedPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadSuggestedPages();
  }, []);

  const loadSuggestedPages = async () => {
    try {
      const data = await onboardingService.getSuggestedPages();
      setPages(data);
    } catch (error) {
      console.error('Failed to load pages:', error);
      setPages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPages = pages.filter((page) =>
    page.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const togglePage = (pageId: string) => {
    if (selectedPages.includes(pageId)) {
      onPagesChange(selectedPages.filter((id) => id !== pageId));
    } else {
      onPagesChange([...selectedPages, pageId]);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold mb-2">Join Communities</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Discover and join communities that match your interests
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search communities..."
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Finding communities...</p>
        </div>
      ) : (
        <>
          {/* Page Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPages.map((page) => {
              const isSelected = selectedPages.includes(page.id);
              return (
                <div
                  key={page.id}
                  className={`p-5 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500/5 shadow-lg'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
                  }`}
                  onClick={() => togglePage(page.id)}
                >
                  <div className="flex items-start gap-4 mb-3">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      <img
                        src={page.logo}
                        alt={page.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-lg mb-1 truncate">{page.name}</h4>
                      <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                        {page.category}
                      </span>
                    </div>
                    {isSelected && (
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                        <Check className="text-white" size={16} />
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {page.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <UsersIcon size={14} />
                      <span>{page.members.toLocaleString()} members</span>
                    </div>
                    <span>•</span>
                    <span>{page.postsCount.toLocaleString()} posts</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePage(page.id);
                    }}
                    className={`w-full mt-4 px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                      isSelected
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    {isSelected ? 'Joined' : 'Join Community'}
                  </button>
                </div>
              );
            })}
          </div>

          {filteredPages.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No communities found matching "{searchQuery}"</p>
            </div>
          )}

          {/* Selected Count */}
          <div className="flex items-center justify-between p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <div className="flex items-center gap-2">
              <UsersIcon size={20} className="text-blue-600 dark:text-blue-400" />
              <p className="text-sm font-medium">
                {selectedPages.length === 0 && 'No communities joined yet'}
                {selectedPages.length === 1 && '1 community joined'}
                {selectedPages.length > 1 && `${selectedPages.length} communities joined`}
              </p>
            </div>
            {selectedPages.length >= 1 && (
              <span className="text-green-600 dark:text-green-400 text-2xl">✓</span>
            )}
          </div>
        </>
      )}
    </div>
  );
}

