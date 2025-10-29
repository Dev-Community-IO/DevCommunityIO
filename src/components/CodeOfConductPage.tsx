import { ArrowLeft, Shield, Heart, Users, AlertTriangle, Ban, CheckCircle } from 'lucide-react';
import { GlassCard } from './GlassCard';
import ReactMarkdown from 'react-markdown';

interface CodeOfConductPageProps {
  onBack: () => void;
}

const conductContent = `
# Code of Conduct

## 🤝 Our Pledge

In the interest of fostering an open and welcoming environment, we as members, contributors, and leaders pledge to make participation in our community a harassment-free experience for everyone, regardless of:

- Age
- Body size
- Visible or invisible disability
- Ethnicity
- Sex characteristics
- Gender identity and expression
- Level of experience
- Education
- Socio-economic status
- Nationality
- Personal appearance
- Race
- Religion
- Sexual identity and orientation

We pledge to act and interact in ways that contribute to an open, welcoming, diverse, inclusive, and healthy community.

---

## 🎯 Our Standards

### ✅ Examples of Behavior That Contributes to a Positive Environment

- **Demonstrating empathy and kindness** toward other people
- **Being respectful** of differing opinions, viewpoints, and experiences
- **Giving and gracefully accepting constructive feedback**
- **Accepting responsibility** and apologizing to those affected by our mistakes, and learning from the experience
- **Focusing on what is best** not just for us as individuals, but for the overall community
- **Using welcoming and inclusive language**
- **Being patient** with beginners and helping them learn
- **Respecting privacy** and not sharing personal information without consent
- **Giving credit** where credit is due

### ❌ Examples of Unacceptable Behavior

- **Harassment of any kind**, including:
  - Offensive comments related to gender, gender identity, sexual orientation, disability, physical appearance, body size, race, religion
  - Deliberate intimidation, stalking, or following
  - Inappropriate physical contact or unwelcome sexual attention
  
- **Trolling, insulting, or derogatory comments**
- **Personal or political attacks**
- **Public or private harassment**
- **Publishing others' private information** without explicit permission
- **Spam, promotional content, or self-promotion** without prior approval
- **Impersonating other users or organizations**
- **Sharing false or misleading information**
- **Plagiarism or copyright infringement**
- **Vote manipulation** or gaming the reputation system
- **Creating multiple accounts** to evade bans or restrictions
- **Other conduct** which could reasonably be considered inappropriate in a professional setting

---

## 📜 Detailed Community Guidelines

### 1. **Be Respectful**

Treat everyone with respect. Healthy debate is encouraged, but personal attacks are not tolerated.

**DO:**
- "I disagree with this approach because..."
- "Have you considered..."
- "In my experience..."

**DON'T:**
- "You're stupid if you think..."
- "Only an idiot would..."
- "This is garbage and you should feel bad"

### 2. **Be Professional**

DevCommunity is a professional platform. Maintain professional standards in all interactions.

- Use appropriate language
- Provide constructive criticism
- Focus on technical merits
- Keep discussions on-topic

### 3. **Be Helpful**

We're here to help each other grow.

- Answer questions thoroughly
- Share knowledge generously
- Link to relevant resources
- Provide constructive feedback
- Mentor newcomers

### 4. **Be Inclusive**

Welcome people of all backgrounds and experience levels.

- Don't gatekeep or dismiss "simple" questions
- Avoid elitist language or assumptions
- Use inclusive terminology
- Respect pronouns and identities

### 5. **Respect Intellectual Property**

- Don't share copyrighted code without permission
- Give proper attribution for others' work
- Don't plagiarize content
- Respect licenses (MIT, GPL, etc.)

### 6. **No Spam or Self-Promotion**

- Don't post promotional content without approval
- Don't use the platform solely for marketing
- Contribute value, not just links to your products
- Avoid excessive cross-posting

### 7. **Protect Privacy**

- Don't share personal information about others
- Don't dox or expose private details
- Respect data privacy laws (GDPR, CCPA)
- Don't scrape user data

### 8. **No Gaming the System**

- Don't manipulate votes or reputation
- Don't create sock-puppet accounts
- Don't engage in coordinated voting
- Don't sell accounts or reputation

---

## 🛡️ Enforcement Responsibilities

Community leaders are responsible for clarifying and enforcing our standards of acceptable behavior and will take appropriate and fair corrective action in response to any behavior that they deem inappropriate, threatening, offensive, or harmful.

### Our Moderators Have the Right To:

- Remove, edit, or reject comments, posts, code, and other contributions
- Ban temporarily or permanently any contributor for behaviors deemed inappropriate
- Close or delete threads that violate the Code of Conduct
- Request edits or clarifications
- Issue warnings or suspensions

---

## 📊 Enforcement Guidelines

Community leaders will follow these Community Impact Guidelines:

### 1. 🟡 Warning (First Offense)

**Community Impact**: Use of inappropriate language or other unprofessional behavior.

**Consequence**: 
- Written warning
- Required acknowledgment
- No further action if corrected

**Examples:**
- Minor language violations
- Accidental inappropriate content
- Misunderstandings
- First-time minor infractions

### 2. 🟠 Temporary Ban (1-7 Days)

**Community Impact**: Violation through a single incident or series of minor actions.

**Consequence**:
- Temporary ban from community
- No interaction with people involved
- Violation of ban terms may lead to permanent ban

**Examples:**
- Continued inappropriate behavior after warning
- Minor harassment
- Spam posting
- Vote manipulation

### 3. 🔴 Permanent Ban (Serious Violations)

**Community Impact**: Serious violation of community standards, including sustained inappropriate behavior.

**Consequence**:
- Permanent ban from all community spaces
- No appeal unless reviewed by admin team
- Possible legal action for severe cases

**Examples:**
- Sexual harassment
- Doxxing or privacy violations
- Threats of violence
- Hate speech
- Sustained trolling or harassment
- Serious legal violations

---

## 📢 Reporting Violations

If you experience or witness unacceptable behavior, please report it:

### Reporting Methods:

1. **Report Button**: Click "Report" on any post/comment
2. **Email**: [moderation@devcommunity.io](mailto:moderation@devcommunity.io)
3. **Discord**: Contact moderators directly
4. **Emergency**: [security@devcommunity.io](mailto:security@devcommunity.io)

### What to Include in Your Report:

- Your contact information (optional, but helpful)
- Names of any individuals involved (screen names)
- Description of the incident
- Screenshots or evidence (if applicable)
- Any additional context

### What Happens After Reporting:

1. **Acknowledgment**: We'll respond within 24 hours
2. **Investigation**: We'll review the incident thoroughly
3. **Action**: Appropriate enforcement action will be taken
4. **Follow-up**: You'll be notified of the outcome (privacy permitting)

### Reporter Protection:

- All reports are kept confidential
- Reporters will not face retaliation
- False reports are treated seriously
- Anonymous reporting is accepted

---

## 🌐 Scope

This Code of Conduct applies to:

- All community spaces (platform, Discord, Twitter, etc.)
- Official events (hackathons, meetups, conferences)
- When representing the community publicly
- Private communications involving community members

This Code of Conduct applies both within project spaces and in public spaces when an individual is representing DevCommunity.

---

## 📚 Attribution

This Code of Conduct is adapted from:
- [Contributor Covenant v2.1](https://www.contributor-covenant.org/version/2/1/code_of_conduct.html)
- [Django Code of Conduct](https://www.djangoproject.com/conduct/)
- [Rust Code of Conduct](https://www.rust-lang.org/policies/code-of-conduct)

---

## 💬 Questions & Feedback

Have questions about the Code of Conduct?

- **Email**: [conduct@devcommunity.io](mailto:conduct@devcommunity.io)
- **Discord**: [Join #community-guidelines](https://discord.gg/devcommunity)
- **Forum**: [discuss.devcommunity.io/conduct](https://discuss.devcommunity.io/conduct)

---

## 📅 Version History

- **v2.0** (October 2025) - Expanded enforcement guidelines
- **v1.5** (June 2025) - Added reporting procedures
- **v1.0** (January 2024) - Initial release

---

## ✍️ Acknowledgments

Thank you to all community members who help maintain a positive, welcoming environment. Your contributions to our culture matter.

**Together, we build a better community.** 🚀

---

*Last updated: October 28, 2025*  
*Effective date: January 1, 2024*
`;

export function CodeOfConductPage({ onBack }: CodeOfConductPageProps) {
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
            Code of Conduct
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Our commitment to a safe and welcoming community
          </p>
        </div>
      </div>

      {/* Key Principles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard className="p-4 text-center">
          <Heart className="w-8 h-8 mx-auto mb-2 text-red-500" />
          <h3 className="font-semibold mb-1">Be Respectful</h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">Treat everyone with dignity and respect</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <Users className="w-8 h-8 mx-auto mb-2 text-blue-500" />
          <h3 className="font-semibold mb-1">Be Inclusive</h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">Welcome all backgrounds and experience levels</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <Shield className="w-8 h-8 mx-auto mb-2 text-green-500" />
          <h3 className="font-semibold mb-1">Be Professional</h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">Maintain professional standards always</p>
        </GlassCard>
      </div>

      {/* Enforcement Levels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard className="p-4 border-2 border-yellow-500/30">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-6 h-6 text-yellow-500" />
            <h3 className="font-semibold">Level 1: Warning</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">First offense, minor violations</p>
        </GlassCard>
        <GlassCard className="p-4 border-2 border-orange-500/30">
          <div className="flex items-center gap-2 mb-3">
            <Ban className="w-6 h-6 text-orange-500" />
            <h3 className="font-semibold">Level 2: Temp Ban</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">1-7 days, repeat violations</p>
        </GlassCard>
        <GlassCard className="p-4 border-2 border-red-500/30">
          <div className="flex items-center gap-2 mb-3">
            <Ban className="w-6 h-6 text-red-500" />
            <h3 className="font-semibold">Level 3: Permanent</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Serious violations only</p>
        </GlassCard>
      </div>

      {/* Main Content */}
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
          prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic
          prose-code:text-pink-600 dark:prose-code:text-pink-400 prose-code:bg-pink-50 dark:prose-code:bg-pink-900/20 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
          prose-hr:border-gray-300 dark:prose-hr:border-gray-700 prose-hr:my-8
        ">
          <ReactMarkdown>{conductContent}</ReactMarkdown>
        </div>
      </GlassCard>

      {/* Report CTA */}
      <GlassCard className="p-6 bg-gradient-to-r from-red-500/10 to-orange-500/10 border-2 border-red-500/20">
        <div className="flex items-center gap-4">
          <Shield className="w-12 h-12 text-red-500 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-1">Report a Violation</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
              If you experience or witness unacceptable behavior, please report it immediately.
            </p>
            <a href="mailto:moderation@devcommunity.io" className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all">
              <AlertTriangle size={18} />
              Report Now
            </a>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

