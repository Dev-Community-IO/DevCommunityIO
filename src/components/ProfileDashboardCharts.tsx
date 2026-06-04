import { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import type { UserStatsPostsByCategory, UserStatsTimelinePoint } from '../services/api/users.service';
import { asidePanelClass } from './postCardSurface';

const CATEGORY_COLORS: Record<string, string> = {
  general: '#52525b',
  hackathon: '#0ea5e9',
  event: '#8b5cf6',
  opportunity: '#f59e0b',
};

const ENGAGEMENT_COLORS = ['#18181b', '#3f3f46', '#71717a', '#a1a1aa'];

function useIsDarkMode() {
  const [dark, setDark] = useState(
    () => typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  );
  useEffect(() => {
    const root = document.documentElement;
    const observer = new MutationObserver(() => setDark(root.classList.contains('dark')));
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  return dark;
}

function ChartPanel({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className={`${asidePanelClass} p-3 sm:p-4`}>
      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</p>
      {subtitle && <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">{subtitle}</p>}
      <div className="mt-3 h-[220px] w-full min-w-0">{children}</div>
    </div>
  );
}

function ZincTooltip({
  active,
  payload,
  label,
  isDark,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
  isDark: boolean;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className={`rounded-lg border px-2.5 py-2 text-xs shadow-md ${
        isDark
          ? 'border-white/10 bg-zinc-900 text-zinc-100'
          : 'border-zinc-200 bg-white text-zinc-900'
      }`}
    >
      {label && <p className="mb-1 font-medium text-zinc-500 dark:text-zinc-400">{label}</p>}
      {payload.map((entry) => (
        <p key={entry.name} className="flex items-center gap-2 tabular-nums">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
          {entry.name}: {entry.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

export function ProfileDashboardCharts({
  timeline,
  postsByCategory,
  engagement,
  periodLabel = 'Last 30 days',
}: {
  timeline: UserStatsTimelinePoint[];
  postsByCategory: UserStatsPostsByCategory;
  engagement: {
    upvotes: number;
    downvotes: number;
    reactions: number;
    bookmarks: number;
  };
  periodLabel?: string;
}) {
  const isDark = useIsDarkMode();
  const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  const axisColor = isDark ? '#71717a' : '#a1a1aa';
  const legendColor = isDark ? '#a1a1aa' : '#71717a';

  const contentData = useMemo(
    () =>
      [
        { name: 'Posts', key: 'general', value: postsByCategory.general },
        { name: 'Hackathons', key: 'hackathon', value: postsByCategory.hackathon },
        { name: 'Events', key: 'event', value: postsByCategory.event },
        { name: 'Jobs', key: 'opportunity', value: postsByCategory.opportunity },
      ].filter((d) => d.value > 0),
    [postsByCategory]
  );

  const engagementData = useMemo(
    () =>
      [
        { name: 'Upvotes', value: engagement.upvotes },
        { name: 'Downvotes', value: engagement.downvotes },
        { name: 'Reactions', value: engagement.reactions },
        { name: 'Bookmarks', value: engagement.bookmarks },
      ].filter((d) => d.value > 0),
    [engagement]
  );

  const hasTimeline = timeline.some((t) => t.posts > 0 || t.replies > 0);
  const hasContent = contentData.length > 0;
  const hasEngagement = engagementData.length > 0;
  const xTickInterval = timeline.length > 14 ? Math.max(0, Math.floor(timeline.length / 7) - 1) : 0;

  if (!hasTimeline && !hasContent && !hasEngagement) {
    return (
      <ChartPanel title="Charts" subtitle="Activity charts appear once you have posts or engagement.">
        <div className="flex h-full items-center justify-center text-xs text-zinc-500">
          No chart data yet
        </div>
      </ChartPanel>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      {hasTimeline && (
        <ChartPanel title="Activity" subtitle={`Posts and replies · ${periodLabel.toLowerCase()}`}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeline} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="postsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={isDark ? '#fafafa' : '#18181b'} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={isDark ? '#fafafa' : '#18181b'} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="repliesFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: axisColor, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                interval={xTickInterval}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: axisColor, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={28}
              />
              <Tooltip content={<ZincTooltip isDark={isDark} />} />
              <Legend
                wrapperStyle={{ fontSize: 11, color: legendColor }}
                iconType="circle"
                iconSize={8}
              />
              <Area
                type="monotone"
                dataKey="posts"
                name="Posts"
                stroke={isDark ? '#fafafa' : '#18181b'}
                fill="url(#postsFill)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="replies"
                name="Replies"
                stroke="#0ea5e9"
                fill="url(#repliesFill)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartPanel>
      )}

      {hasEngagement && (
        <ChartPanel
          title="Engagement received"
          subtitle={`Votes, reactions, and saves · ${periodLabel.toLowerCase()}`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={engagementData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="name" tick={{ fill: axisColor, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis
                allowDecimals={false}
                tick={{ fill: axisColor, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={28}
              />
              <Tooltip
                cursor={{ fill: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }}
                content={<ZincTooltip isDark={isDark} />}
              />
              <Bar dataKey="value" name="Count" radius={[4, 4, 0, 0]}>
                {engagementData.map((_, index) => (
                  <Cell key={index} fill={ENGAGEMENT_COLORS[index % ENGAGEMENT_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
      )}

      {hasContent && (
        <ChartPanel title="Content mix" subtitle={`Published posts by type · ${periodLabel.toLowerCase()}`}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={contentData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={78}
                paddingAngle={2}
                strokeWidth={0}
              >
                {contentData.map((entry) => (
                  <Cell key={entry.key} fill={CATEGORY_COLORS[entry.key] ?? '#52525b'} />
                ))}
              </Pie>
              <Tooltip content={<ZincTooltip isDark={isDark} />} />
              <Legend
                layout="vertical"
                align="right"
                verticalAlign="middle"
                wrapperStyle={{ fontSize: 11, color: legendColor }}
                iconType="circle"
                iconSize={8}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartPanel>
      )}
    </div>
  );
}
