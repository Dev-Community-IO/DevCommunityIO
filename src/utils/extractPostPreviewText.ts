const normalizeCompare = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const isSkippableLine = (line: string): boolean => {
  const trimmed = line.trim();
  if (!trimmed) return true;
  if (/^#{1,6}\s+/.test(trimmed)) return true;
  if (/^!\[[^\]]*\]\([^)]+\)\s*$/.test(trimmed)) return true;
  if (/^!\[[^\]]*\]\[[^\]]*\]\s*$/.test(trimmed)) return true;
  if (/^<img\b[^>]*\/?>\s*$/i.test(trimmed)) return true;
  if (/^[-*_]{3,}\s*$/.test(trimmed)) return true;
  if (/^\|.*\|?\s*$/.test(trimmed)) return true;
  if (/^[-:| ]+$/.test(trimmed.replace(/\|/g, ''))) return true;
  if (/^https?:\/\/\S+\s*$/i.test(trimmed)) return true;
  return false;
};

const stripHtmlToPlain = (content: string): string => {
  if (!/<[a-z][\s\S]*>/i.test(content)) return content;

  return content
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<img[^>]*>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|li|blockquote)>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"');
};

const cleanInlineMarkdown = (line: string): string => {
  let text = line.trim();
  text = text.replace(/^#{1,6}\s+/, '');
  text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, '');
  text = text.replace(/!\[([^\]]*)\]\[[^\]]*\]/g, '');
  text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
  text = text.replace(/\*([^*]+)\*/g, '$1');
  text = text.replace(/__([^_]+)__/g, '$1');
  text = text.replace(/_([^_]+)_/g, '$1');
  text = text.replace(/`([^`]+)`/g, '$1');
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  text = text.replace(/<[^>]+>/g, '');
  text = text.replace(/^>\s+/, '');
  return text.replace(/\s+/g, ' ').trim();
};

const duplicatesTitle = (text: string, title?: string): boolean => {
  if (!title?.trim()) return false;
  const a = normalizeCompare(text);
  const b = normalizeCompare(title);
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.startsWith(b) || b.startsWith(a)) return true;
  return false;
};

/**
 * First substantive paragraph from post body — skips leading images, # headings,
 * and lines that repeat the post title.
 */
export function extractPostPreviewText(
  content: string | undefined | null,
  options?: { maxLength?: number; skipTitle?: string }
): string {
  if (!content?.trim()) return '';

  const maxLength = options?.maxLength ?? 250;
  const skipTitle = options?.skipTitle;

  const normalized = stripHtmlToPlain(content)
    .replace(/```[\s\S]*?```/g, '\n')
    .replace(/\r\n/g, '\n');

  const lines = normalized.split('\n');
  let paragraphLines: string[] = [];

  const flushParagraph = (): string | null => {
    if (paragraphLines.length === 0) return null;
    const joined = paragraphLines.join(' ').trim();
    paragraphLines = [];
    if (!joined || joined.length < 2) return null;
    if (duplicatesTitle(joined, skipTitle)) return null;
    return joined;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      const paragraph = flushParagraph();
      if (paragraph) {
        return paragraph.length > maxLength
          ? `${paragraph.slice(0, maxLength).trim()}…`
          : paragraph;
      }
      continue;
    }

    if (isSkippableLine(line)) continue;

    const cleaned = cleanInlineMarkdown(line);
    if (!cleaned || duplicatesTitle(cleaned, skipTitle)) continue;

    paragraphLines.push(cleaned);
  }

  const last = flushParagraph();
  if (last) {
    return last.length > maxLength ? `${last.slice(0, maxLength).trim()}…` : last;
  }

  return '';
}
