import { ArrowLeft, FileText, Scale, AlertCircle, CheckCircle, XCircle, Info } from 'lucide-react';
import { GlassCard } from './GlassCard';
import ReactMarkdown from 'react-markdown';

interface TermsOfUsePageProps {
  onBack: () => void;
}

const termsContent = `
# Terms of Use

**Effective Date:** January 1, 2024  
**Last Updated:** October 28, 2025

---

## 📜 Agreement to Terms

Welcome to DevCommunity! These Terms of Use ("Terms") govern your access to and use of our platform, website, and services (collectively, the "Services").

**By accessing or using our Services, you agree to be bound by these Terms.** If you do not agree to these Terms, please do not use our Services.

---

## 🎯 Definitions

- **"We," "Us," "Our"**: DevCommunity, Inc. and its affiliates
- **"You," "Your"**: The person or entity using our Services
- **"Platform"**: The DevCommunity website and application
- **"Content"**: Text, images, code, data, and other materials
- **"User Content"**: Content you create or upload
- **"Services"**: All features and functionality we provide

---

## ✅ Eligibility

To use DevCommunity, you must:

- Be **at least 13 years old** (16 in the EU)
- Have the **legal capacity** to enter into contracts
- Not be **banned** or suspended from our Services
- Comply with **all applicable laws**
- Provide **accurate information** during registration

### For Organizations

If using on behalf of an organization:
- You have authority to bind the organization
- The organization agrees to these Terms
- The organization is responsible for all users

---

## 🔐 Account Registration

### Creating an Account

You may create an account by:
1. **Web3 Wallet** (Ethereum, Cardano)
2. **Email & Password**
3. **OAuth** (Google, GitHub)

### Account Security

You are responsible for:
- **Maintaining confidentiality** of credentials
- **All activity** under your account
- **Notifying us** of unauthorized access
- **Not sharing** your account

We are not liable for losses due to unauthorized use.

### Account Requirements

- **One account per person**
- **Accurate information**
- **No impersonation**
- **No automated account creation**

---

## 📝 User Conduct

### What You CAN Do

✅ **Create and share** technical content  
✅ **Engage respectfully** with the community  
✅ **Collaborate** on projects  
✅ **Participate** in events and hackathons  
✅ **Build your reputation** through contributions  
✅ **Connect** with other developers  

### What You CANNOT Do

❌ **Violate laws** or regulations  
❌ **Infringe intellectual property** rights  
❌ **Post harmful content** (hate speech, harassment, etc.)  
❌ **Spam or manipulate** the platform  
❌ **Impersonate** others  
❌ **Spread malware** or viruses  
❌ **Scrape or harvest** data without permission  
❌ **Interfere** with platform operations  
❌ **Circumvent** security measures  
❌ **Engage in fraudulent** activity  

---

## 📚 Content Rights and Licenses

### Your Content

You retain **ownership** of content you create. By posting on DevCommunity, you grant us:

**License Grant**: A worldwide, non-exclusive, royalty-free, transferable license to:
- **Use, copy, reproduce** your content
- **Modify and create derivatives** (for platform functionality)
- **Display and distribute** your content
- **Sublicense** to service providers

**License Duration**: While content is on the platform, plus reasonable time for caches to clear.

### Your Responsibilities

You represent and warrant that:
- You **own or have rights** to your content
- Your content doesn't **infringe** others' rights
- Your content complies with **applicable laws**
- You have **necessary permissions** for any third-party content

### Our Content

Platform design, features, and documentation are owned by DevCommunity and protected by:
- Copyright
- Trademark
- Trade secrets
- Other intellectual property laws

You may not:
- Copy or modify our platform
- Reverse engineer our code
- Use our branding without permission
- Create derivative platforms

---

## 🛡️ Content Moderation

### Our Rights

We reserve the right to:
- **Remove or modify** any content
- **Suspend or terminate** accounts
- **Investigate violations**
- **Report illegal activity** to authorities

### No Obligation

We have **no obligation** to:
- Monitor all content
- Remove specific content
- Retain deleted content
- Restore removed content

### Content Removal

We may remove content that:
- Violates these Terms
- Violates our Code of Conduct
- Is illegal or harmful
- Infringes intellectual property
- Is spam or misleading

---

## 💰 Fees and Payments

### Free Services

Core platform features are **free**, including:
- Account creation
- Content posting
- Community participation
- Basic features

### Premium Features (Future)

We may offer premium features for a fee:
- Advanced analytics
- Enhanced profiles
- Priority support
- Additional storage

**Terms for paid services will be provided before purchase.**

### Refund Policy

- **Digital goods**: Generally no refunds
- **Services**: Prorated refunds for unused portions
- **Disputes**: Contact support within 30 days

---

## 🚫 Prohibited Activities

### Strictly Forbidden

1. **Illegal Activity**
   - Fraud, theft, money laundering
   - Hacking or unauthorized access
   - Distribution of illegal content
   - Violating export controls

2. **Platform Abuse**
   - Creating multiple accounts
   - Vote manipulation
   - Gaming reputation systems
   - Automated scraping

3. **Harmful Content**
   - Malware or viruses
   - Phishing attempts
   - Exploits or vulnerabilities
   - Child sexual abuse material

4. **Commercial Spam**
   - Unsolicited advertising
   - Pyramid schemes
   - Fake products or services
   - Misleading promotions

### Consequences

Violations may result in:
- Content removal
- Account suspension
- Permanent ban
- Legal action
- Law enforcement referral

---

## 🔗 Third-Party Services

### Integrations

We integrate with third-party services:
- **OAuth providers** (Google, GitHub)
- **Blockchain networks** (Ethereum, Cardano)
- **Payment processors** (future)
- **Analytics providers**

### No Endorsement

We do not:
- Endorse third-party services
- Guarantee their availability
- Accept liability for their actions
- Control their policies

### External Links

Links to external sites are provided for convenience. We are not responsible for:
- Content on external sites
- Privacy practices of external sites
- Availability of external sites

---

## ⚠️ Disclaimers

### "AS IS" Service

THE SERVICES ARE PROVIDED **"AS IS" AND "AS AVAILABLE"** WITHOUT WARRANTIES OF ANY KIND, either express or implied.

We disclaim all warranties, including:
- **Merchantability**
- **Fitness for a particular purpose**
- **Non-infringement**
- **Accuracy or reliability**
- **Uninterrupted or error-free operation**

### No Professional Advice

Content on the platform is for **informational purposes** only. It does not constitute:
- Legal advice
- Financial advice
- Investment advice
- Professional services

Always consult qualified professionals for specific advice.

### User-Generated Content

We are **not responsible** for:
- Accuracy of user content
- Opinions expressed by users
- Disputes between users
- Quality of code shared

---

## 🛡️ Limitation of Liability

**TO THE MAXIMUM EXTENT PERMITTED BY LAW:**

### No Liability For

- **Indirect, incidental, or consequential damages**
- **Loss of profits, data, or revenue**
- **Cost of substitute services**
- **Interruption of business**
- **User content or third-party actions**

### Maximum Liability

Our total liability will not exceed the **greater of**:
- **$100 USD**, or
- **Amounts you paid us in the past 12 months**

### Exceptions

Some jurisdictions don't allow limitations on implied warranties or liability. In such cases, these limitations may not apply to you.

---

## 🤝 Indemnification

You agree to **indemnify, defend, and hold harmless** DevCommunity, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from:

- Your use of the Services
- Your content
- Your violation of these Terms
- Your violation of others' rights
- Your violation of laws

---

## 🔚 Termination

### By You

You may **terminate** your account at any time by:
- Using account deletion feature
- Contacting support
- Emailing [support@devcommunity.io](mailto:support@devcommunity.io)

### By Us

We may **suspend or terminate** your access:
- For violation of these Terms
- For violation of laws
- For suspicious or fraudulent activity
- At our discretion with or without cause

### Effect of Termination

Upon termination:
- Your right to use Services ends immediately
- We may delete your data
- Licenses you granted continue for public content
- Provisions that should survive will remain in effect

### Survival

These sections survive termination:
- Content licenses
- Disclaimers and limitations
- Indemnification
- Dispute resolution

---

## ⚖️ Dispute Resolution

### Informal Resolution

Before legal action, you agree to:
1. Contact us at [legal@devcommunity.io](mailto:legal@devcommunity.io)
2. Describe the dispute
3. Attempt good-faith resolution for 60 days

### Arbitration

**For US Users**: Disputes will be resolved by **binding arbitration**, not in court.

**Arbitration Rules**:
- American Arbitration Association (AAA)
- One arbitrator
- California law applies
- San Francisco County, CA location

**Exceptions to Arbitration**:
- Small claims court
- Intellectual property claims
- Injunctive relief

### Class Action Waiver

You agree to resolve disputes **individually**, not as part of a class, consolidated, or representative action.

### Non-US Users

For users outside the US, local dispute resolution laws apply.

---

## 🌍 Governing Law

### Jurisdiction

These Terms are governed by the laws of:
- **California, United States**
- **Federal law** where applicable

### Venue

Legal proceedings must be brought in:
- **San Francisco County, California** (for court actions)
- Per arbitration rules (for arbitrated disputes)

### International Users

If you access Services from outside the US:
- You do so at your own risk
- You comply with local laws
- Export control laws may apply

---

## 📝 Changes to Terms

### Modifications

We may **modify these Terms** at any time by:
- Posting updated Terms
- Updating the "Last Updated" date
- Notifying you via email or platform notice

### Material Changes

For material changes:
- **30 days advance notice**
- Opportunity to **review changes**
- Option to **terminate** if you disagree

### Acceptance

Continued use after changes constitutes **acceptance** of modified Terms.

---

## 🔔 Notices

### To You

We may send notices via:
- Email to registered address
- Platform notification
- Posted announcement

### To Us

Send legal notices to:

**DevCommunity, Inc.**  
Attn: Legal Department  
123 Innovation Drive, Suite 456  
San Francisco, CA 94103  
United States  
Email: [legal@devcommunity.io](mailto:legal@devcommunity.io)

---

## 📄 General Terms

### Entire Agreement

These Terms, along with our Privacy Policy and Code of Conduct, constitute the entire agreement between you and DevCommunity.

### Waiver

Our failure to enforce any right or provision doesn't constitute a waiver of that right or provision.

### Severability

If any provision is found unenforceable, the remaining provisions will remain in effect.

### Assignment

- You **cannot assign** these Terms without our consent
- We **may assign** these Terms to any successor or affiliate

### Force Majeure

We are not liable for delays or failures due to circumstances beyond our reasonable control.

### No Agency

These Terms don't create a partnership, joint venture, employment, or agency relationship.

---

## 📞 Contact Information

**For General Inquiries:**  
[hello@devcommunity.io](mailto:hello@devcommunity.io)

**For Legal Matters:**  
[legal@devcommunity.io](mailto:legal@devcommunity.io)

**For Terms Questions:**  
[terms@devcommunity.io](mailto:terms@devcommunity.io)

**Mailing Address:**  
DevCommunity, Inc.  
123 Innovation Drive, Suite 456  
San Francisco, CA 94103  
United States

---

## 📚 Related Policies

- **Privacy Policy**: [devcommunity.io/privacy](https://devcommunity.io/privacy)
- **Code of Conduct**: [devcommunity.io/conduct](https://devcommunity.io/conduct)
- **Cookie Policy**: [devcommunity.io/cookies](https://devcommunity.io/cookies)
- **Copyright Policy**: [devcommunity.io/copyright](https://devcommunity.io/copyright)
- **API Terms**: [devcommunity.io/api-terms](https://devcommunity.io/api-terms)

---

## ✍️ Acknowledgment

**By using DevCommunity, you acknowledge that:**

- ✅ You have read these Terms
- ✅ You understand these Terms
- ✅ You agree to be bound by these Terms
- ✅ You meet the eligibility requirements
- ✅ You will comply with all applicable laws

---

*These Terms of Use were last updated on October 28, 2025.*  
*Version 2.0*

*Thank you for being part of the DevCommunity! 🚀*
`;

export function TermsOfUsePage({ onBack }: TermsOfUsePageProps) {
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
            Terms of Use
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            The rules and guidelines for using DevCommunity
          </p>
        </div>
      </div>

      {/* Key Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard className="p-4 text-center">
          <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
          <h3 className="font-semibold mb-1">What You Can Do</h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">Create, share, collaborate</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <XCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
          <h3 className="font-semibold mb-1">What You Can't Do</h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">Spam, harass, violate laws</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <Scale className="w-8 h-8 mx-auto mb-2 text-blue-500" />
          <h3 className="font-semibold mb-1">Your Rights</h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">Content ownership & protection</p>
        </GlassCard>
      </div>

      {/* Important Notices */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassCard className="p-4 border-2 border-blue-500/30">
          <div className="flex items-start gap-3">
            <Info className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold mb-1">Age Requirement</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                You must be at least 13 years old (16 in EU) to use DevCommunity
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4 border-2 border-yellow-500/30">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold mb-1">Binding Agreement</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                By using our platform, you agree to these legally binding terms
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Main Content */}
      <GlassCard className="p-6 md:p-8">
        <div className="prose prose-slate dark:prose-invert max-w-none
          prose-headings:font-bold
          prose-h1:text-4xl prose-h1:mb-6 prose-h1:mt-8
          prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-8 prose-h2:text-purple-600 dark:prose-h2:text-purple-400
          prose-h3:text-xl prose-h3:mb-3 prose-h3:mt-6 prose-h3:text-pink-600 dark:prose-h3:text-pink-400
          prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed
          prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
          prose-strong:text-gray-900 dark:prose-strong:text-gray-100 prose-strong:font-semibold
          prose-ul:my-4 prose-li:my-1
          prose-hr:border-gray-300 dark:prose-hr:border-gray-700 prose-hr:my-8
        ">
          <ReactMarkdown>{termsContent}</ReactMarkdown>
        </div>
      </GlassCard>

      {/* Quick Summary */}
      <GlassCard className="p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
        <h3 className="text-xl font-bold mb-4">TL;DR - Quick Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-semibold mb-2 text-green-600 dark:text-green-400">✅ You Can:</h4>
            <ul className="space-y-1 text-gray-700 dark:text-gray-300">
              <li>• Share code and technical content</li>
              <li>• Collaborate with developers</li>
              <li>• Build your reputation</li>
              <li>• Participate in events</li>
              <li>• Keep ownership of your content</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-red-600 dark:text-red-400">❌ You Cannot:</h4>
            <ul className="space-y-1 text-gray-700 dark:text-gray-300">
              <li>• Spam or harass others</li>
              <li>• Violate laws or regulations</li>
              <li>• Manipulate voting systems</li>
              <li>• Infringe intellectual property</li>
              <li>• Share malware or viruses</li>
            </ul>
          </div>
        </div>
      </GlassCard>

      {/* Contact CTA */}
      <GlassCard className="p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-2 border-purple-500/20">
        <div className="text-center">
          <FileText className="w-12 h-12 mx-auto mb-3 text-purple-500" />
          <h3 className="text-2xl font-bold mb-2">Questions About These Terms?</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Our legal team is here to help clarify anything
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href="mailto:legal@devcommunity.io" className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all">
              Contact Legal Team
            </a>
            <a href="mailto:terms@devcommunity.io" className="inline-flex items-center gap-2 px-6 py-3 border-2 border-purple-600 text-purple-600 dark:text-purple-400 rounded-lg font-semibold hover:bg-purple-600 hover:text-white transition-all">
              Terms Questions
            </a>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

