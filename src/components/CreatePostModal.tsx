import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Button } from './Button';
import { Badge } from './Badge';
import { MarkdownEditor } from './MarkdownEditor';
import { useState, useRef } from 'react';

interface CreatePostModalProps {
  onClose: () => void;
}

const TITLE_MAX_LENGTH = 200;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_TAGS = 5;

const availableTags = [
  'staking', 'defi', 'ethereum', 'security', 'solidity', 'best-practices',
  'nft', 'royalties', 'marketplaces', 'dao', 'treasury', 'governance',
  'hack', 'bridge', 'optimization', 'gas', 'web3', 'smart-contracts',
  'blockchain', 'layer2', 'zk-rollups', 'consensus', 'evm', 'protocol'
];

export function CreatePostModal({ onClose }: CreatePostModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredTags = tagInput.trim()
    ? availableTags.filter(tag =>
        tag.toLowerCase().includes(tagInput.toLowerCase()) &&
        !tags.includes(tag)
      )
    : [];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE) {
      setImageError('Image size must be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setImageError('Please upload a valid image file');
      return;
    }

    setImageError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCoverImage = () => {
    setCoverImage(null);
    setImageError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddTag = (tag: string) => {
    if (tags.length >= MAX_TAGS) {
      return;
    }
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setTagInput('');
    setShowTagSuggestions(false);
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (tags.length >= MAX_TAGS) return;

      const matchedTag = availableTags.find(tag =>
        tag.toLowerCase() === tagInput.toLowerCase().trim()
      );

      if (matchedTag) {
        handleAddTag(matchedTag);
      } else if (filteredTags.length > 0) {
        handleAddTag(filteredTags[0]);
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <GlassCard className="w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <div id="editor-container" className="overflow-y-auto flex-1">
          <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Create New Post</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 dark:hover:bg-white/5 transition-all duration-300"
            >
              <X size={24} />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Title
              <span className="text-xs text-gray-500 ml-2">
                ({title.length}/{TITLE_MAX_LENGTH})
              </span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                if (e.target.value.length <= TITLE_MAX_LENGTH) {
                  setTitle(e.target.value);
                }
              }}
              placeholder="Enter a descriptive title..."
              className="w-full px-4 py-3 rounded-xl backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Cover Image
              <span className="text-xs text-gray-500 ml-2">(Optional, max 5MB)</span>
            </label>
            {!coverImage ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-48 rounded-xl backdrop-blur-xl bg-white/10 dark:bg-black/20 border-2 border-dashed border-white/20 dark:border-white/10 hover:border-blue-500 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-3"
              >
                <Upload size={32} className="text-gray-400" />
                <div className="text-center">
                  <p className="text-sm font-medium">Click to upload cover image</p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="relative w-full h-48 rounded-xl overflow-hidden">
                <img
                  src={coverImage}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={handleRemoveCoverImage}
                  className="absolute top-2 right-2 p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-all duration-300"
                >
                  <X size={16} />
                </button>
              </div>
            )}
            {imageError && (
              <p className="text-red-500 text-xs mt-2">{imageError}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Content</label>
            <MarkdownEditor
              value={content}
              onChange={setContent}
              placeholder="Write your post content... (Markdown supported)"
              minHeight="400px"
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium mb-2">
              Tags
              <span className="text-xs text-gray-500 ml-2">
                ({tags.length}/{MAX_TAGS})
              </span>
            </label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => {
                setTagInput(e.target.value);
                setShowTagSuggestions(true);
              }}
              onKeyDown={handleTagInputKeyDown}
              onFocus={() => setShowTagSuggestions(true)}
              onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
              placeholder={tags.length >= MAX_TAGS ? "Maximum tags reached" : "Type to search tags..."}
              disabled={tags.length >= MAX_TAGS}
              className="w-full px-4 py-3 rounded-xl backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {showTagSuggestions && filteredTags.length > 0 && tags.length < MAX_TAGS && (
              <div className="absolute z-10 w-full mt-1 rounded-xl backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 shadow-lg max-h-48 overflow-y-auto">
                {filteredTags.slice(0, 10).map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleAddTag(tag)}
                    className="w-full px-4 py-2 text-left hover:bg-white/10 dark:hover:bg-white/5 transition-all duration-300 text-sm"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {tags.map(tag => (
                  <Badge key={tag} className="cursor-pointer hover:bg-white/30 dark:hover:bg-black/40 flex items-center gap-1">
                    #{tag}
                    <button onClick={() => handleRemoveTag(tag)} className="ml-1">
                      <X size={14} />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="ghost" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button variant="primary" className="flex-1">
              Publish Post
            </Button>
          </div>
        </div>
        </div>
      </GlassCard>
    </div>
  );
}
