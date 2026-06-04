import type { PublicAd } from '../../services/api/ads.service';
import { AdSlot } from './AdSlot';

/**
 * A sponsored slot styled to sit naturally between feed posts.
 */
export function InFeedAd({ ad }: { ad: PublicAd }) {
  return (
    <div className="w-full">
      <AdSlot ad={ad} defaultMaxHeight={300} className="bg-white/90 dark:bg-white/[0.04]" />
    </div>
  );
}
