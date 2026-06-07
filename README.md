# DevCommunity Frontend

[![CI](https://github.com/Dev-Community-IO/devcommunityIO/actions/workflows/ci.yml/badge.svg)](https://github.com/Dev-Community-IO/devcommunityIO/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen.svg)](https://nodejs.org/)

The official frontend for [DevCommunity](https://devcommunity.io) — a Web3 developer community platform. Built with React, Vite, and TypeScript, with an Express-based SEO server for social crawlers and production serving.

**Backend API:** [devcommunityV2-api](https://github.com/Dev-Community-IO/devcommunityV2-api)

## Features

- Fast SPA powered by Vite and React 18
- Server-side SEO rendering for posts, pages, and profiles
- Web3 wallet authentication (Cardano, Safrochain/Cosmos, and more)
- OAuth sign-in (Google, GitHub) via the API
- PWA support and push notifications
- Full-text search, filters, and rich content types (posts, hackathons, events, opportunities)
- Dark mode and responsive layout

## Prerequisites

- **Node.js** 20+ ([`.nvmrc`](.nvmrc))
- **npm** 9+
- Running [DevCommunity API](https://github.com/Dev-Community-IO/devcommunityV2-api) for authenticated features

## Quick start

```bash
git clone https://github.com/Dev-Community-IO/devcommunityIO.git
cd devcommunityIO
npm install
cp .env.example .env
# Edit .env — set VITE_API_BASE_URL to your API instance
npm run dev
```

- **Vite dev server:** `http://localhost:3351` (configurable via `VITE_PORT`)
- **SEO server:** `http://localhost:3352` (configurable via `PORT`)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite + SEO server concurrently |
| `npm run dev:vite` | Vite dev server only |
| `npm run build` | Production build to `dist/` |
| `npm run serve` | Build and start production SEO server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm run format` | Prettier format |
| `npm run format:check` | Prettier check (CI-friendly) |

## Environment variables

See [`.env.example`](.env.example) for all variables. Never commit `.env` files.

Key variables:

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend API base URL (e.g. `http://localhost:3344/api`) |
| `VITE_APP_URL` | Public frontend URL |
| `VITE_RECAPTCHA_SITE_KEY` | Google reCAPTCHA site key (public) |
| `PORT` | SEO/production server port |

## Project structure

```
devcommunityIO/
├── src/           # React application source
├── public/        # Static assets
├── server.js      # Express SEO / production server
├── vite.config.ts # Vite configuration
└── dist/          # Production build output (generated)
```

## Contributing

We welcome contributions! Please read:

- [CONTRIBUTING.md](CONTRIBUTING.md)
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- [SECURITY.md](SECURITY.md) — report vulnerabilities privately

## Support

See [SUPPORT.md](SUPPORT.md) for help channels.

## License

Licensed under the [Apache License 2.0](LICENSE). See [NOTICE](NOTICE) for attribution.
