import { ArrowLeft, Lock, Eye, Shield, Database, Cookie, Globe, UserCheck } from 'lucide-react';
import { GlassCard } from './GlassCard';
import ReactMarkdown from 'react-markdown';

interface PrivacyPolicyPageProps {
  onBack: () => void;
}

const privacyContent = `
# Privacy Policy

**Effective Date:** January 1, 2024  
**Last Updated:** October 28, 2025

---

## 📜 Introduction

Welcome to DevCommunity ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.

**Please read this Privacy Policy carefully.** By using DevCommunity, you agree to the collection and use of information in accordance with this policy.

---

## 🔍 Information We Collect

### 1. **Information You Provide to Us**

#### Account Information
- **Email address** (optional for wallet-only users)
- **Username**
- **Profile information** (bio, avatar, cover image, location, website)
- **Social links** (Twitter, LinkedIn, GitHub, Telegram)
- **Skills and interests**

#### Content You Create
- **Posts and articles**
- **Comments and replies**
- **Pages you create or manage**
- **Messages and communications**
- **Votes and reactions**
- **Bookmarks and saved content**

#### Authentication Data
- **Wallet addresses** (Ethereum, Cardano, etc.)
- **OAuth tokens** (Google, GitHub)
- **Authentication signatures**
- **Session information**

### 2. **Information Automatically Collected**

#### Device Information
- **IP address**
- **Browser type and version**
- **Device type** (desktop, mobile, tablet)
- **Operating system**
- **Screen resolution**

#### Usage Data
- **Pages viewed**
- **Time spent on pages**
- **Click patterns**
- **Search queries**
- **Interaction with features**
- **Referral sources**

#### Technical Data
- **Cookies and similar technologies**
- **Log files**
- **Error reports**
- **Performance metrics**

### 3. **Information from Third Parties**

- **OAuth providers** (Google, GitHub)
- **Blockchain networks** (for wallet verification)
- **Social media platforms** (when you link accounts)
- **Analytics providers**

---

## 🎯 How We Use Your Information

### Primary Purposes

1. **Provide and Maintain Services**
   - Create and manage your account
   - Enable platform features
   - Process transactions
   - Provide customer support

2. **Personalization**
   - Customize your feed
   - Recommend relevant content
   - Suggest connections
   - Tailor notifications

3. **Communication**
   - Send service updates
   - Respond to inquiries
   - Send newsletters (with consent)
   - Notify about platform changes

4. **Security and Safety**
   - Prevent fraud and abuse
   - Enforce our terms
   - Detect and prevent spam
   - Protect user safety

5. **Analytics and Improvement**
   - Analyze usage patterns
   - Improve platform performance
   - Develop new features
   - Conduct research

6. **Legal Compliance**
   - Comply with laws and regulations
   - Respond to legal requests
   - Protect our legal rights
   - Enforce our policies

### Marketing and Promotional Uses
- Send marketing communications (with consent)
- Promote events and hackathons
- Announce new features
- Share community highlights

*You can opt out of marketing emails at any time.*

---

## 🔐 How We Store and Protect Your Data

### Data Storage

- **Primary Database**: PostgreSQL (encrypted at rest)
- **File Storage**: AWS S3 (encrypted)
- **Cache**: Redis (temporary data only)
- **Backups**: Encrypted daily backups
- **Location**: Primarily US-based servers (AWS)

### Security Measures

| Measure | Implementation |
|---------|----------------|
| **Encryption** | TLS 1.3 for data in transit, AES-256 for data at rest |
| **Authentication** | Multi-factor authentication support |
| **Access Control** | Role-based access controls (RBAC) |
| **Monitoring** | 24/7 security monitoring |
| **Audits** | Regular security audits |
| **Compliance** | SOC 2 Type II, GDPR, CCPA |

### Data Retention

- **Account Data**: Retained while account is active
- **Content**: Retained until deletion by user
- **Logs**: 90 days
- **Analytics**: Aggregated data retained indefinitely
- **Deleted Data**: Purged within 30 days

---

## 🌐 How We Share Your Information

We **DO NOT sell your personal data**. We may share information in these limited circumstances:

### 1. **With Your Consent**
- When you explicitly agree to share information
- When you make content public
- When you connect third-party services

### 2. **Service Providers**
We share data with trusted service providers who help us operate the platform:
- **AWS** (hosting and storage)
- **SendGrid** (email delivery)
- **Stripe** (payment processing - future feature)
- **Google Analytics** (analytics)
- **Sentry** (error tracking)

### 3. **Legal Requirements**
- To comply with laws and regulations
- To respond to legal requests (subpoenas, court orders)
- To protect our rights and safety
- To prevent fraud or security threats

### 4. **Business Transfers**
- In the event of merger, acquisition, or sale
- Assets may be transferred to successor entity

### 5. **Public Information**
Information you choose to make public:
- Profile information
- Posts and comments
- Public pages
- Reputation score

---

## 🍪 Cookies and Tracking Technologies

### What We Use

1. **Essential Cookies** (Required)
   - Authentication and sessions
   - Security features
   - Load balancing

2. **Analytics Cookies** (Optional)
   - Google Analytics
   - Usage statistics
   - Performance monitoring

3. **Preference Cookies** (Optional)
   - Theme settings
   - Language preferences
   - UI customizations

4. **Marketing Cookies** (Optional)
   - Campaign tracking
   - Ad personalization (if applicable)

### Your Cookie Choices

You can control cookies through:
- Browser settings
- Our cookie consent banner
- Opt-out tools
- Do Not Track signals (we honor DNT)

---

## 🌍 International Data Transfers

DevCommunity operates globally. Your data may be transferred to and processed in:
- **United States** (primary)
- **European Union** (for EU users)
- **Other regions** as needed

We ensure appropriate safeguards through:
- Standard Contractual Clauses (SCCs)
- Privacy Shield certification (where applicable)
- GDPR compliance measures

---

## 👤 Your Privacy Rights

### 🇪🇺 EU/UK Users (GDPR)

You have the right to:
- **Access** your personal data
- **Rectify** inaccurate data
- **Erase** your data ("right to be forgotten")
- **Restrict** processing
- **Data portability** (download your data)
- **Object** to processing
- **Withdraw consent** at any time
- **Lodge a complaint** with supervisory authority

### 🇺🇸 California Users (CCPA)

You have the right to:
- **Know** what data we collect
- **Delete** your data
- **Opt-out** of sale (we don't sell data)
- **Non-discrimination** for exercising rights

### 🌐 All Users

Regardless of location, you can:
- **Update** your profile information
- **Delete** your account
- **Download** your data
- **Opt-out** of marketing emails
- **Control** privacy settings

---

## 🔧 How to Exercise Your Rights

### Self-Service Options

1. **Account Settings**: Update profile, privacy settings
2. **Download Data**: Export all your data (Settings > Privacy > Download)
3. **Delete Account**: Settings > Account > Delete Account

### Contact Us

For data requests or questions:
- **Email**: [privacy@devcommunity.io](mailto:privacy@devcommunity.io)
- **Form**: [devcommunity.io/privacy-request](https://devcommunity.io/privacy-request)
- **Response Time**: 30 days maximum

### Data Request Process

1. Submit request via email or form
2. Verify identity
3. We process within 30 days
4. Receive confirmation

---

## 👶 Children's Privacy

DevCommunity is **not intended for children under 13** (or 16 in the EU). We do not knowingly collect data from children.

If we learn we've collected data from a child:
- We'll delete it immediately
- We'll notify parents (if possible)
- We'll take steps to prevent future collection

If you believe a child has provided us data, contact: [privacy@devcommunity.io](mailto:privacy@devcommunity.io)

---

## 🔗 Third-Party Links

Our platform may contain links to third-party websites. We are **not responsible** for:
- Privacy practices of external sites
- Content on external sites
- Data collection by external sites

We encourage you to review privacy policies of any site you visit.

---

## 🔔 Changes to This Privacy Policy

We may update this Privacy Policy from time to time. We will notify you of changes by:
- **Email notification** (for material changes)
- **Platform notification**
- **Updating the "Last Updated" date**
- **Posting on our blog**

Continued use after changes constitutes acceptance.

---

## 📊 Data Processing Agreement (DPA)

For enterprise customers and partners, we offer a Data Processing Agreement:
- **GDPR-compliant DPA**
- **Subprocessor disclosure**
- **Data transfer mechanisms**
- **Security commitments**

Contact: [legal@devcommunity.io](mailto:legal@devcommunity.io)

---

## 🛡️ Security Incidents

If we experience a data breach affecting your data:
- **Notification**: Within 72 hours
- **Details**: What data was affected
- **Actions**: Steps we're taking
- **Your Steps**: Recommended actions for you

Report security vulnerabilities: [security@devcommunity.io](mailto:security@devcommunity.io)

---

## 📧 Contact Us

### Privacy Questions

**Data Protection Officer (DPO)**  
Email: [dpo@devcommunity.io](mailto:dpo@devcommunity.io)

**Privacy Team**  
Email: [privacy@devcommunity.io](mailto:privacy@devcommunity.io)

**Mailing Address:**  
DevCommunity, Inc.  
Attn: Privacy Department  
123 Innovation Drive, Suite 456  
San Francisco, CA 94103  
United States

### EU Representative

For EU users:  
DevCommunity EU Representative  
[eu-privacy@devcommunity.io](mailto:eu-privacy@devcommunity.io)

---

## 📚 Additional Resources

- **Cookie Policy**: [devcommunity.io/cookies](https://devcommunity.io/cookies)
- **Terms of Service**: [devcommunity.io/terms](https://devcommunity.io/terms)
- **Security**: [devcommunity.io/security](https://devcommunity.io/security)
- **Transparency Report**: [devcommunity.io/transparency](https://devcommunity.io/transparency)

---

## ✅ Compliance & Certifications

- ✅ **GDPR** (General Data Protection Regulation)
- ✅ **CCPA** (California Consumer Privacy Act)
- ✅ **SOC 2 Type II** (Security audit)
- ✅ **ISO 27001** (Information security)
- ✅ **Privacy Shield** (EU-US data transfers)

---

*This Privacy Policy was last updated on October 28, 2025.*  
*Version 2.0*
`;

export function PrivacyPolicyPage({ onBack }: PrivacyPolicyPageProps) {
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 dark:from-green-400 dark:to-blue-400 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            How we collect, use, and protect your information
          </p>
        </div>
      </div>

      {/* Key Points */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard className="p-4 text-center">
          <Lock className="w-8 h-8 mx-auto mb-2 text-green-500" />
          <h3 className="font-semibold text-sm mb-1">Encrypted</h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">AES-256 encryption</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <Eye className="w-8 h-8 mx-auto mb-2 text-blue-500" />
          <h3 className="font-semibold text-sm mb-1">Transparent</h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">Clear data practices</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <Shield className="w-8 h-8 mx-auto mb-2 text-purple-500" />
          <h3 className="font-semibold text-sm mb-1">Compliant</h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">GDPR & CCPA</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <UserCheck className="w-8 h-8 mx-auto mb-2 text-orange-500" />
          <h3 className="font-semibold text-sm mb-1">Your Control</h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">You own your data</p>
        </GlassCard>
      </div>

      {/* Main Content */}
      <GlassCard className="p-6 md:p-8">
        <div className="prose prose-slate dark:prose-invert max-w-none
          prose-headings:font-bold
          prose-h1:text-4xl prose-h1:mb-6 prose-h1:mt-8
          prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-8 prose-h2:text-green-600 dark:prose-h2:text-green-400
          prose-h3:text-xl prose-h3:mb-3 prose-h3:mt-6 prose-h3:text-blue-600 dark:prose-h3:text-blue-400
          prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed
          prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
          prose-strong:text-gray-900 dark:prose-strong:text-gray-100 prose-strong:font-semibold
          prose-ul:my-4 prose-li:my-1
          prose-table:border prose-table:border-gray-300 dark:prose-table:border-gray-700
          prose-th:bg-gray-100 dark:prose-th:bg-gray-800 prose-th:p-2
          prose-td:p-2 prose-td:border prose-td:border-gray-300 dark:prose-td:border-gray-700
          prose-hr:border-gray-300 dark:prose-hr:border-gray-700 prose-hr:my-8
        ">
          <ReactMarkdown>{privacyContent}</ReactMarkdown>
        </div>
      </GlassCard>

      {/* Privacy Tools */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard className="p-6 hover:shadow-lg transition-all">
          <Database className="w-10 h-10 text-blue-500 mb-3" />
          <h3 className="font-bold mb-2">Download Your Data</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Export all your information in JSON format
          </p>
          <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            Request Export →
          </button>
        </GlassCard>

        <GlassCard className="p-6 hover:shadow-lg transition-all">
          <Cookie className="w-10 h-10 text-purple-500 mb-3" />
          <h3 className="font-bold mb-2">Cookie Preferences</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Manage your cookie and tracking settings
          </p>
          <button className="text-sm text-purple-600 dark:text-purple-400 hover:underline">
            Manage Cookies →
          </button>
        </GlassCard>

        <GlassCard className="p-6 hover:shadow-lg transition-all">
          <Globe className="w-10 h-10 text-green-500 mb-3" />
          <h3 className="font-bold mb-2">Privacy Settings</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Control who can see your information
          </p>
          <button className="text-sm text-green-600 dark:text-green-400 hover:underline">
            Update Settings →
          </button>
        </GlassCard>
      </div>

      {/* Contact CTA */}
      <GlassCard className="p-6 bg-gradient-to-r from-green-500/10 to-blue-500/10 border-2 border-green-500/20">
        <div className="text-center">
          <Lock className="w-12 h-12 mx-auto mb-3 text-green-500" />
          <h3 className="text-2xl font-bold mb-2">Have Privacy Questions?</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Our Data Protection Officer is here to help
          </p>
          <a href="mailto:privacy@devcommunity.io" className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all">
            Contact Privacy Team
          </a>
        </div>
      </GlassCard>
    </div>
  );
}

