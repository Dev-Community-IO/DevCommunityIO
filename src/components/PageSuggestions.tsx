import { useState, useEffect } from 'react';
import { Search, Users, Check, Loader2 } from 'lucide-react';
import onboardingService from '../services/api/onboarding.service';
import { Avatar } from './Avatar';
import {
  onboardingGhostBtnClass,
  onboardingHintClass,
  onboardingInputClass,
  onboardingPrimaryBtnClass,
  onboardingSelectableCardActiveClass,
  onboardingSelectableCardClass,
  onboardingStatusBarClass,
  onboardingStepDescClass,
  onboardingStepTitleClass,
} from './onboardingChrome';
import { postTagClass } from './postCardSurface';

const DEFAULT_PAGE_LOGO = 'https://api.dicebear.com/7.x/shapes/svg?seed=Adaex%20App';

interface PageSuggestionsProps {
  selectedPages: string[];
  onPagesChange: (pages: string[]) => void;
}

interface SuggestedPage {
  id: string;
  name: string;
  logo?: string | null;
  logoUrl?: string | null;
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

  const filteredPages = pages.filter(
    (page) =>
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
    <div className="space-y-4">
      <div>
        <h3 className={onboardingStepTitleClass}>Join communities</h3>
        <p className={onboardingStepDescClass}>Follow at least one page to see posts in your feed.</p>
      </div>

      <div className="relative">
        <Search
          size={14}
          className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400"
          strokeWidth={2}
        />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search communities…"
          className={`${onboardingInputClass} pl-8`}
        />
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center gap-2 py-8">
          <Loader2 size={20} className="animate-spin text-zinc-400" strokeWidth={2} />
          <p className={onboardingHintClass}>Finding communities…</p>
        </div>
      ) : filteredPages.length === 0 ? (
        <p className={`py-6 text-center ${onboardingHintClass}`}>
          {searchQuery ? `No results for “${searchQuery}”` : 'No communities available yet.'}
        </p>
      ) : (
        <>
          <ul className="space-y-2">
            {filteredPages.map((page) => {
              const isSelected = selectedPages.includes(page.id);
              return (
                <li key={page.id}>
                  <div
                    className={
                      isSelected ? onboardingSelectableCardActiveClass : onboardingSelectableCardClass
                    }
                  >
                    <div className="flex gap-3">
                      <Avatar
                        src={page.logo || page.logoUrl || DEFAULT_PAGE_LOGO}
                        alt={page.name}
                        size="md"
                        className="h-10 w-10 shrink-0 rounded-lg border border-zinc-200/80 dark:border-white/10"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h4 className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                              {page.name}
                            </h4>
                            {page.category && (
                              <span className={`${postTagClass} mt-1 capitalize`}>{page.category}</span>
                            )}
                          </div>
                          {isSelected && (
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white dark:bg-emerald-500">
                              <Check size={11} strokeWidth={3} />
                            </span>
                          )}
                        </div>
                        <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                          {page.description}
                        </p>
                        <div className="mt-1.5 flex items-center gap-2 text-[10px] text-zinc-500 dark:text-zinc-400">
                          <span className="inline-flex items-center gap-0.5">
                            <Users size={10} strokeWidth={2} />
                            {(page.members ?? 0).toLocaleString()}
                          </span>
                          <span aria-hidden>·</span>
                          <span>{(page.postsCount ?? 0).toLocaleString()} posts</span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => togglePage(page.id)}
                      className={`mt-2.5 w-full ${
                        isSelected ? onboardingGhostBtnClass : onboardingPrimaryBtnClass
                      }`}
                    >
                      {isSelected ? 'Joined' : 'Join'}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className={onboardingStatusBarClass}>
            <span className="inline-flex items-center gap-1.5">
              <Users size={12} strokeWidth={2} />
              {selectedPages.length === 0
                ? 'Join at least one community'
                : `${selectedPages.length} joined`}
            </span>
            {selectedPages.length >= 1 && (
              <Check size={14} className="text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
            )}
          </div>
        </>
      )}
    </div>
  );
}
