import { ArrowLeft, Briefcase, MapPin, DollarSign, Clock, Building, Share2, Bookmark, ExternalLink, CheckCircle, Zap, TrendingUp } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Badge } from './Badge';
import { Button } from './Button';

interface OpportunityDetailProps {
  id: string;
  onBack: () => void;
}

export function OpportunityDetail({ id, onBack }: OpportunityDetailProps) {
  const opportunity = {
    id: '1',
    title: 'Senior Smart Contract Engineer',
    company: 'DeFi Protocol',
    companyLogo: 'https://api.dicebear.com/7.x/shapes/svg?seed=defi',
    description: 'We are looking for an experienced Smart Contract Engineer to lead the development of next-generation DeFi protocols with a focus on security and scalability. Join our innovative team and help shape the future of decentralized finance.',
    fullDescription: `As a Senior Smart Contract Engineer at DeFi Protocol, you will be at the forefront of blockchain innovation. You'll design, develop, and audit smart contracts that power our cutting-edge DeFi platform, serving millions of users worldwide.

You'll work closely with our product, security, and research teams to implement complex financial primitives while maintaining the highest standards of code quality and security. This role offers the unique opportunity to work on challenging technical problems while contributing to the democratization of finance.`,
    location: 'Remote',
    type: 'full-time',
    category: 'Engineering',
    salary: '$150k - $200k',
    experience: '5+ years',
    posted: '2 days ago',
    remote: true,
    tags: ['Solidity', 'DeFi', 'Smart Contracts', 'Blockchain', 'Security'],
    responsibilities: [
      'Design and implement secure, gas-optimized smart contracts',
      'Lead technical architecture decisions for DeFi protocols',
      'Conduct code reviews and security audits',
      'Collaborate with cross-functional teams on protocol design',
      'Mentor junior engineers and contribute to best practices',
      'Research and implement new DeFi primitives and mechanisms'
    ],
    requirements: [
      '5+ years of software engineering experience',
      'Expert knowledge of Solidity and EVM internals',
      'Proven track record of deploying production smart contracts',
      'Deep understanding of DeFi protocols and mechanisms',
      'Experience with smart contract security and auditing',
      'Strong knowledge of Ethereum, gas optimization techniques'
    ],
    niceToHave: [
      'Experience with formal verification tools',
      'Contributions to open-source DeFi projects',
      'Knowledge of other blockchain platforms (Solana, Cosmos)',
      'Experience with MEV and transaction ordering',
      'Publications or talks on blockchain topics'
    ],
    benefits: [
      'Competitive salary with equity options',
      'Flexible remote work policy',
      'Health, dental, and vision insurance',
      'Unlimited PTO and flexible hours',
      'Annual learning & development budget',
      'Latest tech equipment of your choice',
      'Token grants and performance bonuses',
      'Quarterly team offsites in exciting locations'
    ],
    companyInfo: {
      size: '50-100 employees',
      founded: '2020',
      funding: 'Series B',
      industry: 'DeFi / Blockchain'
    },
    team: {
      description: 'Join a world-class team of engineers, researchers, and product leaders who are passionate about building the future of finance. Our team has collectively shipped products serving millions of users and billions in TVL.'
    }
  };

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
              {opportunity.category}
            </Badge>
            <Badge className={`text-xs capitalize ${getTypeBadge(opportunity.type)}`}>
              {opportunity.type}
            </Badge>
            {opportunity.remote && (
              <Badge variant="gradient" className="text-xs">
                <Zap size={12} className="mr-1" />
                Remote
              </Badge>
            )}
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

      {/* Company Header */}
      <GlassCard className="p-8">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex-shrink-0 border-2 border-gray-200 dark:border-gray-700">
            <img src={opportunity.companyLogo} alt={opportunity.company} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{opportunity.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-gray-700 dark:text-gray-300 mb-4">
              <div className="flex items-center gap-2 font-semibold text-lg">
                <Building size={20} className="text-blue-500" />
                {opportunity.company}
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-green-500" />
                {opportunity.location}
              </div>
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-orange-500" />
                Posted {opportunity.posted}
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {opportunity.description}
            </p>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">

          {/* Full Description */}
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold mb-4">About The Role</h2>
            <div className="text-gray-700 dark:text-gray-300 leading-relaxed space-y-4">
              {opportunity.fullDescription.split('\n\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {opportunity.tags.map(tag => (
                <Badge key={tag} variant="secondary">#{tag}</Badge>
              ))}
            </div>
          </GlassCard>

          {/* Responsibilities */}
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold mb-4">Responsibilities</h2>
            <ul className="space-y-3">
              {opportunity.responsibilities.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-blue-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">{item}</span>
                </li>
              ))}
            </ul>
          </GlassCard>

          {/* Requirements */}
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold mb-4">Requirements</h2>
            <ul className="space-y-3">
              {opportunity.requirements.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">{item}</span>
                </li>
              ))}
            </ul>
          </GlassCard>

          {/* Nice to Have */}
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold mb-4">Nice to Have</h2>
            <ul className="space-y-3">
              {opportunity.niceToHave.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-purple-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">{item}</span>
                </li>
              ))}
            </ul>
          </GlassCard>

          {/* Benefits */}
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold mb-4">Benefits & Perks</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {opportunity.benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg">
                  <CheckCircle size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{benefit}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* About Company */}
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold mb-4">About {opportunity.company}</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              {opportunity.team.description}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="font-bold text-lg">{opportunity.companyInfo.size}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Team Size</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="font-bold text-lg">{opportunity.companyInfo.founded}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Founded</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="font-bold text-lg">{opportunity.companyInfo.funding}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Funding</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="font-bold text-lg">DeFi</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Industry</div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Apply Card */}
          <GlassCard className="p-6 sticky top-24">
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                {opportunity.salary}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">annual salary</div>
            </div>
            <Button variant="primary" className="w-full mb-3">
              <Briefcase size={18} className="mr-2" />
              Apply Now
            </Button>
            <Button variant="secondary" className="w-full">
              <ExternalLink size={18} className="mr-2" />
              Company Website
            </Button>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-center text-gray-600 dark:text-gray-400">
                Posted {opportunity.posted}
              </p>
            </div>
          </GlassCard>

          {/* Job Details */}
          <GlassCard className="p-6">
            <h3 className="font-bold mb-3">Job Details</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">Location</span>
                <span className="font-semibold text-sm">{opportunity.location}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">Job Type</span>
                <span className="font-semibold text-sm capitalize">{opportunity.type}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">Experience</span>
                <span className="font-semibold text-sm">{opportunity.experience}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Remote</span>
                <span className="font-semibold text-sm">{opportunity.remote ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </GlassCard>

          {/* Skills */}
          <GlassCard className="p-6">
            <h3 className="font-bold mb-3">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {opportunity.tags.map((tag, index) => (
                <Badge key={index} variant="primary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </GlassCard>

          {/* Share */}
          <GlassCard className="p-6">
            <h3 className="font-bold mb-3">Share This Job</h3>
            <div className="flex gap-2">
              <button className="flex-1 p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all">
                <Share2 size={18} className="mx-auto" />
              </button>
              <button className="flex-1 p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-all">
                <ExternalLink size={18} className="mx-auto" />
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
