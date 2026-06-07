# Contributing to DevCommunity Frontend

Thank you for your interest in contributing to [devcommunityIO](https://github.com/Dev-Community-IO/devcommunityIO)!

## Prerequisites

- **Node.js** 20 or later (see `.nvmrc`)
- **npm** 9+
- A running [DevCommunity API](https://github.com/Dev-Community-IO/devcommunityV2-api) instance for full-stack development

## Getting started

1. Fork the repository and clone your fork.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the environment template and configure it:
   ```bash
   cp .env.example .env
   ```
4. Start the development servers (Vite + SEO server):
   ```bash
   npm run dev
   ```

The frontend runs on the port configured in `VITE_PORT` (default `3351`). The API should be reachable at `VITE_API_BASE_URL`.

## Development workflow

1. Create a branch from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```
2. Make your changes with clear, focused commits.
3. Run checks before opening a pull request:
   ```bash
   npm run lint
   npm run typecheck
   npm run build
   ```
4. Open a pull request against `main` using the PR template.

## Code style

- TypeScript and React (functional components, hooks)
- ESLint rules in `eslint.config.js`
- Prettier for formatting: `npm run format`
- Match existing patterns in the codebase; keep diffs focused

## Pull requests

- Link related issues when applicable
- Describe what changed and why
- Include a test plan (manual steps are fine)
- Ensure CI passes (lint, typecheck, build)
- By contributing, you agree that your contributions are licensed under the
  [Apache License 2.0](LICENSE)

## Reporting bugs and requesting features

Use [GitHub Issues](https://github.com/Dev-Community-IO/devcommunityIO/issues) with the appropriate issue template.

For security vulnerabilities, see [SECURITY.md](SECURITY.md) — do **not** open public issues.

## Questions

See [SUPPORT.md](SUPPORT.md) for help channels.
