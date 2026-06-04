import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { BIO_MAX_LENGTH, BIO_PREVIEW_LINES } from '../constants/bio';

interface BioTextProps {
  text: string;
  className?: string;
  expandable?: boolean;
}

const URL_PATTERN =
  /https?:\/\/[^\s<]+[^\s<.,;:!?)}\]'"]|(?:^|[\s(,])((?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(?:\/[^\s,.)]*)?)/gi;

const MENTION_PATTERN = /(?:^|[\s(])@([a-zA-Z0-9_][a-zA-Z0-9_.-]*)/g;

const HASHTAG_PATTERN = /#([a-zA-Z0-9_][a-zA-Z0-9_-]*)/g;

type BioToken =
  | { type: 'text'; value: string }
  | { type: 'url'; value: string; href: string }
  | { type: 'mention'; value: string; username: string }
  | { type: 'hashtag'; value: string; tag: string };

function normalizeUrl(raw: string, leadingSpace = false): { display: string; href: string } {
  const trimmed = (leadingSpace ? raw.replace(/^\s+/, '') : raw).replace(/[.,;:!?)]+$/, '');
  const href = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
  return { display: trimmed, href };
}

function isEmailMention(text: string, mentionEnd: number): boolean {
  const after = text.slice(mentionEnd);
  return /^[a-zA-Z0-9_.-]*\.[a-zA-Z]/.test(after);
}

function tokenizeBio(text: string): BioToken[] {
  const tokens: BioToken[] = [];
  const specials: Array<{ index: number; end: number; token: BioToken }> = [];

  let match: RegExpExecArray | null;

  URL_PATTERN.lastIndex = 0;
  while ((match = URL_PATTERN.exec(text)) !== null) {
    const raw = match[0];
    const domain = match[1];
    const leadingSpace = raw.startsWith(' ') || raw.startsWith('(') || raw.startsWith(',');
    const { display, href } = domain
      ? normalizeUrl(domain, leadingSpace)
      : { display: raw.trim(), href: raw.trim() };
    specials.push({
      index: match.index,
      end: match.index + raw.length,
      token: { type: 'url', value: display, href },
    });
  }

  MENTION_PATTERN.lastIndex = 0;
  while ((match = MENTION_PATTERN.exec(text)) !== null) {
    const username = match[1];
    const atIndex = match.index + match[0].indexOf('@');
    if (isEmailMention(text, atIndex + 1 + username.length)) continue;
    specials.push({
      index: atIndex,
      end: atIndex + username.length + 1,
      token: { type: 'mention', value: `@${username}`, username },
    });
  }

  HASHTAG_PATTERN.lastIndex = 0;
  while ((match = HASHTAG_PATTERN.exec(text)) !== null) {
    const tag = match[1];
    specials.push({
      index: match.index,
      end: match.index + tag.length + 1,
      token: { type: 'hashtag', value: `#${tag}`, tag },
    });
  }

  specials.sort((a, b) => a.index - b.index || b.end - a.end);

  const used: Array<{ start: number; end: number }> = [];
  const merged: typeof specials = [];

  for (const item of specials) {
    const overlaps = used.some((u) => item.index < u.end && item.end > u.start);
    if (overlaps) continue;
    used.push({ start: item.index, end: item.end });
    merged.push(item);
  }

  merged.sort((a, b) => a.index - b.index);

  let cursor = 0;
  for (const { index, end, token } of merged) {
    if (index > cursor) {
      tokens.push({ type: 'text', value: text.slice(cursor, index) });
    }
    tokens.push(token);
    cursor = end;
  }

  if (cursor < text.length) {
    tokens.push({ type: 'text', value: text.slice(cursor) });
  }

  return tokens;
}

function renderTokens(tokens: BioToken[], keyPrefix: string) {
  return tokens.map((token, i) => {
    const key = `${keyPrefix}-${i}`;
    if (token.type === 'text') {
      return <span key={key}>{token.value}</span>;
    }
    if (token.type === 'url') {
      return (
        <a
          key={key}
          href={token.href}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-blue-600 underline decoration-blue-600/30 underline-offset-2 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 break-all"
          onClick={(e) => e.stopPropagation()}
        >
          {token.value}
        </a>
      );
    }
    if (token.type === 'mention') {
      return (
        <Link
          key={key}
          to={`/profile/${token.username}`}
          className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          onClick={(e) => e.stopPropagation()}
        >
          @{token.username}
        </Link>
      );
    }
    return (
      <Link
        key={key}
        to={`/tags/${token.tag.toLowerCase()}`}
        className="font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
        onClick={(e) => e.stopPropagation()}
      >
        #{token.tag}
      </Link>
    );
  });
}

export function BioText({ text, className = '', expandable = true }: BioTextProps) {
  const [expanded, setExpanded] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const contentRef = useRef<HTMLParagraphElement>(null);
  const safeText = (text || '').slice(0, BIO_MAX_LENGTH);
  const tokens = tokenizeBio(safeText);

  const measureOverflow = useCallback(() => {
    const el = contentRef.current;
    if (!el || !expandable || expanded) return;
    setHasOverflow(el.scrollHeight > el.clientHeight + 1);
  }, [expandable, expanded]);

  useEffect(() => {
    measureOverflow();
  }, [measureOverflow, safeText]);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => measureOverflow());
    observer.observe(el);
    return () => observer.disconnect();
  }, [measureOverflow]);

  const showToggle = expandable && (expanded || hasOverflow);
  const lineClampClass =
    !expanded && expandable
      ? BIO_PREVIEW_LINES === 3
        ? 'line-clamp-3'
        : 'line-clamp-2'
      : '';

  return (
    <div className={className}>
      <p
        ref={contentRef}
        className={`text-xs leading-snug text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap break-words sm:text-sm sm:leading-relaxed ${lineClampClass}`}
      >
        {renderTokens(tokens, 'bio')}
      </p>
      {showToggle && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 touch-manipulation"
        >
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}
    </div>
  );
}
