import { useNavigate } from 'react-router-dom';

type PostTag = string | { id?: string; name?: string; slug?: string; logoUrl?: string; logo_url?: string };

interface PostTagsProps {
  tags: PostTag[];
  className?: string;
}

export function PostTags({ tags, className = '' }: PostTagsProps) {
  const navigate = useNavigate();

  if (!tags?.length) {
    return null;
  }

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {tags.map((tag) => {
        const tagName = typeof tag === 'string' ? tag : tag?.name || tag?.slug || '';
        const tagSlug = typeof tag === 'string' ? tag : tag?.slug || tagName;
        const tagKey = typeof tag === 'string' ? tag : tag?.id || tagSlug || tagName;
        const tagLogoUrl = typeof tag === 'string' ? null : tag?.logoUrl || tag?.logo_url;

        if (!tagName) {
          return null;
        }

        return (
          <button
            key={tagKey}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/tags/${tagSlug}`);
            }}
            className="inline-flex max-w-full items-center gap-1 rounded-md border border-zinc-200/70 bg-zinc-50/90 px-2 py-0.5 text-[11px] font-medium text-zinc-600 transition-colors hover:border-zinc-300 hover:bg-zinc-100 hover:text-zinc-900 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-400 dark:hover:border-white/20 dark:hover:bg-white/[0.08] dark:hover:text-zinc-200"
          >
            {tagLogoUrl && (
              <img
                src={tagLogoUrl}
                alt=""
                className="h-3.5 w-3.5 shrink-0 rounded object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            <span className="truncate">
              <span className="text-zinc-400 dark:text-zinc-500">#</span>
              {tagName}
            </span>
          </button>
        );
      })}
    </div>
  );
}
