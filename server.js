import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';
import {
    SEO_ROUTE_TYPES,
    resolveApiBaseUrl,
    fetchSeoMetadata,
    fetchText,
    getFallbackMetadata,
    injectMetaTags,
    buildRobotsTxt,
} from './seo/seo-core.js';

// Load environment variables from .env file
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// PORT for the SEO server (prefer PORT, fall back to VITE_PORT, then 3000)
const PORT = process.env.PORT
    ? parseInt(process.env.PORT, 10)
    : (process.env.VITE_PORT ? parseInt(process.env.VITE_PORT, 10) : 3000);

if (process.env.PORT) {
    console.log(`[SEO Server] Using PORT from .env: ${PORT}`);
} else if (process.env.VITE_PORT) {
    console.log(`[SEO Server] Using VITE_PORT from .env: ${PORT} (consider setting PORT explicitly)`);
} else {
    console.warn(`[SEO Server] ⚠ No PORT found in .env, using default: ${PORT}`);
}

const DEFAULT_API_BASE_URL = resolveApiBaseUrl(process.env);

// Check dist (important for preview/production)
const distPath = join(__dirname, 'dist');
const distIndexPath = join(distPath, 'index.html');
try {
    readFileSync(distIndexPath, 'utf-8');
    console.log(`[SEO Server] ✓ Found dist directory at: ${distPath}`);
} catch {
    if (process.env.NODE_ENV === 'production') {
        console.warn(`[SEO Server] ⚠ dist/index.html not found — run 'npm run build' first`);
    } else {
        console.log(`[SEO Server] ℹ Development mode: dist will be created on first build`);
    }
}

// Trust proxy for proper protocol detection
app.set('trust proxy', true);

const SITE_NAME = process.env.SITE_NAME || process.env.VITE_SITE_NAME || 'DevCommunity';

/** Base URL of the public site, from the incoming request. */
function getBaseUrl(req) {
    const protocol = req.protocol || (req.secure ? 'https' : 'http');
    const host = req.get('host') || `localhost:${PORT}`;
    return `${protocol}://${host}`;
}

/** Headers forwarded to the API so it builds URLs with the public host. */
function apiForwardHeaders(req) {
    const headers = {};
    const host = req.get('host');
    const proto = req.protocol || (req.secure ? 'https' : 'http');
    if (host) {
        headers['x-forwarded-host'] = host;
        headers['x-forwarded-proto'] = proto;
    }
    return headers;
}

function readDistIndex() {
    return readFileSync(join(__dirname, 'dist', 'index.html'), 'utf-8');
}

/** Redirect to the Vite dev server when dist isn't built yet (dev only). */
function redirectToViteIfDev(req, res) {
    if (process.env.NODE_ENV !== 'production') {
        const vitePort = process.env.VITE_PORT || 5173;
        res.redirect(`http://localhost:${vitePort}${req.originalUrl}`);
        return true;
    }
    res.status(503).send('Application is building. Please try again in a moment.');
    return true;
}

// ---------------------------------------------------------------------------
// SEO route handler (injects per-resource meta into the SPA shell)
// ---------------------------------------------------------------------------
async function handleSeoRoute(req, res, type) {
    const identifier = req.params.slug || req.params.id;
    let html;
    try {
        html = readDistIndex();
    } catch {
        return redirectToViteIfDev(req, res);
    }

    try {
        const apiBaseUrl = resolveApiBaseUrl(process.env, req.get('host')) || DEFAULT_API_BASE_URL;
        const metadata = await fetchSeoMetadata({
            apiBaseUrl, type, identifier, headers: apiForwardHeaders(req),
        });

        const ctx = { baseUrl: getBaseUrl(req), currentPath: req.originalUrl || req.url || '', host: req.get('host') };
        html = injectMetaTags(
            html,
            metadata || getFallbackMetadata({ baseUrl: ctx.baseUrl, siteName: SITE_NAME, currentPath: ctx.currentPath }),
            ctx
        );

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        return res.send(html);
    } catch {
        const ctx = { baseUrl: getBaseUrl(req), currentPath: req.originalUrl || '', host: req.get('host') };
        const fallback = getFallbackMetadata({ baseUrl: ctx.baseUrl, siteName: SITE_NAME, currentPath: ctx.currentPath });
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=300');
        return res.send(injectMetaTags(html, fallback, ctx));
    }
}

// ---------------------------------------------------------------------------
// AI / crawler discovery artefacts (must precede static + catch-all)
// ---------------------------------------------------------------------------
app.get('/robots.txt', (req, res) => {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(buildRobotsTxt({ baseUrl: getBaseUrl(req) }));
});

app.get('/sitemap.xml', async (req, res) => {
    const apiBaseUrl = resolveApiBaseUrl(process.env, req.get('host')) || DEFAULT_API_BASE_URL;
    const xml = await fetchText({ url: `${apiBaseUrl}/seo/sitemap.xml`, headers: apiForwardHeaders(req) });
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    if (!xml) {
        return res.status(502).send('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
    }
    return res.send(xml);
});

app.get('/llms.txt', async (req, res) => {
    const apiBaseUrl = resolveApiBaseUrl(process.env, req.get('host')) || DEFAULT_API_BASE_URL;
    const txt = await fetchText({ url: `${apiBaseUrl}/seo/llms.txt`, headers: apiForwardHeaders(req) });
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    return res.send(txt || `# ${SITE_NAME}\n\n> Where developers build the future.\n`);
});

// ---------------------------------------------------------------------------
// SEO routes (with and without trailing slash)
// ---------------------------------------------------------------------------
for (const [prefix, type] of Object.entries(SEO_ROUTE_TYPES)) {
    app.get(`/${prefix}/:slug`, (req, res) => handleSeoRoute(req, res, type));
    app.get(`/${prefix}/:slug/`, (req, res) => handleSeoRoute(req, res, type));
}

// Static assets AFTER SEO routes so SEO routes win
app.use(express.static(join(__dirname, 'dist')));

// SPA catch-all
app.get('*', (req, res) => {
    try {
        readDistIndex();
    } catch {
        return redirectToViteIfDev(req, res);
    }
    res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`[SEO Server] ✓ Started on port ${PORT}`);
    console.log(`[SEO Server] API base: ${DEFAULT_API_BASE_URL}`);
    console.log(`[SEO Server] Environment: ${process.env.NODE_ENV || 'development'}`);
});
