import { StaticPageContent } from './StaticPageContent';

interface ContactPageProps {
  onBack: () => void;
}

const defaultContent = `
# Contact

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
- **Response Time**: Within 48 hours
`;

export function ContactPage({ onBack }: ContactPageProps) {
  return (
    <StaticPageContent
      slug="contact"
      title="Contact"
      onBack={onBack}
      defaultContent={defaultContent}
    />
  );
}
