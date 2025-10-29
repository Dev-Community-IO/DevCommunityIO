import { ArrowLeft, Trophy, Calendar, Users, DollarSign, Clock, Award, ExternalLink, Share2, Bookmark, MapPin } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Badge } from './Badge';
import { Button } from './Button';
import { Avatar } from './Avatar';

interface HackathonDetailProps {
  id: string;
  onBack: () => void;
}

export function HackathonDetail({ id, onBack }: HackathonDetailProps) {
  const hackathon = {
    id: '1',
    title: 'Web3 Global Hackathon 2025',
    description: 'Join the largest Web3 hackathon of the year! Build the future of decentralized applications with cutting-edge blockchain technology. This is your chance to showcase your skills, collaborate with talented developers worldwide, and compete for amazing prizes.',
    organizer: 'Web3 Foundation',
    organizerLogo: 'https://api.dicebear.com/7.x/shapes/svg?seed=web3foundation',
    startDate: '2025-02-15',
    endDate: '2025-03-15',
    prize: '$100,000',
    participants: 2500,
    maxParticipants: 3000,
    category: 'Blockchain',
    difficulty: 'Advanced',
    status: 'upcoming',
    image: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1200',
    tags: ['Web3', 'DeFi', 'Smart Contracts', 'Solidity', 'Blockchain'],
    requirements: [
      'Experience with smart contract development',
      'Knowledge of Solidity or Rust',
      'Understanding of blockchain fundamentals',
      'Team of 2-5 members'
    ],
    prizes: [
      { place: '1st Place', amount: '$50,000', description: 'Grand prize winner' },
      { place: '2nd Place', amount: '$30,000', description: 'Runner-up' },
      { place: '3rd Place', amount: '$20,000', description: 'Third place' }
    ],
    judges: [
      { name: 'Sarah Chen', role: 'CTO at DeFi Labs', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah' },
      { name: 'Michael Rodriguez', role: 'Blockchain Architect', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=michael' },
      { name: 'Emily Johnson', role: 'Smart Contract Expert', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily' }
    ],
    tracks: [
      { name: 'DeFi Innovation', description: 'Build next-gen DeFi protocols' },
      { name: 'NFT Marketplace', description: 'Create innovative NFT platforms' },
      { name: 'DAO Tooling', description: 'Develop governance tools' }
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
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const daysUntilStart = getDaysUntil(hackathon.startDate);

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
              {hackathon.category}
            </Badge>
            <Badge variant="gradient" className="text-xs">
              <Trophy size={12} className="mr-1" />
              {hackathon.status === 'upcoming' ? 'Upcoming' : 'Live'}
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
            src={hackathon.image}
            alt={hackathon.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <h1 className="text-4xl font-bold text-white mb-3">{hackathon.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-white/90">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-white">
                  <img src={hackathon.organizerLogo} alt={hackathon.organizer} className="w-full h-full object-cover" />
                </div>
                <span className="font-medium">{hackathon.organizer}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar size={18} />
                <span>{formatDate(hackathon.startDate)} - {formatDate(hackathon.endDate)}</span>
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
            <h2 className="text-xl font-bold mb-4">About This Hackathon</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              {hackathon.description}
            </p>
            {hackathon.tags && hackathon.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {hackathon.tags.map(tag => {
                  const tagName = typeof tag === 'string' ? tag : (tag.name || tag.slug || '');
                  const tagKey = typeof tag === 'string' ? tag : (tag.id || tag.slug || tagName);
                  return (
                    <Badge key={tagKey} variant="secondary">#{tagName}</Badge>
                  );
                })}
              </div>
            )}
          </GlassCard>

          {/* Tracks */}
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold mb-4">Competition Tracks</h2>
            <div className="space-y-3">
              {hackathon.tracks.map((track, index) => (
                <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <h3 className="font-semibold mb-1">{track.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{track.description}</p>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Prize Breakdown */}
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold mb-4">Prize Distribution</h2>
            <div className="space-y-3">
              {hackathon.prizes.map((prize, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg">
                  <div>
                    <div className="font-bold text-lg">{prize.place}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{prize.description}</div>
                  </div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{prize.amount}</div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Judges */}
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold mb-4">Meet The Judges</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {hackathon.judges.map((judge, index) => (
                <div key={index} className="text-center">
                  <Avatar src={judge.avatar} alt={judge.name} size="lg" className="mx-auto mb-3 w-20 h-20" />
                  <h3 className="font-semibold">{judge.name}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{judge.role}</p>
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
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                {hackathon.prize}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">in total prizes</div>
            </div>
            <Button variant="primary" className="w-full mb-3">
              <Trophy size={18} className="mr-2" />
              Register Now
            </Button>
            <Button variant="secondary" className="w-full">
              <ExternalLink size={18} className="mr-2" />
              Visit Website
            </Button>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">Registered</span>
                <span className="font-semibold">{hackathon.participants} / {hackathon.maxParticipants}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                  style={{ width: `${(hackathon.participants / hackathon.maxParticipants) * 100}%` }}
                ></div>
              </div>
            </div>
          </GlassCard>

          {/* Requirements */}
          <GlassCard className="p-6">
            <h3 className="font-bold mb-3">Requirements</h3>
            <ul className="space-y-2">
              {hackathon.requirements.map((req, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </GlassCard>

          {/* Important Dates */}
          <GlassCard className="p-6">
            <h3 className="font-bold mb-3">Important Dates</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Calendar size={16} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-600 dark:text-gray-400">Start Date</div>
                  <div className="font-semibold text-sm">{formatDate(hackathon.startDate)}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Calendar size={16} className="text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-600 dark:text-gray-400">End Date</div>
                  <div className="font-semibold text-sm">{formatDate(hackathon.endDate)}</div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
