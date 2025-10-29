import { Bold, Italic, List, ListOrdered, Link as LinkIcon, Code, Image as ImageIcon, Heading1, Heading2, Quote, Table, Minus, Eye } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { MarkdownRenderer } from '../utils/markdownRenderer';
import usersService from '../services/api/users.service';
import { Avatar } from './Avatar';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

const MAX_MENTIONS = 5;

export function MarkdownEditor({ value, onChange, placeholder = 'Write your content...', minHeight = '300px' }: MarkdownEditorProps) {
  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isToolbarSticky, setIsToolbarSticky] = useState(false);
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const [mentionUsers, setMentionUsers] = useState<Array<{ id: string; username: string; avatar?: string; avatarUrl?: string; pseudo?: string }>>([]);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);

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

  useEffect(() => {
    const handleScroll = () => {
      if (toolbarRef.current) {
        const rect = toolbarRef.current.getBoundingClientRect();
        setIsToolbarSticky(rect.top <= 0);
      }
    };

    const editorContainer = document.getElementById('editor-container');
    if (editorContainer) {
      editorContainer.addEventListener('scroll', handleScroll);
      return () => editorContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

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
        
        // Get cursor position for dropdown
        try {
          const coordinates = getCaretCoordinates(textarea, cursorPos);
          const textareaRect = textarea.getBoundingClientRect();
          
          // Calculate position relative to viewport
          const topPos = textareaRect.top + coordinates.top + 25; // 25px below cursor
          const leftPos = textareaRect.left + coordinates.left;
          
          setMentionPosition({
            top: topPos,
            left: leftPos,
          });
        } catch (err) {
          console.error('Failed to get caret coordinates:', err);
          // If coordinate calculation fails, use approximate position
          const textareaRect = textarea.getBoundingClientRect();
          setMentionPosition({
            top: textareaRect.top + 50,
            left: textareaRect.left + 20,
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
    { icon: ImageIcon, action: () => insertMarkdown('![', '](url)', 'alt text'), title: 'Image' },
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
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-all duration-300 group relative"
                type="button"
              >
                {button.label ? (
                  <span className="text-sm font-bold">{button.label}</span>
                ) : (
                  <Icon size={18} />
                )}
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                  {button.title}
                </span>
              </button>
            );
          })}
        </div>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-all duration-300"
          type="button"
        >
          <Eye size={18} />
          <span className="text-sm font-medium">{showPreview ? 'Edit' : 'Preview'}</span>
        </button>
      </div>

      <div
        className="relative rounded-b-xl backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/50 transition-all duration-300 overflow-hidden"
        style={{ minHeight }}
      >
        {showPreview ? (
          <div
            className="p-4 overflow-y-auto"
            style={{ maxHeight: minHeight }}
          >
            {value ? (
              <MarkdownRenderer content={value} />
            ) : (
              <p className="text-gray-500 dark:text-gray-400">Nothing to preview...</p>
            )}
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full h-full p-4 bg-transparent border-0 focus:outline-none resize-none overflow-y-auto"
            style={{ minHeight }}
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
        )}
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 px-2">
        Supports Markdown: **bold** *italic* `code` [links](url), lists, and more. Type @ to mention users (max {MAX_MENTIONS} mentions)
        {countMentions(value) >= MAX_MENTIONS && (
          <span className="text-orange-500 font-semibold ml-1">• Max mentions reached</span>
        )}
      </p>

      {/* Mention Dropdown */}
      {showMentionDropdown && (
        <div
          ref={dropdownRef}
          className="fixed z-[9999] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-64 overflow-y-auto"
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
    </div>
  );
}
