const WORDS_PER_MINUTE = 200;

/** Strip markdown/HTML so word count reflects readable text only. */
export function stripContentForWordCount(content: string): string {
  if (!content) return '';

  let cleaned = content.replace(/<[^>]+>/g, ' ');

  cleaned = cleaned.replace(/^#{1,6}\s+/gm, '');
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1');
  cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1');
  cleaned = cleaned.replace(/__([^_]+)__/g, '$1');
  cleaned = cleaned.replace(/_([^_]+)_/g, '$1');
  cleaned = cleaned.replace(/```[\s\S]*?```/g, ' ');
  cleaned = cleaned.replace(/`([^`]+)`/g, '$1');
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  cleaned = cleaned.replace(/!\[([^\]]*)\]\([^)]+\)/g, ' ');
  cleaned = cleaned.replace(/^>\s+/gm, '');
  cleaned = cleaned.replace(/^[-*_]{3,}$/gm, '');
  cleaned = cleaned.replace(/^\|[^\n]*\|?\s*$/gm, '');
  cleaned = cleaned.replace(/^\|?[\s:|-]+\|?\s*$/gm, '');

  return cleaned.replace(/\s+/g, ' ').trim();
}

export function countWords(content: string): number {
  const plain = stripContentForWordCount(content);
  if (!plain) return 0;
  return plain.split(/\s+/).filter(Boolean).length;
}

export function getReadingTimeMinutes(content: string, wpm = WORDS_PER_MINUTE): number {
  const words = countWords(content);
  if (words === 0) return 1;
  return Math.max(1, Math.ceil(words / wpm));
}

export function formatReadingTime(content: string): string {
  const minutes = getReadingTimeMinutes(content);
  return `${minutes} min read`;
}
