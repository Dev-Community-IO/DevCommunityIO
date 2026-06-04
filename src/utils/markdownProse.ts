/** Shared typography for MarkdownRenderer — matches PostDetail article body. */

export const articleProseClass = [
  'prose prose-sm dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-300',
  'prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-zinc-900 dark:prose-headings:text-zinc-100',
  'prose-h1:text-xl prose-h1:mt-6 prose-h1:mb-3',
  'prose-h2:text-lg prose-h2:mt-5 prose-h2:mb-2',
  'prose-h3:text-base prose-h3:mt-4 prose-h3:mb-1.5',
  'prose-p:my-2.5 prose-p:text-[15px] prose-p:leading-relaxed',
  'prose-ul:my-3 prose-ul:pl-5 prose-ol:my-3 prose-ol:pl-5',
  'prose-li:my-0.5 prose-li:text-[15px] prose-li:leading-relaxed',
  'prose-blockquote:my-3 prose-blockquote:border-l-2 prose-blockquote:border-zinc-300 prose-blockquote:pl-3 prose-blockquote:text-sm prose-blockquote:italic dark:prose-blockquote:border-zinc-600',
  'prose-code:text-[13px] prose-code:bg-zinc-100 dark:prose-code:bg-zinc-800/80 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none',
  'prose-pre:my-3 prose-pre:text-[13px] prose-pre:leading-6 prose-pre:p-3 prose-pre:rounded-lg',
  'prose-a:text-zinc-800 prose-a:underline dark:prose-a:text-zinc-200',
  'prose-strong:text-zinc-900 dark:prose-strong:text-zinc-100',
  'prose-img:my-4 prose-img:rounded-lg',
  'prose-hr:my-6 prose-hr:border-zinc-200 dark:prose-hr:border-zinc-700',
  'prose-table:my-4 prose-table:text-sm',
  'prose-th:p-2 prose-th:text-left prose-th:text-xs prose-th:font-semibold',
  'prose-td:p-2 prose-td:text-sm',
].join(' ');

export const compactProseClass = [
  'prose prose-sm dark:prose-invert max-w-none',
  'prose-p:my-0 prose-p:text-sm prose-p:leading-snug',
  'prose-headings:my-0 prose-headings:text-sm prose-headings:font-semibold',
].join(' ');
