/**
 * Shared SEO core — single source of truth for server-side SEO injection and
 * AI/crawler discovery. Imported by BOTH the production Express server (server.js)
 * and the Vite dev plugin, so the dev server (:3351) and prod server behave the same.
 *
 * Pure, dependency-free (uses global fetch). Callers pass plain option objects so
 * this module is agnostic to Express vs Connect request shapes.
 */

const PRODUCTION_DOMAINS = new Set([
    'devcommunity.io',
    'www.devcommunity.io',
    'devcommunity.com',
    'www.devcommunity.com',
]);

// Route prefix -> API resource type. Drives both SEO injection and the SPA fallback.
export const SEO_ROUTE_TYPES = {
    post: 'posts',
    pages: 'pages',
    hackathons: 'hackathons',
    events: 'events',
    opportunities: 'opportunities',
};

// AI / LLM crawlers we explicitly welcome in robots.txt.
const AI_CRAWLERS = [
    'GPTBot', 'OAI-SearchBot', 'ChatGPT-User',
    'ClaudeBot', 'Claude-Web', 'anthropic-ai', 'Claude-SearchBot',
    'PerplexityBot', 'Perplexity-User',
    'Google-Extended', 'Applebot-Extended',
    'CCBot', 'Amazonbot', 'Bytespider', 'Meta-ExternalAgent', 'cohere-ai', 'Diffbot', 'omgili', 'YouBot',
];

// ---------------------------------------------------------------------------
// In-memory caches (TTL based)
// ---------------------------------------------------------------------------
const CACHE_TTL = 60 * 60 * 1000; // 1 hour
const metaCache = new Map();
const textCache = new Map();

function getCached(cache, key) {
    const hit = cache.get(key);
    if (hit && (Date.now() - hit.timestamp) < CACHE_TTL) return hit.data;
    return undefined;
}
function setCached(cache, key, data) {
    cache.set(key, { data, timestamp: Date.now() });
}

// ---------------------------------------------------------------------------
// URL / API helpers
// ---------------------------------------------------------------------------
function normalizeApiBase(url) {
    if (!url) return '';
    const trimmed = String(url).trim().replace(/\/+$/, '');
    if (!trimmed) return '';
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
}

/**
 * Resolve the API base URL from env (and optionally the request host).
 * @param {object} env  process.env
 * @param {string} [host]  request host header
 */
export function resolveApiBaseUrl(env = {}, host = '') {
    const order = [env.SEO_API_URL, env.SEO_API_BASE_URL, env.VITE_API_BASE_URL, env.VITE_API_URL];
    for (const candidate of order) {
        const normalized = normalizeApiBase(candidate);
        if (normalized) return normalized;
    }
    if (host && PRODUCTION_DOMAINS.has(host)) {
        const baseDomain = host.replace(/^www\./, '');
        return `https://api.${baseDomain}/api`;
    }
    const apiPort = env.SEO_API_PORT || env.VITE_API_PORT || env.API_PORT || 3333;
    const protocol = env.SEO_API_PROTOCOL || 'http';
    return `${protocol}://localhost:${apiPort}/api`;
}

export function escapeHtml(text) {
    if (!text) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
        .replace(/[\u{1F600}-\u{1F6FF}]/gu, '')
        .replace(/[‘’]/g, "'")
        .replace(/[“”]/g, '"');
}

export function ensureAbsoluteUrl(url, baseUrl) {
    if (!url) return baseUrl;
    if (/^https?:\/\//i.test(url)) return url.replace(/^http:\/\//i, 'https://');
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
}

export function fixLocalhostUrl(url, host) {
    if (!url || !url.includes('localhost:3333')) return url;
    const target = host || 'devcommunity.io';
    return url.replace('localhost:3333', target).replace(/^http:\/\//, 'https://');
}

/** Derive the OG image MIME type from the URL extension (was hardcoded to png). */
export function imageMimeFromUrl(url) {
    const ext = (String(url || '').split('?')[0].match(/\.([a-z0-9]+)$/i)?.[1] || '').toLowerCase();
    switch (ext) {
        case 'png': return 'image/png';
        case 'jpg':
        case 'jpeg': return 'image/jpeg';
        case 'gif': return 'image/gif';
        case 'svg': return 'image/svg+xml';
        case 'avif': return 'image/avif';
        case 'webp': return 'image/webp';
        default: return 'image/png';
    }
}

// Only generated 1200x630 OG images get explicit dimensions; arbitrary cover
// images do not, so we never advertise wrong width/height.
function isFixedSizeOgImage(url) {
    return /\/og-images?\//i.test(url) || /og-default/i.test(url);
}

// ---------------------------------------------------------------------------
// Metadata fetch / fallback
// ---------------------------------------------------------------------------
/**
 * Fetch SEO metadata JSON from the API (cached, graceful degradation).
 * @returns {Promise<object|null>}
 */
export async function fetchSeoMetadata({ apiBaseUrl, type, identifier, headers = {}, timeout = 10000 }) {
    const cacheKey = `${type}:${identifier}`;
    const cached = getCached(metaCache, cacheKey);
    if (cached !== undefined) return cached;

    const apiUrl = `${apiBaseUrl}/seo/${type}/${identifier}`;
    try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeout);
        const res = await fetch(apiUrl, {
            headers: { 'User-Agent': 'DevCommunity-SEO-Server/1.0', ...headers },
            signal: controller.signal,
        });
        clearTimeout(timer);
        const contentType = res.headers.get('content-type') || '';
        if (!res.ok || !contentType.includes('application/json')) return staleOr(metaCache, cacheKey, null);
        const data = await res.json();
        if (data && typeof data === 'object') {
            setCached(metaCache, cacheKey, data);
            return data;
        }
        return staleOr(metaCache, cacheKey, null);
    } catch {
        return staleOr(metaCache, cacheKey, null);
    }
}

/** Fetch arbitrary text (sitemap/llms) from the API, cached with stale fallback. */
export async function fetchText({ url, headers = {}, timeout = 10000 }) {
    const cached = getCached(textCache, url);
    if (cached !== undefined) return cached;
    try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeout);
        const res = await fetch(url, {
            headers: { 'User-Agent': 'DevCommunity-SEO-Server/1.0', ...headers },
            signal: controller.signal,
        });
        clearTimeout(timer);
        if (!res.ok) return staleOr(textCache, url, null);
        const body = await res.text();
        setCached(textCache, url, body);
        return body;
    } catch {
        return staleOr(textCache, url, null);
    }
}

function staleOr(cache, key, fallback) {
    const hit = cache.get(key);
    return hit ? hit.data : fallback;
}

export function getFallbackMetadata({ baseUrl, siteName = 'DevCommunity' }) {
    const description = `${siteName} - Where Developers Build the Future`;
    return {
        title: siteName,
        description,
        url: baseUrl,
        type: 'website',
        openGraph: {
            'og:type': 'website', 'og:url': baseUrl, 'og:title': siteName,
            'og:description': description, 'og:site_name': siteName, 'og:locale': 'en_US',
        },
        twitter: {
            'twitter:card': 'summary_large_image', 'twitter:url': baseUrl,
            'twitter:title': siteName, 'twitter:description': description,
        },
    };
}

// ---------------------------------------------------------------------------
// Meta tag injection
// ---------------------------------------------------------------------------
/**
 * Inject SEO/OG/Twitter/JSON-LD tags into an HTML document.
 * @param {string} html
 * @param {object} metadata  API metadata (or fallback)
 * @param {object} ctx  { baseUrl, currentPath, host }
 */
export function injectMetaTags(html, metadata, { baseUrl, currentPath = '', host = '' }) {
    if (!metadata || typeof metadata !== 'object') return html;

    const openGraph = metadata.openGraph || {};
    const twitter = metadata.twitter || {};
    const meta = metadata.meta || {};

    const title = openGraph['og:title'] || metadata.title || 'DevCommunity';
    const description = openGraph['og:description'] || metadata.description || '';
    const keywords = meta.keywords || metadata.keywords;

    let url = openGraph['og:url'] || metadata.url || `${baseUrl}${currentPath}`;
    url = fixLocalhostUrl(ensureAbsoluteUrl(url, baseUrl), host);

    let image = openGraph['og:image'] || twitter['twitter:image'] || metadata.image;
    if (image) image = fixLocalhostUrl(ensureAbsoluteUrl(image, baseUrl), host);

    const type = openGraph['og:type'] || metadata.type || 'website';
    const siteName = openGraph['og:site_name'] || 'DevCommunity';
    const locale = openGraph['og:locale'] || 'en_US';

    const twitterCard = twitter['twitter:card'] || 'summary_large_image';
    let twitterUrl = fixLocalhostUrl(ensureAbsoluteUrl(twitter['twitter:url'] || url, baseUrl), host);
    const twitterTitle = twitter['twitter:title'] || title;
    const twitterDescription = twitter['twitter:description'] || description;
    let twitterImage = twitter['twitter:image'] || image;
    if (twitterImage) twitterImage = fixLocalhostUrl(ensureAbsoluteUrl(twitterImage, baseUrl), host);

    const author = openGraph['article:author'] || metadata.author;
    const publishedTime = openGraph['article:published_time'] || metadata.publishedTime;
    const modifiedTime = openGraph['article:modified_time'] || metadata.modifiedTime;

    const imageBlock = image ? `
    <meta property="og:image" content="${escapeHtml(image)}">
    <meta property="og:image:secure_url" content="${escapeHtml(image)}">${isFixedSizeOgImage(image) ? `
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">` : ''}
    <meta property="og:image:type" content="${escapeHtml(imageMimeFromUrl(image))}">
    <meta property="og:image:alt" content="${escapeHtml(title)}">` : '';

    const metaTags = `
    <!-- Primary Meta Tags -->
    <title>${escapeHtml(title)}</title>
    <meta name="title" content="${escapeHtml(title)}">
    ${description ? `<meta name="description" content="${escapeHtml(description)}">` : ''}
    ${keywords ? `<meta name="keywords" content="${escapeHtml(keywords)}">` : ''}

    <!-- Canonical URL -->
    <link rel="canonical" href="${escapeHtml(url)}">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="${escapeHtml(type)}">
    <meta property="og:url" content="${escapeHtml(url)}">
    <meta property="og:title" content="${escapeHtml(title)}">
    ${description ? `<meta property="og:description" content="${escapeHtml(description)}">` : ''}${imageBlock}
    <meta property="og:site_name" content="${escapeHtml(siteName)}">
    <meta property="og:locale" content="${escapeHtml(locale)}">
    ${author ? `<meta property="article:author" content="${escapeHtml(author)}">` : ''}
    ${publishedTime ? `<meta property="article:published_time" content="${escapeHtml(publishedTime)}">` : ''}
    ${modifiedTime ? `<meta property="article:modified_time" content="${escapeHtml(modifiedTime)}">` : ''}

    <!-- Twitter -->
    <meta name="twitter:card" content="${escapeHtml(twitterCard)}">
    <meta name="twitter:url" content="${escapeHtml(twitterUrl)}">
    <meta name="twitter:title" content="${escapeHtml(twitterTitle)}">
    ${twitterDescription ? `<meta name="twitter:description" content="${escapeHtml(twitterDescription)}">` : ''}
    ${twitterImage ? `<meta name="twitter:image" content="${escapeHtml(twitterImage)}">` : ''}
    ${twitter['twitter:site'] ? `<meta name="twitter:site" content="${escapeHtml(twitter['twitter:site'])}">` : ''}
    ${twitter['twitter:creator'] ? `<meta name="twitter:creator" content="${escapeHtml(twitter['twitter:creator'])}">` : ''}
    `;

    const jsonLd = metadata.jsonLd ? `
    <!-- JSON-LD Structured Data -->
    <script type="application/ld+json">
    ${JSON.stringify(metadata.jsonLd)}
    </script>
    ` : '';

    // Remove pre-existing SEO tags so we never duplicate them
    html = html.replace(/<meta\s+[^>]*(?:property|name)\s*=\s*["'](?:og:|twitter:)[^"']*["'][^>]*>/gi, '');
    html = html.replace(/<title[^>]*>.*?<\/title>/gis, '');
    html = html.replace(/<meta\s+[^>]*name\s*=\s*["'](?:description|title|keywords)["'][^>]*>/gi, '');
    html = html.replace(/<link\s+[^>]*rel\s*=\s*["']canonical["'][^>]*>/gi, '');
    html = html.replace(/<script\s+[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>.*?<\/script>/gis, '');

    if (html.includes('</head>')) {
        html = html.replace('</head>', `${metaTags}${jsonLd}\n    </head>`);
    } else {
        html = html.replace(/<body[^>]*>/i, `${metaTags}${jsonLd}\n    <body>`);
    }
    return html;
}

// ---------------------------------------------------------------------------
// robots.txt
// ---------------------------------------------------------------------------
export function buildRobotsTxt({ baseUrl }) {
    const root = (baseUrl || 'https://devcommunity.io').replace(/\/+$/, '');
    const aiBlocks = AI_CRAWLERS.map((bot) => `User-agent: ${bot}\nAllow: /`).join('\n\n');
    return `# robots.txt — DevCommunity
# Search engines and AI crawlers are welcome to index public content.

User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/
Disallow: /settings

# Explicitly allow AI / LLM crawlers
${aiBlocks}

Sitemap: ${root}/sitemap.xml
# AI guide: ${root}/llms.txt
`;
}
