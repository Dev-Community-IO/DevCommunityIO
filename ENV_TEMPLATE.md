# Frontend Environment Variables Template

Copy this to `.env` and fill in your values:

```env
# API Configuration
VITE_API_URL=http://localhost:3333/api

# Development Server
VITE_PORT=5173
VITE_HOST=localhost

# Preview Server (for production build preview)
VITE_PREVIEW_PORT=4173

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_SENTRY=false

# App Configuration
VITE_APP_NAME=DevCommunity
VITE_APP_DESCRIPTION=Web3 Developer Community Platform
```

## Setup:

```bash
# 1. Copy this template
cp ENV_TEMPLATE.md .env

# 2. Or create .env manually with above content

# 3. Make sure VITE_API_URL matches your backend

# 4. Start dev server
npm run dev
```

Server will start on `http://localhost:5173` (or your configured VITE_PORT)

## Port Configuration:

- Change `VITE_PORT` to use a different development port
- Change `VITE_API_URL` if your backend is on a different port
- Vite will automatically try alternative ports if your port is busy

