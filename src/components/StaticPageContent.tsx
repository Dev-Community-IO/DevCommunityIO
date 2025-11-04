import { ArrowLeft, Loader2 } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { MarkdownRenderer } from '../utils/markdownRenderer';
import { useState, useEffect } from 'react';
import staticPagesService from '../services/api/staticPages.service';

interface StaticPageContentProps {
  slug: string;
  title: string;
  onBack: () => void;
  defaultContent: string;
}

export function StaticPageContent({ slug, title, onBack, defaultContent }: StaticPageContentProps) {
  const [content, setContent] = useState<string>(defaultContent);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const pageData = await staticPagesService.getPage(slug);
        setContent(pageData.content || defaultContent);
        setError(null);
      } catch (err: any) {
        console.error(`Failed to load ${slug} page content:`, err);
        setError(err.message || 'Failed to load content');
        setContent(defaultContent);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [slug, defaultContent]);

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-200 group"
        >
          <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {title}
          </h1>
        </div>
      </div>

      {/* Content */}
      <GlassCard className="p-6 md:p-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={32} className="animate-spin text-blue-500" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-2">{error}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Using default content</p>
          </div>
        ) : (
          <MarkdownRenderer content={content} />
        )}
      </GlassCard>
    </div>
  );
}

