import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  compact?: boolean; // For feed cards - removes extra spacing
}

export function MarkdownRenderer({ content, className = '', compact = false }: MarkdownRendererProps) {
  const handleMentionClick = (username: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Navigate to profile page
    window.location.href = `/profile/${username}`;
  };

  const renderMarkdown = (text: string): JSX.Element[] => {
    const lines = text.split('\n');
    const elements: JSX.Element[] = [];
    let currentIndex = 0;
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];
    let codeBlockLang = '';
    let inTable = false;
    let tableRows: string[][] = [];
    let tableHeaders: string[] = [];
    let inList = false;
    let listItems: string[] = [];
    let listType: 'ul' | 'ol' = 'ul';
    let inBlockquote = false;
    let blockquoteContent: string[] = [];

    const flushCodeBlock = () => {
      if (codeBlockContent.length > 0) {
        const code = codeBlockContent.join('\n');
        elements.push(
          <CodeBlock key={`code-${currentIndex}`} code={code} language={codeBlockLang} />
        );
        codeBlockContent = [];
        codeBlockLang = '';
      }
    };

    const flushTable = () => {
      if (tableHeaders.length > 0 && tableRows.length > 0) {
        elements.push(
          <div key={`table-${currentIndex}`} className="overflow-x-auto my-4">
            <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  {tableHeaders.map((header, i) => (
                    <th key={i} className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left font-semibold">
                      {parseInlineMarkdown(header.trim())}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="border border-gray-300 dark:border-gray-700 px-4 py-2">
                        {parseInlineMarkdown(cell.trim())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableHeaders = [];
        tableRows = [];
      }
    };

    const flushList = () => {
      if (listItems.length > 0) {
        const ListTag = listType === 'ol' ? 'ol' : 'ul';
        elements.push(
          <ListTag key={`list-${currentIndex}`} className={listType === 'ol' ? 'list-decimal list-inside my-4 space-y-2' : 'list-disc list-inside my-4 space-y-2'}>
            {listItems.map((item, i) => (
              <li key={i} className="ml-4">{parseInlineMarkdown(item)}</li>
            ))}
          </ListTag>
        );
        listItems = [];
      }
    };

    const flushBlockquote = () => {
      if (blockquoteContent.length > 0) {
        elements.push(
          <blockquote key={`quote-${currentIndex}`} className="border-l-4 border-blue-500 pl-4 py-2 my-4 italic text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/20">
            {blockquoteContent.map((line, i) => (
              <React.Fragment key={i}>
                {parseInlineMarkdown(line)}
                {i < blockquoteContent.length - 1 && <br />}
              </React.Fragment>
            ))}
          </blockquote>
        );
        blockquoteContent = [];
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      currentIndex = i;

      // Skip front matter
      if (i === 0 && line.trim() === '---') {
        let endIndex = i + 1;
        while (endIndex < lines.length && lines[endIndex].trim() !== '---') {
          endIndex++;
        }
        if (endIndex < lines.length) {
          i = endIndex;
          continue;
        }
      }

      // Code blocks
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          flushCodeBlock();
          inCodeBlock = false;
        } else {
          flushList();
          flushTable();
          flushBlockquote();
          inCodeBlock = true;
          codeBlockLang = line.trim().slice(3);
        }
        continue;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        continue;
      }

      // Blockquotes
      if (line.trim().startsWith('>')) {
        if (!inBlockquote) {
          flushList();
          flushTable();
          inBlockquote = true;
        }
        blockquoteContent.push(line.trim().slice(1).trim());
        continue;
      } else if (inBlockquote) {
        flushBlockquote();
        inBlockquote = false;
      }

      // Tables
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        const cells = line.split('|').slice(1, -1);

        // Check if it's a separator line
        if (cells.every(cell => /^[\s:-]+$/.test(cell))) {
          inTable = true;
          continue;
        }

        if (!inTable) {
          flushList();
          flushBlockquote();
          tableHeaders = cells;
        } else {
          tableRows.push(cells);
        }
        continue;
      } else if (inTable) {
        flushTable();
        inTable = false;
      }

      // Lists
      const unorderedMatch = line.match(/^\s*[-*+]\s+(.+)$/);
      const orderedMatch = line.match(/^\s*\d+\.\s+(.+)$/);

      if (unorderedMatch || orderedMatch) {
        if (!inList || (unorderedMatch && listType === 'ol') || (orderedMatch && listType === 'ul')) {
          flushList();
          flushTable();
          flushBlockquote();
          listType = unorderedMatch ? 'ul' : 'ol';
          inList = true;
        }
        listItems.push((unorderedMatch || orderedMatch)![1]);
        continue;
      } else if (inList && line.trim() !== '') {
        flushList();
        inList = false;
      }

      // Flush pending blocks if we hit a non-list line
      if (!inList && listItems.length > 0) {
        flushList();
      }

      // Horizontal rules
      if (/^---+$/.test(line.trim()) || /^\*\*\*+$/.test(line.trim())) {
        flushList();
        flushTable();
        flushBlockquote();
        elements.push(<hr key={`hr-${i}`} className="my-6 border-t-2 border-gray-300 dark:border-gray-700" />);
        continue;
      }

      // Headers
      const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headerMatch) {
        flushList();
        flushTable();
        flushBlockquote();
        const level = headerMatch[1].length;
        const text = headerMatch[2];
        const HeaderTag = `h${level}` as keyof JSX.IntrinsicElements;
        const sizes = ['text-3xl', 'text-2xl', 'text-xl', 'text-lg', 'text-base', 'text-sm'];
        const spacing = compact ? 'my-0.5' : 'my-4';
        elements.push(
          <HeaderTag key={`h${level}-${i}`} className={`${sizes[level - 1]} font-bold ${spacing}`}>
            {parseInlineMarkdown(text)}
          </HeaderTag>
        );
        continue;
      }

      // Empty lines
      if (line.trim() === '') {
        flushList();
        if (!compact && elements.length > 0 && elements[elements.length - 1].type !== 'br') {
          elements.push(<div key={`space-${i}`} className="h-2" />);
        }
        continue;
      }

      // Regular paragraphs
      flushList();
      flushTable();
      flushBlockquote();
      const paraSpacing = compact ? 'my-0 leading-snug' : 'my-3 leading-relaxed';
      elements.push(
        <p key={`p-${i}`} className={paraSpacing}>
          {parseInlineMarkdown(line)}
        </p>
      );
    }

    // Flush any remaining blocks
    flushCodeBlock();
    flushList();
    flushTable();
    flushBlockquote();

    return elements;
  };

  const parseInlineMarkdown = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    let currentText = text;
    let key = 0;

    // @mentions for users and pages (clickable)
    currentText = currentText.replace(/@([a-zA-Z0-9_]+)/g, (_, username) => {
      const placeholder = `__MENTION_${key}__`;
      parts.push(
        <a 
          key={`mention-${key++}`} 
          href={`/profile/${username}`}
          onClick={(e) => handleMentionClick(username, e)}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold cursor-pointer bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded hover:underline transition-colors"
        >
          @{username}
        </a>
      );
      return placeholder;
    });

    // Links with markdown syntax [text](url)
    currentText = currentText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, linkText, url) => {
      const placeholder = `__LINK_${key}__`;
      parts.push(
        <a key={`link-${key++}`} href={url} className="text-blue-500 hover:text-blue-600 hover:underline font-medium transition-colors" target="_blank" rel="noopener noreferrer">
          {linkText}
        </a>
      );
      return placeholder;
    });

    // Bold
    currentText = currentText.replace(/\*\*(.+?)\*\*/g, (_, boldText) => {
      const placeholder = `__BOLD_${key}__`;
      parts.push(<strong key={`bold-${key++}`}>{boldText}</strong>);
      return placeholder;
    });

    // Italic
    currentText = currentText.replace(/\*(.+?)\*/g, (_, italicText) => {
      const placeholder = `__ITALIC_${key}__`;
      parts.push(<em key={`italic-${key++}`}>{italicText}</em>);
      return placeholder;
    });

    // Inline code
    currentText = currentText.replace(/`([^`]+)`/g, (_, codeText) => {
      const placeholder = `__CODE_${key}__`;
      parts.push(
        <code key={`code-${key++}`} className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono">
          {codeText}
        </code>
      );
      return placeholder;
    });

    // Split by placeholders and reconstruct
    const segments = currentText.split(/(__(?:MENTION|LINK|BOLD|ITALIC|CODE)_\d+__)/);
    const result: React.ReactNode[] = [];

    segments.forEach((segment, index) => {
      const mentionMatch = segment.match(/__MENTION_(\d+)__/);
      const linkMatch = segment.match(/__LINK_(\d+)__/);
      const boldMatch = segment.match(/__BOLD_(\d+)__/);
      const italicMatch = segment.match(/__ITALIC_(\d+)__/);
      const codeMatch = segment.match(/__CODE_(\d+)__/);

      if (mentionMatch) {
        result.push(parts.find(p => React.isValidElement(p) && p.key === `mention-${mentionMatch[1]}`));
      } else if (linkMatch) {
        result.push(parts.find(p => React.isValidElement(p) && p.key === `link-${linkMatch[1]}`));
      } else if (boldMatch) {
        result.push(parts.find(p => React.isValidElement(p) && p.key === `bold-${boldMatch[1]}`));
      } else if (italicMatch) {
        result.push(parts.find(p => React.isValidElement(p) && p.key === `italic-${italicMatch[1]}`));
      } else if (codeMatch) {
        result.push(parts.find(p => React.isValidElement(p) && p.key === `code-${codeMatch[1]}`));
      } else if (segment) {
        result.push(<React.Fragment key={`text-${index}`}>{segment}</React.Fragment>);
      }
    });

    return result;
  };

  return (
    <div className={`prose prose-sm dark:prose-invert max-w-none ${className}`}>
      {renderMarkdown(content)}
    </div>
  );
}

// Code block component with copy button
function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const syntaxHighlight = (codeText: string): React.ReactNode => {
    const lines = codeText.split('\n');
    const highlightedLines = lines.map((line) => {
      let highlightedLine = line;

      // Comments
      highlightedLine = highlightedLine.replace(/(\/\/.*$|\/\*[\s\S]*?\*\/)/gm, '<span class="text-[#6272a4]">$1</span>');
      // Keywords
      highlightedLine = highlightedLine.replace(/\b(const|let|var|function|class|if|else|return|import|export|from|async|await|try|catch|throw|new|this|super|extends|static|public|private|protected)\b/g, '<span class="text-[#ff79c6]">$1</span>');
      // Booleans and null
      highlightedLine = highlightedLine.replace(/\b(true|false|null|undefined)\b/g, '<span class="text-[#bd93f9]">$1</span>');
      // Numbers
      highlightedLine = highlightedLine.replace(/\b(\d+)\b/g, '<span class="text-[#bd93f9]">$1</span>');
      // Strings
      highlightedLine = highlightedLine.replace(/(['"`])((?:\\\1|(?:(?!\1)).)*)(\1)/g, '<span class="text-[#f1fa8c]">$1$2$3</span>');
      // Function names
      highlightedLine = highlightedLine.replace(/([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g, '<span class="text-[#50fa7b]">$1</span>(');

      return highlightedLine;
    });

    const htmlContent = highlightedLines.join('\n');
    return <div dangerouslySetInnerHTML={{ __html: htmlContent }} style={{ whiteSpace: 'pre', lineHeight: '1.5' }} />;
  };

  return (
    <div className="relative group my-4">
      <pre 
        className="bg-[#282a36] text-[#f8f8f2] rounded-lg p-4 overflow-x-auto border border-gray-700 leading-6"
        style={{ lineHeight: '1.5' }}
      >
        {language && (
          <div className="text-xs text-gray-400 mb-2 pb-2 border-b border-gray-700">
            {language}
          </div>
        )}
        <code 
          className={language ? `language-${language}` : ''} 
          style={{ lineHeight: '1.5', display: 'block' }}
        >
          {syntaxHighlight(code)}
        </code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-2 rounded-lg bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 hover:text-white transition-all duration-200 opacity-0 group-hover:opacity-100 z-10"
        title={copied ? 'Copied!' : 'Copy code'}
      >
        {copied ? (
          <Check size={16} className="text-green-400" />
        ) : (
          <Copy size={16} />
        )}
      </button>
    </div>
  );
}
