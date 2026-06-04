import { FileText, MessageSquare, Users, UserPlus, Award } from 'lucide-react';
import { ProfileTabPanel, ProfileTabHeader } from './profileTabUi';

interface ProfilePublicOverviewProps {
  username: string;
  joinedDate?: string;
  stats: {
    posts: number;
    replies: number;
    followers: number;
    following: number;
  };
  achievementCount?: number;
}

export function ProfilePublicOverview({
  username,
  joinedDate,
  stats,
  achievementCount = 0,
}: ProfilePublicOverviewProps) {
  return (
    <ProfileTabPanel>
      <ProfileTabHeader
        icon={Users}
        title="Profile overview"
        description={
          joinedDate
            ? `Public summary for @${username} · joined ${joinedDate}`
            : `Public summary for @${username}`
        }
      />
      <p className="mb-4 text-xs text-zinc-500 dark:text-zinc-400">
        Detailed analytics and settings are only visible when you view your own profile.
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {[
          { icon: FileText, label: 'Posts', value: stats.posts },
          { icon: MessageSquare, label: 'Replies', value: stats.replies },
          { icon: Users, label: 'Followers', value: stats.followers },
          { icon: UserPlus, label: 'Following', value: stats.following },
          { icon: Award, label: 'Badges', value: achievementCount },
        ].map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="rounded-lg border border-zinc-200/80 bg-white/60 p-2.5 dark:border-white/[0.08] dark:bg-white/[0.02]"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-zinc-200/70 bg-zinc-50 text-zinc-500 dark:border-white/10 dark:bg-white/[0.04]">
                <Icon size={15} strokeWidth={2} aria-hidden />
              </span>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-400">
                  {label}
                </p>
                <p className="text-base font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                  {value.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ProfileTabPanel>
  );
}
