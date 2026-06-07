import { StaticPageContent } from './StaticPageContent';
import { GitHubSponsorsCard } from './GitHubSponsors';
import { GlassCard } from './GlassCard';

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
    <>
      <StaticPageContent
        slug="about"
        title="About"
        onBack={onBack}
        defaultContent={defaultContent}
      />
      <div className="mx-auto mt-4 max-w-4xl">
        <GlassCard className="p-6 md:p-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
            Support DevCommunity
          </h2>
          <div className="overflow-hidden rounded-lg">
            <GitHubSponsorsCard />
          </div>
        </GlassCard>
      </div>
    </>
  );
}
