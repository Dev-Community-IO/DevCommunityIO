import { StaticPageContent } from './StaticPageContent';

interface TermsOfUsePageProps {
  onBack: () => void;
}

const defaultContent = `
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
`;

export function TermsOfUsePage({ onBack }: TermsOfUsePageProps) {
  return (
    <StaticPageContent
      slug="terms-of-use"
      title="Terms of Use"
      onBack={onBack}
      defaultContent={defaultContent}
    />
  );
}
