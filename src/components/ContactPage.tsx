import { ArrowLeft, Mail, MessageSquare, MapPin, Phone, Send, Twitter, Linkedin, Github, Globe } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Button } from './Button';
import ReactMarkdown from 'react-markdown';
import { useState } from 'react';

interface ContactPageProps {
  onBack: () => void;
}

const contactContent = `
# Get In Touch

We'd love to hear from you! Whether you have a question, feedback, partnership inquiry, or just want to say hello - we're here.

---

## 📬 Contact Methods

### General Inquiries
For general questions and information:
- **Email**: [hello@devcommunity.io](mailto:hello@devcommunity.io)
- **Response Time**: Within 24 hours

### Technical Support
Need help with the platform?
- **Email**: [support@devcommunity.io](mailto:support@devcommunity.io)
- **Discord**: [Join our support channel](https://discord.gg/devcommunity)
- **Response Time**: Within 12 hours

### Business & Partnerships
Interested in collaborating?
- **Email**: [partnerships@devcommunity.io](mailto:partnerships@devcommunity.io)
- **Calendar**: [Schedule a call](https://calendly.com/devcommunity)
- **Response Time**: Within 48 hours

### Press & Media
Media inquiries and press releases:
- **Email**: [press@devcommunity.io](mailto:press@devcommunity.io)
- **Press Kit**: [Download](https://devcommunity.io/press-kit)
- **Response Time**: Within 24 hours

---

## 🌍 Our Office

**DevCommunity HQ**  
123 Innovation Drive, Suite 456  
San Francisco, CA 94103  
United States

**Office Hours**:  
Monday - Friday: 9:00 AM - 6:00 PM PST  
Saturday: 10:00 AM - 4:00 PM PST  
Sunday: Closed

---

## 💬 Community Channels

Connect with us on social media:

- **Twitter**: [@DevCommunity](https://twitter.com/devcommunity) - Daily updates and announcements
- **Discord**: [discord.gg/devcommunity](https://discord.gg/devcommunity) - Real-time community chat
- **LinkedIn**: [/company/devcommunity](https://linkedin.com/company/devcommunity) - Professional network
- **GitHub**: [github.com/devcommunity](https://github.com/devcommunity) - Open source projects
- **Telegram**: [t.me/devcommunity](https://t.me/devcommunity) - Community discussions
- **YouTube**: [DevCommunity](https://youtube.com/@devcommunity) - Tutorials and webinars

---

## 🤝 Partnership Opportunities

We're always looking for strategic partnerships:

### For Companies
- **Hiring & Recruitment** - Access to 50,000+ developers
- **Brand Partnerships** - Co-marketing opportunities
- **Event Sponsorships** - Sponsor hackathons and meetups
- **Technology Integrations** - API and platform integrations

### For Communities
- **Cross-Promotion** - Grow together
- **Event Collaboration** - Co-host events
- **Content Sharing** - Guest posts and features
- **Resource Exchange** - Share educational content

### For Developers
- **Open Source Contributions** - Join our GitHub
- **Content Creation** - Write tutorials and guides
- **Community Moderation** - Help maintain our standards
- **Ambassador Program** - Represent DevCommunity

---

## 📢 Report Issues

### Security Issues
Found a security vulnerability?
- **Email**: [security@devcommunity.io](mailto:security@devcommunity.io)
- **PGP Key**: [Download public key](https://devcommunity.io/pgp-key.asc)
- **Bug Bounty**: Up to $10,000 for critical vulnerabilities

### Content Issues
Report inappropriate content or violations:
- **Form**: [Report Content](https://devcommunity.io/report)
- **Email**: [moderation@devcommunity.io](mailto:moderation@devcommunity.io)
- **Response Time**: Within 6 hours

### Platform Bugs
Found a bug? Help us improve:
- **GitHub Issues**: [github.com/devcommunity/issues](https://github.com/devcommunity/issues)
- **Email**: [bugs@devcommunity.io](mailto:bugs@devcommunity.io)

---

## 📚 Additional Resources

- **Help Center**: [help.devcommunity.io](https://help.devcommunity.io)
- **API Documentation**: [docs.devcommunity.io](https://docs.devcommunity.io)
- **Status Page**: [status.devcommunity.io](https://status.devcommunity.io)
- **Blog**: [blog.devcommunity.io](https://blog.devcommunity.io)
- **Roadmap**: [roadmap.devcommunity.io](https://roadmap.devcommunity.io)

---

## 🕐 Expected Response Times

| Channel | Response Time | Best For |
|---------|--------------|----------|
| Email (General) | 24 hours | Non-urgent inquiries |
| Support Email | 12 hours | Technical issues |
| Discord | 1-2 hours | Quick questions |
| Twitter DM | 24 hours | Public inquiries |
| Emergency Support | 1 hour | Critical issues |

---

## 🌐 International Contacts

### Europe
**Email**: [europe@devcommunity.io](mailto:europe@devcommunity.io)  
**Time Zone**: CET (UTC+1)

### Asia Pacific
**Email**: [apac@devcommunity.io](mailto:apac@devcommunity.io)  
**Time Zone**: SGT (UTC+8)

### Latin America
**Email**: [latam@devcommunity.io](mailto:latam@devcommunity.io)  
**Time Zone**: BRT (UTC-3)

---

*We typically respond to all inquiries within 24 hours during business days.*
`;

export function ContactPage({ onBack }: ContactPageProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement actual form submission
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4">
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
            Contact Us
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            We're here to help and answer any questions you might have
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Contact Form */}
        <div className="lg:col-span-2 space-y-4">
          {/* Quick Contact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <GlassCard className="p-4 hover:shadow-lg transition-all duration-300 cursor-pointer">
              <Mail className="w-8 h-8 text-blue-500 mb-2" />
              <h3 className="font-semibold mb-1">Email Us</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">hello@devcommunity.io</p>
              <p className="text-xs text-gray-500 mt-1">Response within 24h</p>
            </GlassCard>
            
            <GlassCard className="p-4 hover:shadow-lg transition-all duration-300 cursor-pointer">
              <MessageSquare className="w-8 h-8 text-purple-500 mb-2" />
              <h3 className="font-semibold mb-1">Live Chat</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Discord Community</p>
              <p className="text-xs text-gray-500 mt-1">Response within 1-2h</p>
            </GlassCard>

            <GlassCard className="p-4 hover:shadow-lg transition-all duration-300 cursor-pointer">
              <MapPin className="w-8 h-8 text-green-500 mb-2" />
              <h3 className="font-semibold mb-1">Visit Us</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">San Francisco, CA</p>
              <p className="text-xs text-gray-500 mt-1">Mon-Fri 9AM-6PM PST</p>
            </GlassCard>

            <GlassCard className="p-4 hover:shadow-lg transition-all duration-300 cursor-pointer">
              <Phone className="w-8 h-8 text-orange-500 mb-2" />
              <h3 className="font-semibold mb-1">Call Us</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">+1 (555) 123-4567</p>
              <p className="text-xs text-gray-500 mt-1">Business hours only</p>
            </GlassCard>
          </div>

          {/* Contact Form */}
          <GlassCard className="p-6">
            <h2 className="text-2xl font-bold mb-4">Send us a Message</h2>
            {submitted && (
              <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-600 dark:text-green-400">
                ✅ Message sent successfully! We'll get back to you soon.
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Your Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 bg-white/50 dark:bg-white/5 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Your Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-2 bg-white/50 dark:bg-white/5 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Subject</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="w-full px-4 py-2 bg-white/50 dark:bg-white/5 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="How can we help?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  required
                  rows={6}
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full px-4 py-2 bg-white/50 dark:bg-white/5 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tell us more about your inquiry..."
                />
              </div>
              <Button type="submit" variant="primary" className="w-full flex items-center justify-center gap-2">
                <Send size={18} />
                Send Message
              </Button>
            </form>
          </GlassCard>
        </div>

        {/* Right Column - Info & Social */}
        <div className="space-y-4">
          {/* Social Links */}
          <GlassCard className="p-6">
            <h3 className="text-xl font-bold mb-4">Connect With Us</h3>
            <div className="space-y-3">
              <a href="https://twitter.com/devcommunity" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-all group">
                <Twitter className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                <div>
                  <div className="font-medium">Twitter</div>
                  <div className="text-xs text-gray-500">@DevCommunity</div>
                </div>
              </a>
              <a href="https://linkedin.com/company/devcommunity" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-all group">
                <Linkedin className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                <div>
                  <div className="font-medium">LinkedIn</div>
                  <div className="text-xs text-gray-500">/company/devcommunity</div>
                </div>
              </a>
              <a href="https://github.com/devcommunity" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-all group">
                <Github className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:scale-110 transition-transform" />
                <div>
                  <div className="font-medium">GitHub</div>
                  <div className="text-xs text-gray-500">github.com/devcommunity</div>
                </div>
              </a>
              <a href="https://discord.gg/devcommunity" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-all group">
                <MessageSquare className="w-5 h-5 text-indigo-500 group-hover:scale-110 transition-transform" />
                <div>
                  <div className="font-medium">Discord</div>
                  <div className="text-xs text-gray-500">discord.gg/devcommunity</div>
                </div>
              </a>
              <a href="https://devcommunity.io" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-all group">
                <Globe className="w-5 h-5 text-green-500 group-hover:scale-110 transition-transform" />
                <div>
                  <div className="font-medium">Website</div>
                  <div className="text-xs text-gray-500">devcommunity.io</div>
                </div>
              </a>
            </div>
          </GlassCard>

          {/* Map Placeholder */}
          <GlassCard className="p-6">
            <h3 className="text-xl font-bold mb-4">Our Location</h3>
            <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg flex items-center justify-center mb-4">
              <MapPin className="w-12 h-12 text-blue-500" />
            </div>
            <div className="text-sm space-y-1">
              <p className="font-medium">DevCommunity HQ</p>
              <p className="text-gray-600 dark:text-gray-400">123 Innovation Drive, Suite 456</p>
              <p className="text-gray-600 dark:text-gray-400">San Francisco, CA 94103</p>
              <p className="text-gray-600 dark:text-gray-400">United States</p>
            </div>
          </GlassCard>

          {/* Detailed Info */}
          <GlassCard className="p-6">
            <div className="prose prose-sm dark:prose-invert max-w-none prose-a:text-blue-600 dark:prose-a:text-blue-400">
              <ReactMarkdown>{contactContent}</ReactMarkdown>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

