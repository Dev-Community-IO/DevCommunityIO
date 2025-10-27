import { User, Post, Category } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    username: 'CryptoNinja',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CryptoNinja',
    walletAddress: '0x742d...35a8',
    reputation: 2450,
    isVerified: true
  },
  {
    id: '2',
    username: 'BlockchainDev',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=BlockchainDev',
    walletAddress: '0x893f...92c1',
    reputation: 3890,
    isVerified: true
  },
  {
    id: '3',
    username: 'DeFiQueen',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DeFiQueen',
    walletAddress: '0x451a...67d2',
    reputation: 5200,
    isVerified: false
  },
  {
    id: '4',
    username: 'NFTCollector',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NFTCollector',
    walletAddress: '0x129b...43e9',
    reputation: 1890,
    isVerified: false
  }
];

export const categories: Category[] = [
  { id: 'all', name: 'All Posts', icon: 'Layout', color: 'from-blue-500 to-cyan-500' },
  { id: 'defi', name: 'DeFi', icon: 'TrendingUp', color: 'from-green-500 to-emerald-500' },
  { id: 'nft', name: 'NFTs', icon: 'Image', color: 'from-pink-500 to-rose-500' },
  { id: 'dao', name: 'DAOs', icon: 'Users', color: 'from-purple-500 to-violet-500' },
  { id: 'dev', name: 'Development', icon: 'Code', color: 'from-orange-500 to-amber-500' },
  { id: 'news', name: 'News', icon: 'Newspaper', color: 'from-red-500 to-orange-500' }
];

export const mockPosts: Post[] = [
  {
    id: '1',
    author: mockUsers[0],
    title: 'Understanding Liquid Staking Derivatives: A Deep Dive',
    content: 'Liquid staking has revolutionized how we think about PoS networks. In this post, I want to discuss the implications of LSDs and their impact on DeFi composability...',
    category: 'defi',
    tags: ['staking', 'defi', 'ethereum'],
    upvotes: 245,
    downvotes: 12,
    commentCount: 48,
    timestamp: new Date(Date.now() - 3600000 * 2),
    hasUpvoted: false,
    hasDownvoted: false,
    coverImage: 'https://images.pexels.com/photos/8370752/pexels-photo-8370752.jpeg?auto=compress&cs=tinysrgb&w=1200',
    page: {
      id: 'web3dev',
      name: 'Web3 Developers Hub',
      logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=web3dev'
    }
  },
  {
    id: '2',
    author: mockUsers[1],
    title: 'Building a Smart Contract Auditing Checklist',
    content: 'After auditing 50+ contracts, here are the top security patterns every developer should implement. Thread 🧵',
    category: 'dev',
    tags: ['security', 'solidity', 'best-practices'],
    upvotes: 892,
    downvotes: 23,
    commentCount: 156,
    timestamp: new Date(Date.now() - 3600000 * 5),
    hasUpvoted: true,
    hasDownvoted: false,
    page: {
      id: 'updev',
      name: 'UPDEV',
      logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=updev'
    }
  },
  {
    id: '3',
    author: mockUsers[2],
    title: 'The Evolution of NFT Royalties: On-chain vs Off-chain',
    content: 'With marketplaces moving away from creator royalties, what does the future hold? Let\'s analyze different approaches and their trade-offs.',
    category: 'nft',
    tags: ['nft', 'royalties', 'marketplaces'],
    upvotes: 567,
    downvotes: 89,
    commentCount: 203,
    timestamp: new Date(Date.now() - 3600000 * 8),
    hasUpvoted: false,
    hasDownvoted: false,
    coverImage: 'https://images.pexels.com/photos/5980866/pexels-photo-5980866.jpeg?auto=compress&cs=tinysrgb&w=1200'
  },
  {
    id: '4',
    author: mockUsers[3],
    title: 'DAO Treasury Management: Strategies for Bear Markets',
    content: 'How should DAOs manage their treasuries during market downturns? Sharing insights from managing a $50M+ treasury.',
    category: 'dao',
    tags: ['dao', 'treasury', 'governance'],
    upvotes: 423,
    downvotes: 31,
    commentCount: 87,
    timestamp: new Date(Date.now() - 3600000 * 12),
    hasUpvoted: false,
    hasDownvoted: false,
    page: {
      id: 'daocommunity',
      name: 'DAO Community',
      logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=daocommunity'
    }
  },
  {
    id: '5',
    author: mockUsers[1],
    title: 'Major Protocol Hack: $20M Drained from Bridge',
    content: 'Breaking: Another cross-chain bridge has been exploited. Here\'s what we know so far and how to protect your funds.',
    category: 'news',
    tags: ['security', 'hack', 'bridge'],
    upvotes: 1203,
    downvotes: 45,
    commentCount: 312,
    timestamp: new Date(Date.now() - 3600000 * 1),
    hasUpvoted: false,
    hasDownvoted: false,
    coverImage: 'https://images.pexels.com/photos/6771985/pexels-photo-6771985.jpeg?auto=compress&cs=tinysrgb&w=1200'
  },
  {
    id: '6',
    author: mockUsers[0],
    title: 'Gas Optimization Techniques Every Solidity Dev Should Know',
    content: 'Save thousands in gas fees with these 10 optimization patterns. Includes code examples and benchmarks.',
    category: 'dev',
    tags: ['solidity', 'optimization', 'gas'],
    upvotes: 678,
    downvotes: 18,
    commentCount: 94,
    timestamp: new Date(Date.now() - 3600000 * 24),
    hasUpvoted: false,
    hasDownvoted: false
  }
];
