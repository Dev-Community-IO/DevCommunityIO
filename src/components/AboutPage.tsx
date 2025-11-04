import { StaticPageContent } from './StaticPageContent';

interface AboutPageProps {
  onBack: () => void;
}

const defaultContent = `
# About DevCommunity

## 🌟 Who We Are

DevCommunity is a **decentralized platform** built by developers, for developers. We're creating a space where blockchain enthusiasts, Web3 builders, and tech innovators can connect, collaborate, and grow together.

Founded in 2024, we've grown from a small community of passionate developers to a thriving ecosystem of thousands of creators, learners, and innovators.
`;

export function AboutPage({ onBack }: AboutPageProps) {
  return (
    <StaticPageContent
      slug="about"
      title="About"
      onBack={onBack}
      defaultContent={defaultContent}
    />
  );
}
