import { StaticPageContent } from './StaticPageContent';

interface CodeOfConductPageProps {
  onBack: () => void;
}

const defaultContent = `
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
`;

export function CodeOfConductPage({ onBack }: CodeOfConductPageProps) {
  return (
    <StaticPageContent
      slug="code-of-conduct"
      title="Code of Conduct"
      onBack={onBack}
      defaultContent={defaultContent}
    />
  );
}
