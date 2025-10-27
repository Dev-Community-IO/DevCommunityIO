import { Trophy, Calendar, Users, DollarSign, Clock, MapPin, ArrowLeft, Search, Filter, ExternalLink, Award, Star } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Badge } from './Badge';
import { Button } from './Button';
import { useState } from 'react';

interface HackathonsPageProps {
  onBack?: () => void;
}

interface Hackathon {
  id: string;
  title: string;
  description: string;
  organizer: string;
  startDate: string;
  endDate: string;
  prize: string;
  participants: number;
  category: string;
  difficulty: string;
  status: 'upcoming' | 'ongoing' | 'ended';
  image: string;
  tags: string[];
  featured?: boolean;
}

export function HackathonsPage({ onBack }: HackathonsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const hackathons: Hackathon[] = [
    {
      id: '1',
      title: 'Web3 Global Hackathon 2025',
      description: 'Build the future of decentralized applications with cutting-edge blockchain technology',
      organizer: 'Web3 Foundation',
      startDate: '2025-02-15',
      endDate: '2025-03-15',
      prize: '$100,000',
      participants: 2500,
      category: 'Blockchain',
      difficulty: 'Advanced',
      status: 'upcoming',
      image: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=800',
      tags: ['Web3', 'DeFi', 'Smart Contracts'],
      featured: true
    },
    {
      id: '2',
      title: 'NFT Art Challenge',
      description: 'Create innovative NFT collections and revolutionize digital art',
      organizer: 'NFT Alliance',
      startDate: '2025-01-20',
      endDate: '2025-02-20',
      prize: '$50,000',
      participants: 1800,
      category: 'NFT',
      difficulty: 'Intermediate',
      status: 'ongoing',
      image: 'https://images.pexels.com/photos/6954174/pexels-photo-6954174.jpeg?auto=compress&cs=tinysrgb&w=800',
      tags: ['NFT', 'Art', 'Metaverse'],
      featured: true
    },
    {
      id: '3',
      title: 'DeFi Protocol Innovation',
      description: 'Design next-generation DeFi protocols for financial inclusion',
      organizer: 'DeFi Labs',
      startDate: '2025-03-01',
      endDate: '2025-04-01',
      prize: '$75,000',
      participants: 1200,
      category: 'DeFi',
      difficulty: 'Advanced',
      status: 'upcoming',
      image: 'https://images.pexels.com/photos/6771900/pexels-photo-6771900.jpeg?auto=compress&cs=tinysrgb&w=800',
      tags: ['DeFi', 'Finance', 'Protocol'],
      featured: false
    },
    {
      id: '4',
      title: 'DAO Governance Challenge',
      description: 'Build tools and systems for effective decentralized governance',
      organizer: 'DAO Collective',
      startDate: '2024-12-01',
      endDate: '2025-01-10',
      prize: '$40,000',
      participants: 950,
      category: 'DAO',
      difficulty: 'Intermediate',
      status: 'ended',
      image: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=800',
      tags: ['DAO', 'Governance', 'Voting'],
      featured: false
    },
    {
      id: '5',
      title: 'Smart Contract Security Sprint',
      description: 'Develop security tools and audit frameworks for smart contracts',
      organizer: 'Security Alliance',
      startDate: '2025-02-01',
      endDate: '2025-02-28',
      prize: '$60,000',
      participants: 1500,
      category: 'Security',
      difficulty: 'Advanced',
      status: 'upcoming',
      image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
      tags: ['Security', 'Audit', 'Solidity'],
      featured: true
    },
    {
      id: '6',
      title: 'Blockchain Gaming Jam',
      description: 'Create engaging blockchain-based games and GameFi experiences',
      organizer: 'GameFi Studios',
      startDate: '2025-01-25',
      endDate: '2025-02-25',
      prize: '$55,000',
      participants: 2100,
      category: 'Gaming',
      difficulty: 'Intermediate',
      status: 'ongoing',
      image: 'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=800',
      tags: ['Gaming', 'NFT', 'Metaverse'],
      featured: false
    }
  ];

  const categories = ['all', 'upcoming', 'ongoing', 'ended', ...Array.from(new Set(hackathons.map(h => h.category)))];

  const filteredHackathons = hackathons.filter(hackathon => {
    const matchesSearch = hackathon.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         hackathon.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         hackathon.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = selectedFilter === 'all' ||
                         hackathon.status === selectedFilter ||
                         hackathon.category === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      upcoming: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      ongoing: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      ended: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
    };
    return styles[status as keyof typeof styles] || styles.upcoming;
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      Beginner: 'from-green-500 to-emerald-500',
      Intermediate: 'from-yellow-500 to-orange-500',
      Advanced: 'from-red-500 to-pink-500'
    };
    return colors[difficulty as keyof typeof colors] || colors.Intermediate;
  };

  return (
    <div className="space-y-4">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-200 group"
          >
            <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
          </button>
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg shadow-md">
              <Trophy size={24} className="text-white" strokeWidth={2.5} />
            </div>
            Hackathons
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Compete, collaborate, and build amazing projects
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <GlassCard className="p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search hackathons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400 flex-shrink-0" />
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-4 py-2 bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all capitalize"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Featured Hackathons */}
      {filteredHackathons.filter(h => h.featured).length > 0 && selectedFilter === 'all' && !searchQuery && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Star size={20} className="text-yellow-500" />
            <h2 className="text-lg font-bold">Featured</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredHackathons.filter(h => h.featured).map(hackathon => (
              <GlassCard key={hackathon.id} className="p-0 overflow-hidden hover:shadow-xl transition-all duration-300 group">
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={hackathon.image}
                    alt={hackathon.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute top-3 right-3 flex gap-2">
                    <Badge variant="gradient" className="text-[10px] px-2 py-1">
                      <Award size={10} className="inline mr-1" />
                      Featured
                    </Badge>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <div className={`inline-block px-2 py-1 rounded-lg text-xs font-semibold ${getStatusBadge(hackathon.status)} capitalize`}>
                      {hackathon.status}
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-base font-bold group-hover:text-blue-500 transition-colors line-clamp-1">
                      {hackathon.title}
                    </h3>
                    <Badge variant="secondary" className="text-[10px] px-2 py-0.5 flex-shrink-0">
                      {hackathon.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                    {hackathon.description}
                  </p>
                  <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <DollarSign size={14} className="text-green-500" />
                      <span className="font-semibold">{hackathon.prize}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <Users size={14} className="text-blue-500" />
                      <span className="font-semibold">{hackathon.participants}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <Calendar size={14} className="text-purple-500" />
                      <span>{new Date(hackathon.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <Clock size={14} className="text-orange-500" />
                      <span>{hackathon.difficulty}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {hackathon.tags.map(tag => (
                      <span key={tag} className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <Button variant="primary" className="w-full text-sm py-2">
                    <ExternalLink size={14} className="mr-2" />
                    View Details
                  </Button>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* All Hackathons Grid */}
      <div>
        {filteredHackathons.filter(h => h.featured).length > 0 && selectedFilter === 'all' && !searchQuery && (
          <h2 className="text-lg font-bold mb-3">All Hackathons</h2>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHackathons.filter(h => selectedFilter !== 'all' || searchQuery || !h.featured).map(hackathon => (
            <GlassCard key={hackathon.id} className="p-0 overflow-hidden hover:shadow-lg transition-all duration-300 group">
              <div className="relative h-32 overflow-hidden">
                <img
                  src={hackathon.image}
                  alt={hackathon.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-2 left-2">
                  <div className={`inline-block px-2 py-0.5 rounded-lg text-[10px] font-semibold ${getStatusBadge(hackathon.status)} capitalize`}>
                    {hackathon.status}
                  </div>
                </div>
                <div className="absolute top-2 right-2">
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${getDifficultyColor(hackathon.difficulty)}`}></div>
                </div>
              </div>
              <div className="p-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-sm font-bold group-hover:text-blue-500 transition-colors line-clamp-1 flex-1">
                    {hackathon.title}
                  </h3>
                  <Badge variant="secondary" className="text-[9px] px-1.5 py-0.5 flex-shrink-0">
                    {hackathon.category}
                  </Badge>
                </div>
                <p className="text-[10px] text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                  {hackathon.description}
                </p>
                <div className="grid grid-cols-2 gap-1.5 mb-2 text-[10px]">
                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <DollarSign size={12} className="text-green-500" />
                    <span className="font-semibold">{hackathon.prize}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <Users size={12} className="text-blue-500" />
                    <span className="font-semibold">{hackathon.participants}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {hackathon.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-[9px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
                <Button variant="primary" className="w-full text-xs py-1.5">
                  View Details
                </Button>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {filteredHackathons.length === 0 && (
        <div className="text-center py-12">
          <Trophy size={48} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No hackathons found matching your search</p>
        </div>
      )}
    </div>
  );
}
