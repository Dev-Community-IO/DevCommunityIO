import { useEffect, useId, useMemo, useState } from 'react';
import { Loader2, Maximize2, X } from 'lucide-react';

interface MermaidBlockProps {
  code: string;
  compact?: boolean;
}

function isDarkMode(): boolean {
  if (typeof document === 'undefined') return false;
  return document.documentElement.classList.contains('dark');
}

/** Decode entities that break Mermaid arrows (e.g. User-&gt;&gt;Wallet). */
function decodeMermaidSource(raw: string): string {
  return raw
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .trim();
}

let mermaidInitTheme: 'default' | 'dark' | null = null;

async function getMermaid(theme: 'default' | 'dark') {
  const mermaid = (await import('mermaid')).default;
  if (mermaidInitTheme !== theme) {
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'loose',
      theme,
      fontFamily:
        'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      flowchart: { curve: 'basis', htmlLabels: true, padding: 16 },
      sequence: { actorMargin: 40, messageMargin: 36 },
      themeVariables:
        theme === 'dark'
          ? {
              primaryColor: '#1e293b',
              primaryTextColor: '#e2e8f0',
              primaryBorderColor: '#475569',
              lineColor: '#94a3b8',
              secondaryColor: '#0f172a',
              tertiaryColor: '#334155',
              background: 'transparent',
              mainBkg: '#1e293b',
              nodeBorder: '#64748b',
              clusterBkg: '#0f172a',
              titleColor: '#f1f5f9',
              edgeLabelBackground: '#0f172a',
            }
          : {
              primaryColor: '#eff6ff',
              primaryTextColor: '#0f172a',
              primaryBorderColor: '#93c5fd',
              lineColor: '#64748b',
              secondaryColor: '#f8fafc',
              tertiaryColor: '#e2e8f0',
              background: 'transparent',
              mainBkg: '#eff6ff',
              nodeBorder: '#60a5fa',
              clusterBkg: '#f8fafc',
              titleColor: '#0f172a',
              edgeLabelBackground: '#ffffff',
            },
    });
    mermaidInitTheme = theme;
  }
  return mermaid;
}

export function MermaidBlock({ code, compact = false }: MermaidBlockProps) {
  const reactId = useId().replace(/:/g, '');
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [dark, setDark] = useState(isDarkMode);

  const chart = useMemo(() => decodeMermaidSource(code), [code]);

  useEffect(() => {
    const root = document.documentElement;
    const sync = () => setDark(root.classList.contains('dark'));
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const render = async () => {
      if (!chart) {
        setSvg('');
        setError('Empty diagram');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const theme = dark ? 'dark' : 'default';
        const mermaid = await getMermaid(theme);
        const id = `mermaid-${reactId}-${Date.now()}`;
        const { svg: rendered } = await mermaid.render(id, chart);
        if (!cancelled) {
          setSvg(rendered);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setSvg('');
          setError(err instanceof Error ? err.message : 'Failed to render diagram');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void render();
    return () => {
      cancelled = true;
    };
  }, [chart, dark, reactId]);

  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpanded(false);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [expanded]);

  return (
    <>
      <div className={`group relative ${compact ? 'my-2' : 'my-5'}`}>
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="absolute right-0 top-0 z-10 inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 opacity-0 transition-opacity hover:bg-zinc-100 hover:text-zinc-700 group-hover:opacity-100 dark:hover:bg-white/10 dark:hover:text-zinc-200"
          title="Fullscreen"
          aria-label="View diagram fullscreen"
        >
          <Maximize2 size={15} />
        </button>

        <div
          className={`mermaid-diagram flex w-full items-center justify-center overflow-x-auto ${
            compact ? 'min-h-[100px] py-2' : 'min-h-[160px] py-3'
          }`}
        >
          {loading && (
            <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
              <Loader2 size={16} className="animate-spin" />
              Rendering diagram…
            </div>
          )}
          {!loading && error && (
            <div className="w-full space-y-2 text-left">
              <p className="text-sm font-medium text-red-600 dark:text-red-400">
                Could not render Mermaid diagram
              </p>
              <pre className="overflow-x-auto rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                {error}
              </pre>
            </div>
          )}
          {!loading && !error && svg && (
            <div
              className="mermaid-svg w-full max-w-full [&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-full"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          )}
        </div>
      </div>

      {expanded && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setExpanded(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Expanded Mermaid diagram"
        >
          <div
            className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-[#0b1220]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-white/10 dark:text-zinc-200 dark:hover:bg-white/15"
              aria-label="Close"
            >
              <X size={16} />
            </button>
            <div className="overflow-auto p-6 sm:p-8">
              {loading && (
                <div className="flex items-center justify-center gap-2 py-16 text-sm text-zinc-500">
                  <Loader2 size={16} className="animate-spin" />
                  Rendering…
                </div>
              )}
              {!loading && error && (
                <pre className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                  {error}
                </pre>
              )}
              {!loading && !error && svg && (
                <div
                  className="mermaid-svg flex w-full justify-center [&_svg]:h-auto [&_svg]:max-w-full"
                  dangerouslySetInnerHTML={{ __html: svg }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
