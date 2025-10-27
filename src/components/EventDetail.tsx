import { ArrowLeft, Calendar, MapPin, Users, Clock, Video, Ticket, Share2, Bookmark, ExternalLink, Star, CheckCircle } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Badge } from './Badge';
import { Button } from './Button';
import { Avatar } from './Avatar';

interface EventDetailProps {
  id: string;
  onBack: () => void;
}

export function EventDetail({ id, onBack }: EventDetailProps) {
  const event = {
    id: '1',
    title: 'Web3 Summit 2025',
    description: 'Join industry leaders, innovators, and developers from around the world for the premier Web3 conference of the year. Explore the latest developments in decentralized technologies, blockchain innovation, and the future of the internet.',
    organizer: 'Web3 Foundation',
    organizerLogo: 'https://api.dicebear.com/7.x/shapes/svg?seed=web3foundation',
    date: '2025-03-15',
    time: '09:00 AM',
    endTime: '06:00 PM',
    location: 'San Francisco, CA',
    venue: 'Moscone Center',
    type: 'hybrid',
    category: 'Conference',
    attendees: 1500,
    maxAttendees: 2000,
    price: '$299',
    image: 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=1200',
    tags: ['Web3', 'Blockchain', 'Innovation', 'Networking'],
    agenda: [
      { time: '09:00 AM', title: 'Registration & Networking', speaker: '' },
      { time: '10:00 AM', title: 'Opening Keynote: The Future of Web3', speaker: 'Dr. Sarah Chen' },
      { time: '11:30 AM', title: 'Panel: DeFi Innovation & Regulation', speaker: 'Multiple Speakers' },
      { time: '01:00 PM', title: 'Lunch & Networking', speaker: '' },
      { time: '02:30 PM', title: 'Workshop: Building Smart Contracts', speaker: 'Michael Rodriguez' },
      { time: '04:00 PM', title: 'Fireside Chat: NFTs & Digital Art', speaker: 'Emily Johnson' },
      { time: '05:30 PM', title: 'Closing Remarks & Reception', speaker: '' }
    ],
    speakers: [
      {
        name: 'Dr. Sarah Chen',
        role: 'CTO at DeFi Labs',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
        bio: 'Leading expert in blockchain architecture'
      },
      {
        name: 'Michael Rodriguez',
        role: 'Blockchain Architect',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=michael',
        bio: 'Smart contract security specialist'
      },
      {
        name: 'Emily Johnson',
        role: 'NFT Pioneer',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily',
        bio: 'Creator of top NFT marketplaces'
      }
    ],
    sponsors: [
      { name: 'Ethereum Foundation', logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=ethereum' },
      { name: 'Polygon', logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=polygon' },
      { name: 'Chainlink', logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=chainlink' }
    ],
    perks: [
      'Access to all sessions',
      'Networking opportunities',
      'Lunch & refreshments',
      'Conference swag bag',
      'Certificate of attendance'
    ]
  };

  const getDaysUntil = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  const daysUntil = getDaysUntil(event.date);

  const getTypeIcon = () => {
    switch (event.type) {
      case 'online':
        return <Video size={18} className="text-blue-500" />;
      case 'in-person':
        return <MapPin size={18} className="text-green-500" />;
      case 'hybrid':
        return <Users size={18} className="text-purple-500" />;
      default:
        return <Calendar size={18} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-200 group"
        >
          <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {event.category}
            </Badge>
            <Badge variant="gradient" className="text-xs capitalize">
              {getTypeIcon()}
              <span className="ml-1">{event.type}</span>
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-all">
            <Share2 size={20} />
          </button>
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-all">
            <Bookmark size={20} />
          </button>
        </div>
      </div>

      {/* Hero Image & Title */}
      <GlassCard className="p-0 overflow-hidden">
        <div className="relative h-80">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <h1 className="text-4xl font-bold text-white mb-3">{event.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-white/90">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-white">
                  <img src={event.organizerLogo} alt={event.organizer} className="w-full h-full object-cover" />
                </div>
                <span className="font-medium">{event.organizer}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar size={18} />
                <span>{formatDate(event.date)} • {event.time}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin size={18} />
                <span>{event.location}</span>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">

          {/* Description */}
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold mb-4">About This Event</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              {event.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {event.tags.map(tag => (
                <Badge key={tag} variant="secondary">#{tag}</Badge>
              ))}
            </div>
          </GlassCard>

          {/* Agenda */}
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold mb-4">Event Agenda</h2>
            <div className="space-y-3">
              {event.agenda.map((item, index) => (
                <div key={index} className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="font-bold text-sm text-purple-600 dark:text-purple-400">{item.time}</div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    {item.speaker && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">{item.speaker}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Speakers */}
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold mb-4">Featured Speakers</h2>
            <div className="space-y-4">
              {event.speakers.map((speaker, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <Avatar src={speaker.avatar} alt={speaker.name} size="lg" className="w-16 h-16 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{speaker.name}</h3>
                    <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">{speaker.role}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{speaker.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Sponsors */}
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold mb-4">Event Sponsors</h2>
            <div className="grid grid-cols-3 md:grid-cols-3 gap-4">
              {event.sponsors.map((sponsor, index) => (
                <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg flex items-center justify-center">
                  <img src={sponsor.logo} alt={sponsor.name} className="w-16 h-16 object-contain" />
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Registration */}
          <GlassCard className="p-6 sticky top-24">
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {event.price}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">per ticket</div>
            </div>
            <Button variant="primary" className="w-full mb-3">
              <Ticket size={18} className="mr-2" />
              Get Tickets
            </Button>
            <Button variant="secondary" className="w-full">
              <ExternalLink size={18} className="mr-2" />
              More Info
            </Button>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">Registered</span>
                <span className="font-semibold">{event.attendees} / {event.maxAttendees}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                  style={{ width: `${(event.attendees / event.maxAttendees) * 100}%` }}
                ></div>
              </div>
            </div>
          </GlassCard>

          {/* Event Details */}
          <GlassCard className="p-6">
            <h3 className="font-bold mb-3">Event Details</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex-shrink-0">
                  <Calendar size={16} className="text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-600 dark:text-gray-400">Date & Time</div>
                  <div className="font-semibold text-sm">{formatDate(event.date)}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{event.time} - {event.endTime}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg flex-shrink-0">
                  <MapPin size={16} className="text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-600 dark:text-gray-400">Location</div>
                  <div className="font-semibold text-sm">{event.venue}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{event.location}</div>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* What's Included */}
          <GlassCard className="p-6">
            <h3 className="font-bold mb-3">What's Included</h3>
            <ul className="space-y-2">
              {event.perks.map((perk, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{perk}</span>
                </li>
              ))}
            </ul>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
