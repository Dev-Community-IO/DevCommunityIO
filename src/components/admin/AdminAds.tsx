import { useEffect, useMemo, useState } from 'react';
import {
  Megaphone,
  Plus,
  X,
  Trash2,
  Eye,
  EyeOff,
  Pencil,
  Calendar,
  Save,
  AlertTriangle,
  ExternalLink,
  BarChart3,
  Layout,
  Sparkles,
} from 'lucide-react';
import adsService, { AdInput, AdminAd, AdPlacement } from '../../services/api/ads.service';
import { AdSlot } from '../ads/AdSlot';

type FormState = {
  title: string;
  placement: AdPlacement;
  htmlContent: string;
  linkUrl: string;
  maxHeight: string;
  priority: string;
  isActive: boolean;
  startsAt: string;
  endsAt: string;
};

const PLACEMENT_META: Record<AdPlacement, { label: string; hint: string; defaultHeight: number; icon: any }> = {
  sidebar: {
    label: 'Sidebar',
    hint: 'Shown on top of the right sidebar. Best size ~300×250. Max 2 active at once.',
    defaultHeight: 250,
    icon: Layout,
  },
  feed: {
    label: 'In-feed',
    hint: 'Shown between posts in the feed. Best a responsive banner ~600×280.',
    defaultHeight: 300,
    icon: Sparkles,
  },
};

const EMPTY_FORM: FormState = {
  title: '',
  placement: 'sidebar',
  htmlContent: '',
  linkUrl: '',
  maxHeight: '250',
  priority: '0',
  isActive: true,
  startsAt: '',
  endsAt: '',
};

function toLocalInput(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 16);
}

function adStatus(ad: AdminAd): { label: string; cls: string } {
  if (!ad.isActive) return { label: 'Inactive', cls: 'bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300' };
  const now = Date.now();
  if (ad.startsAt && new Date(ad.startsAt).getTime() > now)
    return { label: 'Scheduled', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' };
  if (ad.endsAt && new Date(ad.endsAt).getTime() < now)
    return { label: 'Expired', cls: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' };
  return { label: 'Live', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' };
}

export function AdminAds() {
  const [ads, setAds] = useState<AdminAd[]>([]);
  const [caps, setCaps] = useState<Record<string, number>>({ sidebar: 2, feed: 12 });
  const [activeCounts, setActiveCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { ads, caps, activeCounts } = await adsService.adminList();
      setAds(ads);
      setCaps(caps);
      setActiveCounts(activeCounts);
    } catch (e: any) {
      setError(e?.message || 'Failed to load ads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
    setEditorOpen(true);
  };

  const openEdit = (ad: AdminAd) => {
    setEditingId(ad.id);
    setForm({
      title: ad.title,
      placement: ad.placement,
      htmlContent: ad.htmlContent,
      linkUrl: ad.linkUrl || '',
      maxHeight: ad.maxHeight ? String(ad.maxHeight) : String(PLACEMENT_META[ad.placement].defaultHeight),
      priority: String(ad.priority ?? 0),
      isActive: ad.isActive,
      startsAt: toLocalInput(ad.startsAt),
      endsAt: toLocalInput(ad.endsAt),
    });
    setError(null);
    setEditorOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.htmlContent.trim()) {
      setError('Title and HTML content are required.');
      return;
    }
    setSaving(true);
    setError(null);
    const payload: AdInput = {
      title: form.title.trim(),
      placement: form.placement,
      htmlContent: form.htmlContent,
      linkUrl: form.linkUrl.trim() || null,
      maxHeight: form.maxHeight ? Number(form.maxHeight) : null,
      priority: Number(form.priority) || 0,
      isActive: form.isActive,
      startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
      endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
    };
    try {
      if (editingId) {
        await adsService.update(editingId, payload);
      } else {
        await adsService.create(payload);
      }
      setEditorOpen(false);
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to save ad');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (ad: AdminAd) => {
    try {
      await adsService.toggle(ad.id);
      await load();
    } catch {
      /* ignore */
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adsService.remove(id);
      setDeleteId(null);
      await load();
    } catch {
      /* ignore */
    }
  };

  const previewAd = useMemo(
    () => ({
      id: 'preview',
      title: form.title || 'Preview',
      placement: form.placement,
      htmlContent: form.htmlContent,
      maxHeight: form.maxHeight ? Number(form.maxHeight) : null,
      linkUrl: form.linkUrl || null,
    }),
    [form]
  );

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-500 text-white shadow-md">
            <Megaphone size={20} />
          </span>
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Sponsored Ads</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Manage HTML "pub" slots rendered in the sidebar and between feed posts.
            </p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-transform hover:scale-[1.02] active:scale-95"
        >
          <Plus size={16} /> New Ad
        </button>
      </div>

      {/* Caps summary */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {(Object.keys(PLACEMENT_META) as AdPlacement[]).map((p) => {
          const Icon = PLACEMENT_META[p].icon;
          const live = activeCounts[p] || 0;
          const cap = caps[p] ?? 0;
          const over = live > cap;
          return (
            <div
              key={p}
              className="flex items-center justify-between rounded-xl border border-zinc-200/80 bg-white/70 p-3.5 dark:border-white/10 dark:bg-white/[0.03]"
            >
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 dark:bg-white/5 dark:text-zinc-300">
                  <Icon size={16} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{PLACEMENT_META[p].label}</p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">max {cap} live</p>
                </div>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                  over
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                }`}
              >
                {live}/{cap} live
              </span>
            </div>
          );
        })}
      </div>

      {/* List */}
      {loading ? (
        <div className="py-16 text-center text-sm text-zinc-500">Loading ads…</div>
      ) : ads.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 py-16 text-center dark:border-zinc-700">
          <Megaphone size={40} className="mx-auto mb-3 text-zinc-300 dark:text-zinc-600" />
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">No ads yet</p>
          <p className="mb-4 text-xs text-zinc-500">Create your first sponsored slot.</p>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
          >
            <Plus size={16} /> New Ad
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {ads.map((ad) => {
            const status = adStatus(ad);
            const ctr = ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(1) : '0.0';
            return (
              <div
                key={ad.id}
                className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/80 shadow-sm dark:border-white/10 dark:bg-white/[0.03]"
              >
                <div className="flex items-start gap-3 p-4">
                  {/* Preview thumbnail */}
                  <div className="w-40 shrink-0 overflow-hidden rounded-lg border border-zinc-200 dark:border-white/10">
                    <AdSlot ad={ad} preview showLabel={false} defaultMaxHeight={110} />
                  </div>
                  {/* Meta */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">{ad.title}</h3>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${status.cls}`}>
                        {status.label}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                      <span className="rounded bg-zinc-100 px-1.5 py-0.5 font-medium dark:bg-white/5">
                        {PLACEMENT_META[ad.placement]?.label || ad.placement}
                      </span>
                      <span>priority {ad.priority}</span>
                      {ad.maxHeight ? <span>· {ad.maxHeight}px</span> : null}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-zinc-600 dark:text-zinc-300">
                      <span className="inline-flex items-center gap-1">
                        <Eye size={12} /> {ad.impressions.toLocaleString()}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <ExternalLink size={12} /> {ad.clicks.toLocaleString()}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <BarChart3 size={12} /> {ctr}% CTR
                      </span>
                    </div>
                    {(ad.startsAt || ad.endsAt) && (
                      <div className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-zinc-500">
                        <Calendar size={11} />
                        {ad.startsAt ? new Date(ad.startsAt).toLocaleDateString() : '—'}
                        {' → '}
                        {ad.endsAt ? new Date(ad.endsAt).toLocaleDateString() : '∞'}
                      </div>
                    )}
                  </div>
                </div>
                {/* Actions */}
                <div className="flex items-center justify-end gap-1.5 border-t border-zinc-100 bg-zinc-50/60 px-3 py-2 dark:border-white/5 dark:bg-white/[0.02]">
                  <button
                    onClick={() => handleToggle(ad)}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-200/60 dark:text-zinc-300 dark:hover:bg-white/10"
                  >
                    {ad.isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                    {ad.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => openEdit(ad)}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30"
                  >
                    <Pencil size={14} /> Edit
                  </button>
                  {deleteId === ad.id ? (
                    <span className="inline-flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(ad.id)}
                        className="rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-semibold text-white"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setDeleteId(null)}
                        className="rounded-lg px-2 py-1.5 text-xs text-zinc-500"
                      >
                        Cancel
                      </button>
                    </span>
                  ) : (
                    <button
                      onClick={() => setDeleteId(ad.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Editor modal */}
      {editorOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl dark:bg-zinc-900 sm:rounded-2xl">
            <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3.5 dark:border-white/10">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                {editingId ? 'Edit ad' : 'New ad'}
              </h3>
              <button onClick={() => setEditorOpen(false)} className="rounded-lg p-1.5 hover:bg-zinc-100 dark:hover:bg-white/10">
                <X size={18} />
              </button>
            </div>

            <div className="grid flex-1 grid-cols-1 gap-0 overflow-y-auto md:grid-cols-2">
              {/* Form */}
              <div className="space-y-4 p-5">
                {error && (
                  <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-300">
                    <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                    {error}
                  </div>
                )}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-zinc-600 dark:text-zinc-300">Title (internal)</label>
                  <input
                    value={form.title}
                    onChange={(e) => set('title', e.target.value)}
                    placeholder="e.g. Cardano Summit banner"
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5 dark:text-zinc-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-zinc-600 dark:text-zinc-300">Placement</label>
                    <select
                      value={form.placement}
                      onChange={(e) => {
                        const p = e.target.value as AdPlacement;
                        set('placement', p);
                        if (!form.maxHeight) set('maxHeight', String(PLACEMENT_META[p].defaultHeight));
                      }}
                      className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5 dark:text-zinc-100"
                    >
                      <option value="sidebar">Sidebar (max 2)</option>
                      <option value="feed">In-feed</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-zinc-600 dark:text-zinc-300">Max height (px)</label>
                    <input
                      type="number"
                      value={form.maxHeight}
                      onChange={(e) => set('maxHeight', e.target.value)}
                      className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5 dark:text-zinc-100"
                    />
                  </div>
                </div>

                <div className="rounded-lg bg-blue-50 p-2.5 text-[11px] text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                  💡 {PLACEMENT_META[form.placement].hint} HTML runs in a sandboxed iframe (scripts isolated from the site).
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-zinc-600 dark:text-zinc-300">Ad HTML</label>
                  <textarea
                    value={form.htmlContent}
                    onChange={(e) => set('htmlContent', e.target.value)}
                    placeholder={'<a href="https://example.com"><img src="https://..." style="width:100%" /></a>'}
                    rows={8}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-xs dark:border-white/10 dark:bg-white/5 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                    Click-through URL (optional)
                  </label>
                  <input
                    value={form.linkUrl}
                    onChange={(e) => set('linkUrl', e.target.value)}
                    placeholder="https://… (makes the whole banner clickable + tracks clicks)"
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5 dark:text-zinc-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 flex items-center gap-1 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                      <Calendar size={12} /> Starts
                    </label>
                    <input
                      type="datetime-local"
                      value={form.startsAt}
                      onChange={(e) => set('startsAt', e.target.value)}
                      className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1 flex items-center gap-1 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                      <Calendar size={12} /> Ends
                    </label>
                    <input
                      type="datetime-local"
                      value={form.endsAt}
                      onChange={(e) => set('endsAt', e.target.value)}
                      className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5 dark:text-zinc-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 items-end gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-zinc-600 dark:text-zinc-300">Priority</label>
                    <input
                      type="number"
                      value={form.priority}
                      onChange={(e) => set('priority', e.target.value)}
                      className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5 dark:text-zinc-100"
                    />
                  </div>
                  <label className="flex cursor-pointer items-center gap-2 pb-2 text-sm text-zinc-700 dark:text-zinc-200">
                    <input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} className="h-4 w-4 rounded" />
                    Active
                  </label>
                </div>
              </div>

              {/* Live preview */}
              <div className="border-t border-zinc-200 bg-zinc-50 p-5 dark:border-white/10 dark:bg-black/20 md:border-l md:border-t-0">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  <Eye size={13} /> Live preview
                </p>
                <div className="rounded-xl border border-dashed border-zinc-300 p-3 dark:border-zinc-700">
                  {form.htmlContent.trim() ? (
                    <AdSlot ad={previewAd} preview defaultMaxHeight={Number(form.maxHeight) || 250} />
                  ) : (
                    <div className="py-10 text-center text-xs text-zinc-400">Paste ad HTML to preview it here.</div>
                  )}
                </div>
                <p className="mt-3 text-[11px] leading-relaxed text-zinc-500">
                  The preview matches exactly how the ad renders on the site, contained within its max-height.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 border-t border-zinc-200 px-5 py-3.5 dark:border-white/10">
              <button
                onClick={() => setEditorOpen(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 px-5 py-2 text-sm font-semibold text-white shadow-md disabled:opacity-60"
              >
                <Save size={16} /> {saving ? 'Saving…' : editingId ? 'Save changes' : 'Create ad'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
