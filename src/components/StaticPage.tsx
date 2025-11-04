import { ArrowLeft, Loader2 } from 'lucide-react';
import { GlassCard } from './GlassCard';
import ReactMarkdown from 'react-markdown';
import { useState, useEffect } from 'react';
import staticPagesService from '../services/api/staticPages.service';

interface StaticPageProps {
  slug: string;
  title: string;
  subtitle: string;
  gradientFrom: string;
  gradientTo: string;
  onBack: () => void;
  defaultContent: string;
  headerSection?: React.ReactNode;
  footerSection?: React.ReactNode;
}

export function StaticPage({
  slug,
  title,
  subtitle,
  gradientFrom,
  gradientTo,
  onBack,
  defaultContent,
  headerSection,
  footerSection,
}: StaticPageProps) {
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
          <h1 className={`text-3xl font-bold bg-gradient-to-r ${gradientFrom} ${gradientTo} bg-clip-text text-transparent`}>
            {title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Optional Header Section */}
      {headerSection}

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
        ) : null}
        <div className={`prose prose-slate dark:prose-invert max-w-none
          prose-headings:font-bold
          prose-h1:text-4xl prose-h1:mb-6 prose-h1:mt-8
          prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-8 prose-h2:text-blue-600 dark:prose-h2:text-blue-400
          prose-h3:text-xl prose-h3:mb-3 prose-h3:mt-6 prose-h3:text-purple-600 dark:prose-h3:text-purple-400
          prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed
          prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
          prose-strong:text-gray-900 dark:prose-strong:text-gray-100 prose-strong:font-semibold
          prose-ul:my-4 prose-li:my-1
          prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-300
          prose-code:text-pink-600 dark:prose-code:text-pink-400 prose-code:bg-pink-50 dark:prose-code:bg-pink-900/20 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
          prose-pre:bg-gray-900 prose-pre:text-gray-100
          prose-table:border prose-table:border-gray-300 dark:prose-table:border-gray-700
          prose-th:bg-gray-100 dark:prose-th:bg-gray-800 prose-th:p-2
          prose-td:p-2 prose-td:border prose-td:border-gray-300 dark:prose-td:border-gray-700
          prose-hr:border-gray-300 dark:prose-hr:border-gray-700 prose-hr:my-8
          ${loading || error ? 'hidden' : ''}`}>
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </GlassCard>

      {/* Optional Footer Section */}
      {footerSection}
    </div>
  );
}

