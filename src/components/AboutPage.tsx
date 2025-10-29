import { ArrowLeft, Users, Target, Heart, Rocket, Globe, Shield, Zap } from 'lucide-react';
import { GlassCard } from './GlassCard';
import ReactMarkdown from 'react-markdown';

interface AboutPageProps {
  onBack: () => void;
}

const aboutContent = `
# About DevCommunity

## 🌟 Who We Are

DevCommunity is a **decentralized platform** built by developers, for developers. We're creating a space where blockchain enthusiasts, Web3 builders, and tech innovators can connect, collaborate, and grow together.

Founded in 2024, we've grown from a small community of passionate developers to a thriving ecosystem of thousands of creators, learners, and innovators.

---

## 🎯 Our Mission

> "To democratize access to Web3 knowledge and create a transparent, community-driven platform where every voice matters."

We believe in:

- **🔓 Open Source First** - Transparency in everything we build
- **🤝 Community Governance** - Your voice shapes our direction
- **🌍 Global Accessibility** - Breaking down barriers to Web3 education
- **💡 Innovation** - Pushing the boundaries of what's possible
- **🛡️ Security & Privacy** - Protecting your data and identity

---

## 🚀 What We Offer

### For Developers
- **Technical Resources** - Tutorials, guides, and documentation
- **Code Collaboration** - Share projects and get feedback
- **Career Opportunities** - Job board and freelance gigs
- **Reputation System** - Build your on-chain portfolio

### For Companies
- **Talent Discovery** - Find skilled blockchain developers
- **Community Engagement** - Connect with your target audience
- **Event Hosting** - Organize hackathons and meetups
- **Brand Building** - Establish thought leadership

### For Learners
- **Learning Paths** - Structured courses from beginner to expert
- **Mentorship** - Connect with experienced developers
- **Hands-on Projects** - Real-world experience
- **Certifications** - Prove your skills with on-chain credentials

---

## 📊 By The Numbers

| Metric | Value |
|--------|-------|
| 👥 **Active Users** | 50,000+ |
| 📝 **Posts Created** | 150,000+ |
| 💬 **Comments & Replies** | 500,000+ |
| 🏆 **Hackathons Hosted** | 120+ |
| 💼 **Job Opportunities** | 2,500+ |
| 🌍 **Countries** | 150+ |

---

## 🛠️ Technology Stack

We're built on cutting-edge technology:

- **Blockchain**: Multi-chain support (Ethereum, Cardano, Polygon)
- **Backend**: Node.js + AdonisJS + PostgreSQL
- **Frontend**: React + TypeScript + Vite
- **Storage**: Decentralized (IPFS) + AWS S3
- **Authentication**: Web3 wallets + OAuth
- **Smart Contracts**: Solidity + Plutus

---

## 🌈 Our Values

### Transparency
Every decision, every update, every change - we share it all with our community.

### Inclusivity
We welcome developers of all backgrounds, skill levels, and experiences.

### Innovation
We're not afraid to experiment and try new approaches to old problems.

### Collaboration
Together we're stronger. We foster a culture of helping each other succeed.

### Sustainability
Building for the long term, not just quick wins.

---

## 🤝 Our Team

DevCommunity is powered by a diverse team of:

- **Core Developers** - 15+ engineers working full-time
- **Community Moderators** - 50+ volunteers keeping things civil
- **Advisory Board** - 10 blockchain industry veterans
- **Contributors** - 500+ open-source contributors

[Meet the Team →](/team)

---

## 🏆 Achievements & Recognition

- 🥇 **Best Developer Community Platform** - Web3 Awards 2024
- 🌟 **Top 10 Blockchain Projects** - TechCrunch Disrupt 2024
- 📈 **Fastest Growing Community** - Product Hunt 2024
- 🛡️ **Security Excellence Award** - OpenZeppelin 2024

---

## 🔮 Our Vision for the Future

We're just getting started. Here's what we're building:

### Q4 2024
- [ ] DAO governance implementation
- [ ] NFT reputation badges
- [ ] Mobile apps (iOS + Android)
- [ ] AI-powered code review

### 2025
- [ ] Multi-language support (20+ languages)
- [ ] DeFi integration for creator monetization
- [ ] Virtual hackathon spaces (metaverse)
- [ ] Cross-chain identity protocol

### 2026 and Beyond
- [ ] Fully decentralized infrastructure
- [ ] Self-governing community
- [ ] Global education initiative
- [ ] Developer DAO treasury

---

## 🌍 Join Our Community

We're more than just a platform - we're a movement.

- **Discord**: [discord.gg/devcommunity](https://discord.gg/devcommunity)
- **Twitter**: [@DevCommunity](https://twitter.com/devcommunity)
- **GitHub**: [github.com/devcommunity](https://github.com/devcommunity)
- **LinkedIn**: [linkedin.com/company/devcommunity](https://linkedin.com/company/devcommunity)
- **Telegram**: [t.me/devcommunity](https://t.me/devcommunity)

---

## 💌 Get In Touch

Have questions? Want to partner? Just want to say hi?

**Email**: [hello@devcommunity.io](mailto:hello@devcommunity.io)  
**Partnerships**: [partnerships@devcommunity.io](mailto:partnerships@devcommunity.io)  
**Press**: [press@devcommunity.io](mailto:press@devcommunity.io)  
**Support**: [support@devcommunity.io](mailto:support@devcommunity.io)

[Visit our Contact Page →](/contact)

---

## 🎉 Thank You

To every developer who's shared knowledge, every moderator who's kept our community safe, every contributor who's submitted a PR - **thank you**. 

You're the reason DevCommunity exists.

**Together, we're building the future of developer collaboration.** 🚀

---

*Last updated: October 28, 2025*  
*Version 2.0*
`;

export function AboutPage({ onBack }: AboutPageProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-200 group"
        >
          <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
        </button>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
            About DevCommunity
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Building the future of developer collaboration
          </p>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassCard className="p-4 text-center">
          <Users className="w-8 h-8 mx-auto mb-2 text-blue-500" />
          <div className="text-2xl font-bold">50K+</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Active Users</div>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <Target className="w-8 h-8 mx-auto mb-2 text-purple-500" />
          <div className="text-2xl font-bold">150K+</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Posts Created</div>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <Heart className="w-8 h-8 mx-auto mb-2 text-pink-500" />
          <div className="text-2xl font-bold">500K+</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Comments</div>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <Globe className="w-8 h-8 mx-auto mb-2 text-green-500" />
          <div className="text-2xl font-bold">150+</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Countries</div>
        </GlassCard>
      </div>

      {/* Content */}
      <GlassCard className="p-6 md:p-8">
        <div className="prose prose-slate dark:prose-invert max-w-none
          prose-headings:font-bold
          prose-h1:text-4xl prose-h1:mb-6 prose-h1:mt-8
          prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-8 prose-h2:text-blue-600 dark:prose-h2:text-blue-400
          prose-h3:text-xl prose-h3:mb-3 prose-h3:mt-6 prose-h3:text-purple-600 dark:prose-h3:text-purple-400
          prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed
          prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
          prose-strong:text-gray-900 dark:prose-strong:text-gray-100 prose-strong:font-semibold
          prose-ul:my-4 prose-li:my-1
          prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-300
          prose-code:text-pink-600 dark:prose-code:text-pink-400 prose-code:bg-pink-50 dark:prose-code:bg-pink-900/20 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
          prose-pre:bg-gray-900 prose-pre:text-gray-100
          prose-table:border prose-table:border-gray-300 dark:prose-table:border-gray-700
          prose-th:bg-gray-100 dark:prose-th:bg-gray-800 prose-th:p-2
          prose-td:p-2 prose-td:border prose-td:border-gray-300 dark:prose-td:border-gray-700
          prose-hr:border-gray-300 dark:prose-hr:border-gray-700 prose-hr:my-8
        ">
          <ReactMarkdown>{aboutContent}</ReactMarkdown>
        </div>
      </GlassCard>

      {/* CTA Footer */}
      <GlassCard className="p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-2 border-blue-500/20">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-2">Ready to Join Us?</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Be part of the largest Web3 developer community
          </p>
          <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105">
            Get Started Now
          </button>
        </div>
      </GlassCard>
    </div>
  );
}

