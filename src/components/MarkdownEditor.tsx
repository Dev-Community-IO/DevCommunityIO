import { Bold, Italic, List, ListOrdered, Link as LinkIcon, Code, Image as ImageIcon, Heading1, Heading2, Quote, Table, Minus, Eye } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { MarkdownRenderer } from '../utils/markdownRenderer';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export function MarkdownEditor({ value, onChange, placeholder = 'Write your content...', minHeight = '300px' }: MarkdownEditorProps) {
  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [isToolbarSticky, setIsToolbarSticky] = useState(false);

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
        Supports Markdown: **bold** *italic* `code` [links](url), lists, and more
      </p>
    </div>
  );
}
