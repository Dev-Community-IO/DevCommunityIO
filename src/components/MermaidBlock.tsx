import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Check, Code2, Copy, Loader2, Maximize2, Minimize2, Workflow, X } from 'lucide-react';

interface MermaidBlockProps {
  code: string;
  compact?: boolean;
}

function isDarkMode(): boolean {
  if (typeof document === 'undefined') return false;
  return document.documentElement.classList.contains('dark');
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
              background: '#0b1220',
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
              background: '#ffffff',
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSource, setShowSource] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [dark, setDark] = useState(isDarkMode);

  const chart = useMemo(() => code.trim(), [code]);

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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(chart);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const diagramPane = (
    <div
      ref={containerRef}
      className={`mermaid-diagram flex w-full items-center justify-center overflow-x-auto ${
        compact ? 'min-h-[120px] p-3' : 'min-h-[180px] p-5 sm:p-6'
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
          <p className="text-sm font-medium text-red-600 dark:text-red-400">Could not render Mermaid diagram</p>
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
  );

  return (
    <>
      <figure
        className={`group my-4 overflow-hidden rounded-xl border border-zinc-200/90 bg-gradient-to-b from-white to-zinc-50/80 shadow-sm dark:border-white/10 dark:from-[#0b1220] dark:to-[#0a1020] ${
          compact ? 'my-2' : 'my-5'
        }`}
      >
        <figcaption className="flex items-center justify-between gap-2 border-b border-zinc-200/80 bg-zinc-50/90 px-3 py-2 dark:border-white/10 dark:bg-white/[0.03]">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:bg-sky-400/10 dark:text-sky-300">
              <Workflow size={14} strokeWidth={2} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-zinc-800 dark:text-zinc-100">Diagram</p>
              <p className="truncate text-[10px] uppercase tracking-wider text-zinc-400">Mermaid</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              onClick={() => setShowSource((v) => !v)}
              className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-[11px] font-medium text-zinc-600 transition-colors hover:bg-zinc-200/70 dark:text-zinc-300 dark:hover:bg-white/10"
              title={showSource ? 'Hide source' : 'Show source'}
            >
              <Code2 size={13} />
              <span className="hidden sm:inline">{showSource ? 'Hide' : 'Source'}</span>
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-200/70 dark:text-zinc-300 dark:hover:bg-white/10"
              title={copied ? 'Copied' : 'Copy source'}
            >
              {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
            </button>
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-200/70 dark:text-zinc-300 dark:hover:bg-white/10"
              title="Expand"
            >
              <Maximize2 size={14} />
            </button>
          </div>
        </figcaption>

        {diagramPane}

        {showSource && (
          <pre className="overflow-x-auto border-t border-zinc-200/80 bg-[#0f172a] p-3 text-[12px] leading-relaxed text-slate-200 dark:border-white/10">
            <code>{chart}</code>
          </pre>
        )}
      </figure>

      {expanded && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setExpanded(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Expanded Mermaid diagram"
        >
          <div
            className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0b1220]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-white/10">
              <div className="flex items-center gap-2">
                <Workflow size={16} className="text-sky-600 dark:text-sky-300" />
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Diagram</span>
              </div>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/10"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
            <div className="overflow-auto p-6">
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
            <div className="flex justify-end border-t border-zinc-200 px-4 py-2 dark:border-white/10">
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/10"
              >
                <Minimize2 size={13} />
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
