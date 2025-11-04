import { StaticPageContent } from './StaticPageContent';

interface PrivacyPolicyPageProps {
  onBack: () => void;
}

const defaultContent = `
# Privacy Policy

**Effective Date:** January 1, 2024  
**Last Updated:** October 28, 2025

---

## 📜 Introduction

Welcome to DevCommunity ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.

**Please read this Privacy Policy carefully.** By using DevCommunity, you agree to the collection and use of information in accordance with this policy.
`;

export function PrivacyPolicyPage({ onBack }: PrivacyPolicyPageProps) {
  return (
    <StaticPageContent
      slug="privacy-policy"
      title="Privacy Policy"
      onBack={onBack}
      defaultContent={defaultContent}
    />
  );
}
