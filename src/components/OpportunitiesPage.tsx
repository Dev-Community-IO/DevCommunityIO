import { Briefcase, MapPin, DollarSign, Clock, ArrowLeft, Search, Filter, ExternalLink, Building, TrendingUp, Star, Zap } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Badge } from './Badge';
import { Button } from './Button';
import { useState } from 'react';

interface OpportunitiesPageProps {
  onBack?: () => void;
}

interface Opportunity {
  id: string;
  title: string;
  company: string;
  description: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  category: string;
  salary: string;
  experience: string;
  posted: string;
  logo: string;
  tags: string[];
  featured?: boolean;
  remote: boolean;
}

export function OpportunitiesPage({ onBack }: OpportunitiesPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const opportunities: Opportunity[] = [
    {
      id: '1',
      title: 'Senior Smart Contract Engineer',
      company: 'DeFi Protocol',
      description: 'Lead the development of next-generation DeFi protocols with focus on security and scalability',
      location: 'Remote',
      type: 'full-time',
      category: 'Engineering',
      salary: '$150k - $200k',
      experience: '5+ years',
      posted: '2 days ago',
      logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=defi',
      tags: ['Solidity', 'DeFi', 'Smart Contracts'],
      featured: true,
      remote: true
    },
    {
      id: '2',
      title: 'Blockchain Product Manager',
      company: 'Web3 Ventures',
      description: 'Drive product strategy and roadmap for innovative Web3 consumer applications',
      location: 'San Francisco, CA',
      type: 'full-time',
      category: 'Product',
      salary: '$140k - $180k',
      experience: '4+ years',
      posted: '1 day ago',
      logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=web3',
      tags: ['Product', 'Web3', 'Strategy'],
      featured: true,
      remote: false
    },
    {
      id: '3',
      title: 'NFT Marketplace Developer',
      company: 'Digital Art Studios',
      description: 'Build scalable NFT marketplace features and integrate with major blockchain networks',
      location: 'Remote',
      type: 'contract',
      category: 'Engineering',
      salary: '$100 - $150/hr',
      experience: '3+ years',
      posted: '3 days ago',
      logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=nft',
      tags: ['NFT', 'React', 'Blockchain'],
      featured: false,
      remote: true
    },
    {
      id: '4',
      title: 'Community Manager',
      company: 'DAO Collective',
      description: 'Engage and grow our vibrant Web3 community across multiple channels',
      location: 'Remote',
      type: 'full-time',
      category: 'Community',
      salary: '$70k - $90k',
      experience: '2+ years',
      posted: '5 days ago',
      logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=dao',
      tags: ['Community', 'DAO', 'Social'],
      featured: false,
      remote: true
    },
    {
      id: '5',
      title: 'Security Researcher',
      company: 'Audit Labs',
      description: 'Conduct security audits and vulnerability assessments for smart contracts',
      location: 'New York, NY',
      type: 'full-time',
      category: 'Security',
      salary: '$130k - $170k',
      experience: '4+ years',
      posted: '1 week ago',
      logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=security',
      tags: ['Security', 'Audit', 'Solidity'],
      featured: true,
      remote: false
    },
    {
      id: '6',
      title: 'Web3 Marketing Lead',
      company: 'Crypto Exchange',
      description: 'Lead marketing initiatives and brand strategy for growing cryptocurrency platform',
      location: 'Remote',
      type: 'full-time',
      category: 'Marketing',
      salary: '$110k - $140k',
      experience: '3+ years',
      posted: '4 days ago',
      logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=crypto',
      tags: ['Marketing', 'Crypto', 'Growth'],
      featured: false,
      remote: true
    },
    {
      id: '7',
      title: 'Blockchain Research Intern',
      company: 'Tech University Lab',
      description: 'Research emerging blockchain technologies and contribute to academic publications',
      location: 'Boston, MA',
      type: 'internship',
      category: 'Research',
      salary: '$30/hr',
      experience: 'Student',
      posted: '1 week ago',
      logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=research',
      tags: ['Research', 'Academic', 'Blockchain'],
      featured: false,
      remote: false
    },
    {
      id: '8',
      title: 'Full Stack Web3 Developer',
      company: 'Startup DAO',
      description: 'Build end-to-end decentralized applications with modern tech stack',
      location: 'Remote',
      type: 'full-time',
      category: 'Engineering',
      salary: '$120k - $160k',
      experience: '3+ years',
      posted: '2 days ago',
      logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=startup',
      tags: ['Full Stack', 'React', 'Web3'],
      featured: false,
      remote: true
    },
    {
      id: '9',
      title: 'Tokenomics Designer',
      company: 'Game Studio',
      description: 'Design sustainable token economics for play-to-earn gaming ecosystem',
      location: 'Remote',
      type: 'contract',
      category: 'Design',
      salary: '$90 - $120/hr',
      experience: '3+ years',
      posted: '6 days ago',
      logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=game',
      tags: ['Tokenomics', 'Gaming', 'Economics'],
      featured: false,
      remote: true
    },
    {
      id: '10',
      title: 'DevRel Engineer',
      company: 'Blockchain Platform',
      description: 'Build developer tools, documentation, and foster developer community',
      location: 'Austin, TX',
      type: 'full-time',
      category: 'DevRel',
      salary: '$110k - $150k',
      experience: '3+ years',
      posted: '3 days ago',
      logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=platform',
      tags: ['DevRel', 'Community', 'Documentation'],
      featured: true,
      remote: false
    }
  ];

  const categories = ['all', ...Array.from(new Set(opportunities.map(o => o.category)))];

  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch = opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         opp.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         opp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         opp.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = selectedFilter === 'all' || opp.category === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const getTypeBadge = (type: string) => {
    const styles = {
      'full-time': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      'part-time': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      'contract': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
      'internship': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
    };
    return styles[type as keyof typeof styles] || styles['full-time'];
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
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg shadow-md">
              <Briefcase size={24} className="text-white" strokeWidth={2.5} />
            </div>
            Opportunities
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Find your next career opportunity in Web3
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
              placeholder="Search opportunities..."
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

      {/* Featured Opportunities */}
      {filteredOpportunities.filter(o => o.featured).length > 0 && selectedFilter === 'all' && !searchQuery && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Star size={20} className="text-yellow-500" />
            <h2 className="text-lg font-bold">Featured Opportunities</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredOpportunities.filter(o => o.featured).map(opp => (
              <GlassCard key={opp.id} className="p-4 hover:shadow-xl transition-all duration-300 group">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex-shrink-0 border border-gray-200 dark:border-gray-700">
                    <img
                      src={opp.logo}
                      alt={opp.company}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold group-hover:text-blue-500 transition-colors line-clamp-1">
                          {opp.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{opp.company}</span>
                          {opp.remote && (
                            <Badge variant="secondary" className="text-[9px] px-1.5 py-0.5">
                              <Zap size={8} className="inline mr-0.5" />
                              Remote
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Badge variant="gradient" className="text-[10px] px-2 py-1 flex-shrink-0">
                        <Star size={10} className="inline mr-1" />
                        Featured
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                      {opp.description}
                    </p>
                    <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <MapPin size={14} className="text-blue-500" />
                        <span className="truncate">{opp.location}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <DollarSign size={14} className="text-green-500" />
                        <span className="font-semibold">{opp.salary}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <Building size={14} className="text-purple-500" />
                        <span className={`capitalize ${getTypeBadge(opp.type)} px-2 py-0.5 rounded text-[10px] font-semibold`}>
                          {opp.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <Clock size={14} className="text-orange-500" />
                        <span>{opp.posted}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {opp.tags.map(tag => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <Button variant="primary" className="w-full text-sm py-2">
                      <ExternalLink size={14} className="mr-2" />
                      Apply Now
                    </Button>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* All Opportunities */}
      <div>
        {filteredOpportunities.filter(o => o.featured).length > 0 && selectedFilter === 'all' && !searchQuery && (
          <h2 className="text-lg font-bold mb-3">All Opportunities</h2>
        )}
        <div className="space-y-3">
          {filteredOpportunities.filter(o => selectedFilter !== 'all' || searchQuery || !o.featured).map(opp => (
            <GlassCard key={opp.id} className="p-4 hover:shadow-lg transition-all duration-300 group">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex-shrink-0 border border-gray-200 dark:border-gray-700">
                  <img
                    src={opp.logo}
                    alt={opp.company}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold group-hover:text-blue-500 transition-colors line-clamp-1">
                        {opp.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{opp.company}</span>
                        {opp.remote && (
                          <Badge variant="secondary" className="text-[8px] px-1.5 py-0.5">
                            Remote
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-[9px] px-2 py-0.5 flex-shrink-0">
                      {opp.category}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-gray-600 dark:text-gray-400 line-clamp-1 mb-2">
                    {opp.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-[10px] text-gray-600 dark:text-gray-400 mb-2">
                    <div className="flex items-center gap-1">
                      <MapPin size={12} className="text-blue-500" />
                      <span>{opp.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign size={12} className="text-green-500" />
                      <span className="font-semibold">{opp.salary}</span>
                    </div>
                    <div className={`capitalize ${getTypeBadge(opp.type)} px-2 py-0.5 rounded font-semibold`}>
                      {opp.type}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={12} className="text-orange-500" />
                      <span>{opp.posted}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {opp.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-[9px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <Button variant="primary" className="text-xs py-1 px-3 ml-2">
                      Apply
                    </Button>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {filteredOpportunities.length === 0 && (
        <div className="text-center py-12">
          <Briefcase size={48} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No opportunities found matching your search</p>
        </div>
      )}
    </div>
  );
}
