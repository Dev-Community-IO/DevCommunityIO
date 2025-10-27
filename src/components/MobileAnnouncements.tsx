import { GlassCard } from './GlassCard';

export function MobileAnnouncements() {
  const hackathons = [
    {
      id: '1',
      title: 'Web3 Global Hackathon 2025',
      prize: '$100,000',
      participants: '2.5K participants',
      date: 'Feb 15 - Mar 15'
    },
    {
      id: '2',
      title: 'NFT Art Challenge',
      prize: '$50,000',
      participants: '1.8K participants',
      date: 'Jan 20 - Feb 20'
    }
  ];

  const events = [
    {
      id: '1',
      title: 'Web3 Summit 2025',
      location: 'San Francisco, CA',
      date: 'Mar 15, 2025'
    },
    {
      id: '2',
      title: 'NFT Art Exhibition',
      location: 'New York, NY',
      date: 'Feb 20, 2025'
    }
  ];

  const opportunities = [
    {
      id: '1',
      title: 'Senior Smart Contract Engineer',
      company: 'DeFi Protocol',
      salary: '$150k - $200k'
    },
    {
      id: '2',
      title: 'Blockchain Product Manager',
      company: 'Web3 Ventures',
      salary: '$140k - $180k'
    }
  ];

  return (
    <div className="space-y-3">
      <GlassCard className="p-3">
        <h3 className="font-semibold text-sm mb-2">Hackathons</h3>
        <div className="space-y-2">
          {hackathons.map(hackathon => (
            <div
              key={hackathon.id}
              className="pb-2 border-b border-white/10 dark:border-white/5 last:border-0 last:pb-0 cursor-pointer hover:opacity-70 transition-opacity"
            >
              <h4 className="font-medium text-xs mb-1 line-clamp-1">
                {hackathon.title}
              </h4>
              <p className="text-[10px] text-gray-600 dark:text-gray-400">
                {hackathon.prize} • {hackathon.participants}
              </p>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-3">
        <h3 className="font-semibold text-sm mb-2">Events</h3>
        <div className="space-y-2">
          {events.map(event => (
            <div
              key={event.id}
              className="pb-2 border-b border-white/10 dark:border-white/5 last:border-0 last:pb-0 cursor-pointer hover:opacity-70 transition-opacity"
            >
              <h4 className="font-medium text-xs mb-1 line-clamp-1">
                {event.title}
              </h4>
              <p className="text-[10px] text-gray-600 dark:text-gray-400">
                {event.location} • {event.date}
              </p>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-3">
        <h3 className="font-semibold text-sm mb-2">Opportunities</h3>
        <div className="space-y-2">
          {opportunities.map(opportunity => (
            <div
              key={opportunity.id}
              className="pb-2 border-b border-white/10 dark:border-white/5 last:border-0 last:pb-0 cursor-pointer hover:opacity-70 transition-opacity"
            >
              <h4 className="font-medium text-xs mb-1 line-clamp-1">
                {opportunity.title}
              </h4>
              <p className="text-[10px] text-gray-600 dark:text-gray-400">
                {opportunity.company} • {opportunity.salary}
              </p>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
