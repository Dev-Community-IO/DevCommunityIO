import { Bold, Italic, List, ListOrdered, Link as LinkIcon, Code, Image as ImageIcon, Heading1, Heading2, Quote, Table, Minus, Eye, HelpCircle, ChevronUp, Hash, AtSign, ExternalLink, GripVertical } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { MarkdownRenderer } from '../utils/markdownRenderer';
import usersService from '../services/api/users.service';
import postsService from '../services/api/posts.service';
import { Avatar } from './Avatar';
import { useToast } from './Toast';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

const MAX_MENTIONS = 2;

const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 5MB limit

export function MarkdownEditor({ value, onChange, placeholder = 'Write your content...', minHeight = '300px' }: MarkdownEditorProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const resizeHandleRef = useRef<HTMLDivElement>(null);
  const [isToolbarSticky, setIsToolbarSticky] = useState(false);
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const [mentionUsers, setMentionUsers] = useState<Array<{ id: string; username: string; avatar?: string; avatarUrl?: string; pseudo?: string }>>([]);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [editorHeight, setEditorHeight] = useState<string>(minHeight);
  const [isResizing, setIsResizing] = useState(false);
  const toast = useToast();

  // Count existing mentions in content
  const countMentions = (text: string): number => {
    const mentionMatches = text.match(/@\w+/g);
    return mentionMatches ? mentionMatches.length : 0;
  };

  // Get cursor position in textarea
  const getCaretCoordinates = (element: HTMLTextAreaElement, position: number) => {
    // Create a mirror div to calculate cursor position
    const div = document.createElement('div');
    const style = getComputedStyle(element);
    
    // Copy relevant styles
    const styleProps = [
      'direction', 'boxSizing', 'width', 'height', 'overflowX', 'overflowY',
      'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
      'borderStyle', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
      'fontStyle', 'fontVariant', 'fontWeight', 'fontStretch', 'fontSize',
      'fontSizeAdjust', 'lineHeight', 'fontFamily', 'textAlign', 'textTransform',
      'textIndent', 'textDecoration', 'letterSpacing', 'wordSpacing',
      'tabSize', 'MozTabSize', 'whiteSpace', 'wordWrap'
    ];

    styleProps.forEach(prop => {
      const value = style.getPropertyValue(prop);
      if (value) {
        div.style.setProperty(prop, value);
      }
    });

    div.style.position = 'absolute';
    div.style.visibility = 'hidden';
    div.style.whiteSpace = 'pre-wrap';
    div.style.wordWrap = 'break-word';
    div.style.top = '0';
    div.style.left = '0';
    
    // Set width to match textarea
    div.style.width = `${element.offsetWidth}px`;
    
    // Handle text content - preserve newlines
    const textBefore = element.value.substring(0, position);
    const textAfter = element.value.substring(position);
    
    // Create text node for before text
    const textNode = document.createTextNode(textBefore);
    div.appendChild(textNode);
    
    // Create span for after text to mark position
    const span = document.createElement('span');
    span.textContent = textAfter || '.';
    div.appendChild(span);
    
    document.body.appendChild(div);

    const coordinates = {
      top: span.offsetTop,
      left: span.offsetLeft,
    };

    document.body.removeChild(div);
    return coordinates;
  };

  // Initialize editor height from minHeight prop
  useEffect(() => {
    setEditorHeight(minHeight);
  }, [minHeight]);

  useEffect(() => {
    const handleScroll = () => {
      if (toolbarRef.current) {
        const rect = toolbarRef.current.getBoundingClientRect();
        setIsToolbarSticky(rect.top <= 0);
      }
    };

    const editorContainer = editorContainerRef.current;
    if (editorContainer) {
      editorContainer.addEventListener('scroll', handleScroll);
      return () => editorContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Handle resize
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !editorContainerRef.current) return;
      
      const containerRect = editorContainerRef.current.getBoundingClientRect();
      const newHeight = e.clientY - containerRect.top;
      const minHeightPx = parseInt(minHeight) || 200;
      
      if (newHeight >= minHeightPx) {
        setEditorHeight(`${newHeight}px`);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'row-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, minHeight]);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  // Handle mention detection and search
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea || showPreview) return;

    let searchTimeout: NodeJS.Timeout | null = null;

    const checkForMentions = () => {
      // Use both textarea.value and React value for reliability
      // textarea.value is more up-to-date, but React value ensures consistency
      const currentValue = textarea.value || value;
      const cursorPos = textarea.selectionStart || 0;
      const textBeforeCursor = currentValue.substring(0, cursorPos);
      
      // Check if we're already at max mentions
      const currentMentionCount = countMentions(currentValue);
      if (currentMentionCount >= MAX_MENTIONS) {
        setShowMentionDropdown(false);
        setMentionUsers([]);
        if (searchTimeout) {
          clearTimeout(searchTimeout);
          searchTimeout = null;
        }
        return;
      }

      // Find @ mention in text before cursor
      // Match @ followed by word characters, where @ is at start or preceded by whitespace/newline
      const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
      
      if (mentionMatch) {
        const query = mentionMatch[1];
        
        // Get cursor position for dropdown - position relative to editor container
        try {
          const coordinates = getCaretCoordinates(textarea, cursorPos);
          
          // Position relative to textarea within editor container
          // coordinates.top and coordinates.left are relative to textarea content (accounting for padding)
          const textareaPadding = 16; // p-4 = 16px
          const dropdownWidth = 300;
          const dropdownHeight = 200;
          
          // Position relative to textarea's content area (already accounts for padding)
          let finalLeft = coordinates.left;
          let finalTop = coordinates.top + 25; // 25px below cursor
          
          // Get textarea dimensions for boundary checking
          const textareaWidth = textarea.offsetWidth;
          const textareaHeight = textarea.clientHeight;
          const textareaScrollTop = textarea.scrollTop || 0;
          
          // Adjust if dropdown would go off right edge of textarea
          if (finalLeft + dropdownWidth > textareaWidth - textareaPadding) {
            finalLeft = textareaWidth - dropdownWidth - textareaPadding;
          }
          
          // Adjust if dropdown would go off left edge
          if (finalLeft < textareaPadding) {
            finalLeft = textareaPadding;
          }
          
          // Adjust if dropdown would go off bottom edge (show above cursor instead)
          // Account for textarea scroll position - coordinates.top is relative to textarea content
          const relativeTop = coordinates.top - textareaScrollTop;
          
          if (relativeTop + dropdownHeight + 25 > textareaHeight - textareaPadding) {
            // Show above cursor
            finalTop = coordinates.top - dropdownHeight - 5;
            // Ensure it doesn't go above visible area
            if (finalTop < textareaPadding) {
              finalTop = textareaPadding;
            }
          }
          
          // Ensure dropdown doesn't go off top edge
          if (finalTop < textareaPadding) {
            finalTop = coordinates.top + 25;
            // If still too high, position at a safe location
            if (finalTop < textareaPadding) {
              finalTop = textareaPadding + 20;
            }
          }
          
          setMentionPosition({
            top: finalTop,
            left: finalLeft,
          });
        } catch (err) {
          console.error('Failed to get caret coordinates:', err);
          // If coordinate calculation fails, use approximate position
          setMentionPosition({
            top: 50,
            left: 20,
          });
        }

        // Show dropdown immediately when @ is detected, even if query is empty
        setShowMentionDropdown(true);
        setSelectedMentionIndex(0);
        
        // Search for users if query length >= 1
        if (query.length >= 1) {
          // Clear previous timeout
          if (searchTimeout) {
            clearTimeout(searchTimeout);
          }
          
          // Debounce search
          searchTimeout = setTimeout(async () => {
            try {
              const users = await usersService.searchForMentions(query);
              setMentionUsers(users.slice(0, 5)); // Limit to 5 results
            } catch (error) {
              console.error('Failed to search users:', error);
              setMentionUsers([]);
            }
            searchTimeout = null;
          }, 300);
        } else {
          // When @ is typed but no query yet, show empty state or fetch initial users
          setMentionUsers([]);
        }
      } else {
        setShowMentionDropdown(false);
        setMentionUsers([]);
        if (searchTimeout) {
          clearTimeout(searchTimeout);
          searchTimeout = null;
        }
      }
    };
    
    // Use a small delay to check for mentions after React updates
    // This ensures React's onChange has already processed the update
    const timeoutId = setTimeout(() => {
      checkForMentions();
    }, 0);
    
    return () => {
      clearTimeout(timeoutId);
      if (searchTimeout) {
        clearTimeout(searchTimeout);
        searchTimeout = null;
      }
    };
  }, [value, showPreview]);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        // Only close if not clicking on textarea
        if (textareaRef.current && !textareaRef.current.contains(event.target as Node)) {
          setShowMentionDropdown(false);
        }
      }
    };

    if (showMentionDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMentionDropdown]);

  // Insert mention at cursor position
  const insertMention = (username: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPos);
    const textAfterCursor = value.substring(cursorPos);
    
    // Replace @query with @username
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
    if (mentionMatch) {
      const startPos = cursorPos - mentionMatch[0].length;
      const newText = value.substring(0, startPos) + `@${username} ` + textAfterCursor;
      onChange(newText);
      
      // Move cursor after mention
      setTimeout(() => {
        textarea.focus();
        const newCursorPos = startPos + username.length + 2; // +2 for @ and space
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    }

    setShowMentionDropdown(false);
    setMentionUsers([]);
  };

  const insertMarkdown = (before: string, after: string = '', placeholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const textToInsert = selectedText || placeholder;

    const newText = value.substring(0, start) + before + textToInsert + after + value.substring(end);
    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + textToInsert.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error('Image size must be less than 2MB. Please compress your image before uploading.');
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file');
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
      return;
    }

    setIsUploadingImage(true);

    try {
      const result = await postsService.uploadPostImage(file);
      const imageUrl = result.url || result.sizes?.full || result.sizes?.large || '';
      
      if (imageUrl) {
        // Insert markdown image syntax at cursor position
        const textarea = textareaRef.current;
        if (textarea) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const imageMarkdown = `![${file.name.replace(/\.[^/.]+$/, '')}](${imageUrl})`;
          const newText = value.substring(0, start) + imageMarkdown + value.substring(end);
          onChange(newText);

          setTimeout(() => {
            textarea.focus();
            const newCursorPos = start + imageMarkdown.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
          }, 0);
          
          toast.success('Image uploaded successfully!');
        }
      }
    } catch (error: any) {
      console.error('Failed to upload image:', error);
      toast.error(error.response?.data?.message || 'Failed to upload image. Please try again.');
    } finally {
      setIsUploadingImage(false);
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
    }
  };

  const triggerImageUpload = () => {
    imageInputRef.current?.click();
  };

  const insertAtLineStart = (prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const lines = value.split('\n');
    let currentPos = 0;
    let startLine = 0;
    let endLine = 0;

    for (let i = 0; i < lines.length; i++) {
      const lineLength = lines[i].length + 1;
      if (currentPos <= start && start < currentPos + lineLength) {
        startLine = i;
      }
      if (currentPos <= end && end < currentPos + lineLength) {
        endLine = i;
        break;
      }
      currentPos += lineLength;
    }

    for (let i = startLine; i <= endLine; i++) {
      if (!lines[i].startsWith(prefix)) {
        lines[i] = prefix + lines[i];
      } else {
        lines[i] = lines[i].substring(prefix.length);
      }
    }

    onChange(lines.join('\n'));
    setTimeout(() => textarea.focus(), 0);
  };

  const toolbarButtons = [
    { icon: Bold, action: () => insertMarkdown('**', '**', 'bold text'), title: 'Bold (Ctrl+B)' },
    { icon: Italic, action: () => insertMarkdown('*', '*', 'italic text'), title: 'Italic (Ctrl+I)' },
    { icon: Heading1, action: () => insertAtLineStart('# '), title: 'Heading 1' },
    { icon: Heading2, action: () => insertAtLineStart('## '), title: 'Heading 2' },
    { icon: List, action: () => insertAtLineStart('- '), title: 'Bullet List' },
    { icon: ListOrdered, action: () => insertAtLineStart('1. '), title: 'Numbered List' },
    { icon: Quote, action: () => insertAtLineStart('> '), title: 'Quote' },
    { icon: Code, action: () => insertMarkdown('`', '`', 'code'), title: 'Inline Code' },
    { icon: Code, action: () => insertMarkdown('\n```\n', '\n```\n', 'code block'), title: 'Code Block', label: '{}' },
    { icon: LinkIcon, action: () => insertMarkdown('[', '](url)', 'link text'), title: 'Link' },
    { icon: ImageIcon, action: triggerImageUpload, title: 'Upload Image', isUpload: true },
    { icon: Table, action: () => insertMarkdown('\n| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |\n', ''), title: 'Table' },
    { icon: Minus, action: () => insertMarkdown('\n---\n', ''), title: 'Horizontal Rule' },
  ];

  return (
    <div className="space-y-2">
      <div
        ref={toolbarRef}
        className={`flex items-center justify-between gap-2 p-2 rounded-t-xl backdrop-blur-xl bg-gray-50 dark:bg-gray-900 border border-white/20 dark:border-white/10 transition-all duration-300 ${
          isToolbarSticky ? 'sticky top-0 z-10 shadow-lg' : ''
        }`}
      >
        <div className="flex items-center gap-1 flex-wrap">
          {toolbarButtons.map((button, index) => {
            const Icon = button.icon;
            return (
              <button
                key={index}
                onClick={button.action}
                title={button.title}
                disabled={isUploadingImage && (button as any).isUpload}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-all duration-300 group relative disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
              >
                {button.label ? (
                  <span className="text-sm font-bold">{button.label}</span>
                ) : (
                  <Icon size={18} className={isUploadingImage && (button as any).isUpload ? 'animate-pulse' : ''} />
                )}
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                  {button.title}
                </span>
              </button>
            );
          })}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-all duration-300"
          type="button"
        >
          <Eye size={18} />
          <span className="text-sm font-medium">{showPreview ? 'Edit' : 'Preview'}</span>
        </button>
        <button
          onClick={() => setShowTips(!showTips)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-all duration-300"
          type="button"
          title="Editor Tips & Help"
        >
          <HelpCircle size={18} />
          <span className="text-sm font-medium hidden sm:inline">Tips</span>
        </button>
      </div>

      {/* Tips Panel */}
      {showTips && (
        <div className="backdrop-blur-xl bg-blue-50/90 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HelpCircle size={20} className="text-blue-600 dark:text-blue-400" />
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Editor Tips & Guide</h3>
            </div>
            <button
              onClick={() => setShowTips(false)}
              className="p-1 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              <ChevronUp size={18} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {/* Mentions */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                <AtSign size={16} className="text-blue-600 dark:text-blue-400" />
                <span>Mentions</span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-xs leading-relaxed">
                Type <code className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 rounded text-xs">@username</code> to mention users. A dropdown will appear as you type. Use arrow keys to navigate and Enter/Tab to select. Max {MAX_MENTIONS} mentions per post.
              </p>
            </div>

            {/* Badges */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                <Hash size={16} className="text-purple-600 dark:text-purple-400" />
                <span>Badges</span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-xs leading-relaxed">
                Add shields.io badges: <code className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 rounded text-xs">[![GitHub](badge-url)](link-url)</code>. Perfect for GitHub, npm, and other project badges.
              </p>
              <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded border border-purple-200 dark:border-purple-800">
                <code className="text-xs text-gray-600 dark:text-gray-400 break-all">
                  [![GitHub](https://img.shields.io/...)](https://github.com/...)
                </code>
              </div>
            </div>

            {/* URL Embeds */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                <ExternalLink size={16} className="text-green-600 dark:text-green-400" />
                <span>URL Embeds</span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-xs leading-relaxed">
                Paste a URL on its own line to automatically create an embed preview card with title, description, and preview image.
              </p>
              <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded border border-green-200 dark:border-green-800">
                <code className="text-xs text-gray-600 dark:text-gray-400 break-all">
                  https://example.com/article
                </code>
              </div>
            </div>

            {/* Markdown Basics */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                <Bold size={16} className="text-orange-600 dark:text-orange-400" />
                <span>Markdown Basics</span>
              </div>
              <div className="space-y-1.5 text-xs text-gray-700 dark:text-gray-300">
                <div><code className="px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/30 rounded">**bold**</code> or <code className="px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/30 rounded">Ctrl+B</code></div>
                <div><code className="px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/30 rounded">*italic*</code> or <code className="px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/30 rounded">Ctrl+I</code></div>
                <div><code className="px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/30 rounded">`code`</code> for inline code</div>
                <div><code className="px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/30 rounded"># Heading</code> for headers</div>
                <div><code className="px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/30 rounded">- List</code> for bullet lists</div>
                <div><code className="px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/30 rounded">[text](url)</code> for links</div>
              </div>
            </div>

            {/* Toolbar */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                <Code size={16} className="text-indigo-600 dark:text-indigo-400" />
                <span>Toolbar</span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-xs leading-relaxed">
                Use the toolbar buttons above to quickly insert markdown formatting. Hover over each button to see its keyboard shortcut.
              </p>
            </div>

            {/* Keyboard Shortcuts */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                <Minus size={16} className="text-cyan-600 dark:text-cyan-400" />
                <span>Keyboard Shortcuts</span>
              </div>
              <div className="space-y-1.5 text-xs text-gray-700 dark:text-gray-300">
                <div><kbd className="px-2 py-1 bg-cyan-100 dark:bg-cyan-900/30 rounded border border-cyan-300 dark:border-cyan-700">Ctrl+B</kbd> Bold</div>
                <div><kbd className="px-2 py-1 bg-cyan-100 dark:bg-cyan-900/30 rounded border border-cyan-300 dark:border-cyan-700">Ctrl+I</kbd> Italic</div>
                <div><kbd className="px-2 py-1 bg-cyan-100 dark:bg-cyan-900/30 rounded border border-cyan-300 dark:border-cyan-700">↑↓</kbd> Navigate mentions</div>
                <div><kbd className="px-2 py-1 bg-cyan-100 dark:bg-cyan-900/30 rounded border border-cyan-300 dark:border-cyan-700">Enter/Tab</kbd> Select mention</div>
                <div><kbd className="px-2 py-1 bg-cyan-100 dark:bg-cyan-900/30 rounded border border-cyan-300 dark:border-cyan-700">Esc</kbd> Close dropdown</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        ref={editorContainerRef}
        className="relative rounded-b-xl backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/50 transition-all duration-300 overflow-hidden"
        style={{ height: editorHeight }}
      >
        {showPreview ? (
          <div
            className="p-4 overflow-y-auto h-full"
          >
            {value ? (
              <MarkdownRenderer content={value} />
            ) : (
              <p className="text-gray-500 dark:text-gray-400">Nothing to preview...</p>
            )}
          </div>
        ) : (
          <>
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full h-full p-4 bg-transparent border-0 focus:outline-none resize-none overflow-y-auto"
              style={{ height: `calc(${editorHeight} - 8px)` }}
              onKeyDown={(e) => {
                // Handle mention dropdown navigation
                if (showMentionDropdown && mentionUsers.length > 0) {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setSelectedMentionIndex((prev) => (prev + 1) % mentionUsers.length);
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setSelectedMentionIndex((prev) => (prev - 1 + mentionUsers.length) % mentionUsers.length);
                  } else if (e.key === 'Enter' || e.key === 'Tab') {
                    e.preventDefault();
                    if (mentionUsers[selectedMentionIndex]) {
                      insertMention(mentionUsers[selectedMentionIndex].username);
                    }
                  } else if (e.key === 'Escape') {
                    e.preventDefault();
                    setShowMentionDropdown(false);
                  }
                  return;
                }

                // Handle markdown shortcuts
                if (e.ctrlKey || e.metaKey) {
                  if (e.key === 'b') {
                    e.preventDefault();
                    insertMarkdown('**', '**', 'bold text');
                  } else if (e.key === 'i') {
                    e.preventDefault();
                    insertMarkdown('*', '*', 'italic text');
                  }
                }
              }}
            />
            
            {/* Mention Dropdown - positioned relative to editor container */}
            {showMentionDropdown && (
              <div
                ref={dropdownRef}
                className="absolute z-[9999] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-64 overflow-y-auto"
                style={{
                  top: `${mentionPosition.top}px`,
                  left: `${mentionPosition.left}px`,
                  minWidth: '280px',
                  maxWidth: '320px',
                }}
              >
                <div className="py-1">
                  {mentionUsers.length > 0 ? (
                    mentionUsers.map((user, index) => (
                      <button
                        key={user.id}
                        onClick={() => insertMention(user.username)}
                        className={`w-full px-3 py-2 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left ${
                          index === selectedMentionIndex ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                        onMouseEnter={() => setSelectedMentionIndex(index)}
                      >
                        <Avatar
                          src={user.avatar || user.avatarUrl || ''}
                          alt={user.username}
                          size="sm"
                          className="flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {user.pseudo || user.username}
                          </div>
                          {user.pseudo && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              @{user.username}
                            </div>
                          )}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                      Type to search users...
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
        
        {/* Resize Handle */}
        <div
          ref={resizeHandleRef}
          onMouseDown={handleResizeStart}
          className={`absolute bottom-0 left-0 right-0 h-2 cursor-row-resize hover:bg-blue-500/20 dark:hover:bg-blue-400/20 transition-colors flex items-center justify-center group ${
            isResizing ? 'bg-blue-500/30 dark:bg-blue-400/30' : ''
          }`}
          title="Drag to resize editor height"
        >
          <GripVertical 
            size={12} 
            className={`text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors ${
              isResizing ? 'text-blue-500 dark:text-blue-400' : ''
            }`} 
          />
        </div>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 px-2">
        Supports Markdown: **bold** *italic* `code` [links](url), lists, and more. Type @ to mention users (max {MAX_MENTIONS} mentions)
        {countMentions(value) >= MAX_MENTIONS && (
          <span className="text-orange-500 font-semibold ml-1">• Max mentions reached</span>
        )}
      </p>
    </div>
  );
}
