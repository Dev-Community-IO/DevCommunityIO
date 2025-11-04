import { useState, useEffect } from 'react';
import { FileText, Save, Loader2, Edit2, X } from 'lucide-react';
import { GlassCard } from '../GlassCard';
import adminService from '../../services/api/admin.service';
import staticPagesService from '../../services/api/staticPages.service';
import { useToast } from '../Toast';
import { MarkdownEditor } from '../MarkdownEditor';
import { MarkdownRenderer } from '../../utils/markdownRenderer';

interface StaticPage {
  slug: string;
  title: string;
  content: string;
}

const staticPages: StaticPage[] = [
  { slug: 'about', title: 'About' },
  { slug: 'contact', title: 'Contact' },
  { slug: 'privacy-policy', title: 'Privacy Policy' },
  { slug: 'terms-of-use', title: 'Terms of Use' },
  { slug: 'code-of-conduct', title: 'Code of Conduct' },
];

export function AdminStaticPages() {
  const toast = useToast();
  const [pages, setPages] = useState<StaticPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<'split' | 'editor' | 'preview'>('split');

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      setLoading(true);
      const pageData = await Promise.all(
        staticPages.map(async (page) => {
          try {
            const data = await staticPagesService.getPage(page.slug);
            return { ...page, content: data.content || '' };
          } catch (err) {
            return { ...page, content: '' };
          }
        })
      );
      setPages(pageData);
    } catch (error: any) {
      toast.error('Failed to load static pages');
      console.error('Error loading pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (slug: string) => {
    const page = pages.find(p => p.slug === slug);
    if (page) {
      setEditingSlug(slug);
      setEditContent(page.content);
      setViewMode('split');
    }
  };

  const handleCancel = () => {
    setEditingSlug(null);
    setEditContent('');
    setViewMode('split');
  };

  const handleSave = async () => {
    if (!editingSlug) return;

    try {
      setSaving(true);
      await adminService.updateStaticPage(editingSlug, editContent);
      toast.success('Page updated successfully');
      setEditingSlug(null);
      setEditContent('');
      setViewMode('split');
      await loadPages();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update page');
      console.error('Error updating page:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={32} className="animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText size={24} />
            Static Pages Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Edit markdown content for static pages (About, Contact, Privacy Policy, Terms of Use, Code of Conduct)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {pages.map((page) => (
          <GlassCard key={page.slug} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">{page.title}</h3>
              {editingSlug !== page.slug ? (
                <button
                  onClick={() => handleEdit(page.slug)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                >
                  <Edit2 size={16} />
                  Edit
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('editor')}
                      className={`px-3 py-1.5 text-sm rounded transition-all ${
                        viewMode === 'editor'
                          ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                      }`}
                    >
                      Editor
                    </button>
                    <button
                      onClick={() => setViewMode('split')}
                      className={`px-3 py-1.5 text-sm rounded transition-all ${
                        viewMode === 'split'
                          ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                      }`}
                    >
                      Split
                    </button>
                    <button
                      onClick={() => setViewMode('preview')}
                      className={`px-3 py-1.5 text-sm rounded transition-all ${
                        viewMode === 'preview'
                          ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                      }`}
                    >
                      Preview
                    </button>
                  </div>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all"
                  >
                    <X size={16} />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Save
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {editingSlug === page.slug ? (
              <div className="space-y-4">
                <div className={`grid gap-4 ${
                  viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
                }`}>
                  {(viewMode === 'split' || viewMode === 'editor') && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Markdown Editor</label>
                      <div className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
                        <MarkdownEditor
                          value={editContent}
                          onChange={setEditContent}
                          placeholder="Enter markdown content..."
                          minHeight="600px"
                        />
                      </div>
                    </div>
                  )}
                  
                  {(viewMode === 'split' || viewMode === 'preview') && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Preview</label>
                      <div className="h-[600px] overflow-y-auto px-6 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg">
                        {editContent ? (
                          <MarkdownRenderer content={editContent} />
                        ) : (
                          <p className="text-gray-400 dark:text-gray-500 italic">No content yet. Start typing to see preview...</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-gray-600 dark:text-gray-400">
                {page.content ? (
                  <div className="line-clamp-3">{page.content.substring(0, 200)}...</div>
                ) : (
                  <span className="text-gray-400 dark:text-gray-500 italic">No content yet</span>
                )}
              </div>
            )}
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

