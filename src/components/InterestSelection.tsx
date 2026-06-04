import { useState, useEffect } from 'react';
import { Search, Hash, Loader2, Check } from 'lucide-react';
import onboardingService from '../services/api/onboarding.service';
import {
  onboardingHintClass,
  onboardingHintOkClass,
  onboardingInputClass,
  onboardingSelectableCardActiveClass,
  onboardingSelectableCardClass,
  onboardingStatusBarClass,
  onboardingStepDescClass,
  onboardingStepTitleClass,
} from './onboardingChrome';

interface InterestSelectionProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
  postsCount: number;
}

function normalizeTag(raw: Record<string, unknown>): Tag | null {
  const id = String(raw.id ?? raw.slug ?? '');
  const name = String(raw.name ?? '');
  if (!id || !name) return null;

  const count = raw.postsCount ?? raw.usageCount ?? raw.post_count ?? 0;

  return {
    id,
    name,
    slug: String(raw.slug ?? id),
    postsCount: Number(count) || 0,
  };
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
      const normalized = (Array.isArray(data) ? data : [])
        .map((item) => normalizeTag(item as Record<string, unknown>))
        .filter((tag): tag is Tag => tag !== null);
      setTags(normalized);
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

  const displayTags = searchQuery ? filteredTags : tags;
  const selectedCount = selectedTags.length;

  return (
    <div className="space-y-4">
      <div>
        <h3 className={onboardingStepTitleClass}>Your interests</h3>
        <p className={onboardingStepDescClass}>Pick at least 3 topics to personalize your feed.</p>
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
          placeholder="Search topics…"
          className={`${onboardingInputClass} pl-8`}
        />
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center gap-2 py-8">
          <Loader2 size={20} className="animate-spin text-zinc-400" strokeWidth={2} />
          <p className={onboardingHintClass}>Loading topics…</p>
        </div>
      ) : displayTags.length === 0 ? (
        <p className={`py-6 text-center ${onboardingHintClass}`}>No topics match your search.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {displayTags.map((tag) => {
              const selected = selectedTags.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={selected ? onboardingSelectableCardActiveClass : onboardingSelectableCardClass}
                >
                  <div className="mb-1.5 flex items-center justify-between gap-1">
                    <Hash size={12} className="shrink-0 text-zinc-400" strokeWidth={2} />
                    {selected && (
                      <Check size={12} className="text-zinc-700 dark:text-zinc-200" strokeWidth={2.5} />
                    )}
                  </div>
                  <p className="line-clamp-1 text-left text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    {tag.name}
                  </p>
                  {tag.postsCount > 0 && (
                    <p className="mt-0.5 text-left text-[10px] text-zinc-500 dark:text-zinc-400">
                      {tag.postsCount.toLocaleString()} posts
                    </p>
                  )}
                </button>
              );
            })}
          </div>

          <div className={onboardingStatusBarClass}>
            <span>
              {selectedCount === 0 && 'Select 3 or more topics'}
              {selectedCount === 1 && '1 selected — 2 more needed'}
              {selectedCount === 2 && '2 selected — 1 more needed'}
              {selectedCount >= 3 && `${selectedCount} selected`}
            </span>
            {selectedCount >= 3 && (
              <Check size={14} className="text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
            )}
          </div>
        </>
      )}
    </div>
  );
}
