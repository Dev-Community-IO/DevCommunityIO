import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || process.env.VITE_PORT || 3000;
const API_URL = process.env.VITE_API_URL || 'http://localhost:3333/api';

// Trust proxy for proper protocol detection
app.set('trust proxy', true);

// In-memory cache for SEO metadata (TTL: 1 hour)
const seoCache = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
    if (!text) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
        .replace(/[\u{1F600}-\u{1F6FF}]/gu, '') // Remove emojis
        .replace(/[\u2018\u2019]/g, "'") // Smart single quotes
        .replace(/[\u201C\u201D]/g, '"'); // Smart double quotes
}

/**
 * Get base URL from request
 */
function getBaseUrl(req) {
    const protocol = req.protocol || (req.secure ? 'https' : 'http');
    const host = req.get('host') || 'localhost:3000';
    return `${protocol}://${host}`;
}

/**
 * Ensure URL is absolute (HTTPS preferred)
 */
function ensureAbsoluteUrl(url, baseUrl) {
    if (!url) return baseUrl;
    if (/^https?:\/\//i.test(url)) {
        return url.replace(/^http:\/\//i, 'https://');
    }
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
}

/**
 * Fix localhost URLs in production
 */
function fixLocalhostUrl(url, req, baseUrl) {
    if (!url || !url.includes('localhost:3333')) return url;
    const host = req.get('host') || baseUrl.replace(/^https?:\/\//, '').split(':')[0] || 'devcommunity.io';
    return url.replace('localhost:3333', host).replace(/^http:\/\//, 'https://');
}

/**
 * Fetch SEO metadata from API with caching
 */
async function fetchSeoMetadata(type, identifier, req) {
    const cacheKey = `${type}:${identifier}`;
    const apiUrl = `${API_URL}/seo/${type}/${identifier}`;

    // Check cache
    const cached = seoCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
        return cached.data;
    }

    try {
        // Pass original request hostname to API for correct URL generation
        const headers = { 'User-Agent': 'DevCommunity-SEO-Server/1.0' };
        if (req) {
            const host = req.get('host');
            const protocol = req.protocol || (req.secure ? 'https' : 'http');
            if (host) {
                headers['x-forwarded-host'] = host;
                headers['x-forwarded-proto'] = protocol;
            }
        }

        const response = await axios.get(apiUrl, { headers, timeout: 10000 });
        const data = response.data || null;

        if (data) {
            seoCache.set(cacheKey, { data, timestamp: Date.now() });
        }

        return data;
    } catch (error) {
        // Return stale cache if available (graceful degradation)
        if (cached) {
            return cached.data;
        }

        // Log error only in development
        if (process.env.NODE_ENV !== 'production') {
            console.error(`[SEO] Error fetching metadata for ${type}/${identifier}:`, error.message);
        }

        return null;
    }
}

/**
 * Get minimal fallback SEO metadata (dynamic based on request)
 */
function getFallbackMetadata(req) {
    const baseUrl = getBaseUrl(req);
    const siteName = process.env.SITE_NAME || 'DevCommunity';

    return {
        title: siteName,
        description: `${siteName} - Where Developers Build the Future`,
        url: baseUrl,
        type: 'website',
        openGraph: {
            'og:type': 'website',
            'og:url': baseUrl,
            'og:title': siteName,
            'og:description': `${siteName} - Where Developers Build the Future`,
            'og:site_name': siteName,
            'og:locale': 'en_US',
        },
        twitter: {
            'twitter:card': 'summary_large_image',
            'twitter:url': baseUrl,
            'twitter:title': siteName,
            'twitter:description': `${siteName} - Where Developers Build the Future`,
        },
    };
}

/**
 * Inject SEO meta tags into HTML
 */
function injectMetaTags(html, metadata, req) {
    if (!metadata || typeof metadata !== 'object') {
        return html;
    }

    const baseUrl = getBaseUrl(req);
    const currentPath = req.originalUrl || req.url || '';

    // Extract values - prioritize API response structure
    const openGraph = metadata.openGraph || {};
    const twitter = metadata.twitter || {};
    const meta = metadata.meta || {};

    // Title, description, keywords
    const title = openGraph['og:title'] || metadata.title || 'DevCommunity';
    const description = openGraph['og:description'] || metadata.description || '';
    const keywords = meta.keywords || metadata.keywords;

    // URL - fix localhost if present
    let url = openGraph['og:url'] || metadata.url || `${baseUrl}${currentPath}`;
    url = ensureAbsoluteUrl(url, baseUrl);
    url = fixLocalhostUrl(url, req, baseUrl);

    // Image - fix localhost if present
    let image = openGraph['og:image'] || twitter['twitter:image'] || metadata.image;
    if (image) {
        image = ensureAbsoluteUrl(image, baseUrl);
        image = fixLocalhostUrl(image, req, baseUrl);
    }

    // Type and site info
    const type = openGraph['og:type'] || metadata.type || 'website';
    const siteName = openGraph['og:site_name'] || process.env.SITE_NAME || 'DevCommunity';
    const locale = openGraph['og:locale'] || 'en_US';

    // Twitter fields
    const twitterCard = twitter['twitter:card'] || 'summary_large_image';
    let twitterUrl = twitter['twitter:url'] || url;
    twitterUrl = ensureAbsoluteUrl(twitterUrl, baseUrl);
    twitterUrl = fixLocalhostUrl(twitterUrl, req, baseUrl);
    const twitterTitle = twitter['twitter:title'] || title;
    const twitterDescription = twitter['twitter:description'] || description;
    let twitterImage = twitter['twitter:image'] || image;
    if (twitterImage) {
        twitterImage = ensureAbsoluteUrl(twitterImage, baseUrl);
        twitterImage = fixLocalhostUrl(twitterImage, req, baseUrl);
    }

    // Article fields
    const author = openGraph['article:author'] || metadata.author;
    const publishedTime = openGraph['article:published_time'] || metadata.publishedTime;
    const modifiedTime = openGraph['article:modified_time'] || metadata.modifiedTime;

    // Build meta tags
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
    ${description ? `<meta property="og:description" content="${escapeHtml(description)}">` : ''}
    ${image ? `<meta property="og:image" content="${escapeHtml(image)}">
    <meta property="og:image:secure_url" content="${escapeHtml(image)}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:type" content="image/png">
    <meta property="og:image:alt" content="${escapeHtml(title)}">` : ''}
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

    // Add JSON-LD if available
    const jsonLd = metadata.jsonLd ? `
    <!-- JSON-LD Structured Data -->
    <script type="application/ld+json">
    ${JSON.stringify(metadata.jsonLd)}
    </script>
    ` : '';

    // Remove existing SEO meta tags
    html = html.replace(/<meta\s+[^>]*(?:property|name)\s*=\s*["'](?:og:|twitter:)[^"']*["'][^>]*>/gi, '');
    html = html.replace(/<meta\s+[^>]*(?:property|name)\s*=\s*['"](?:og:|twitter:)[^'"]*['"][^>]*>/gi, '');
    html = html.replace(/<title[^>]*>.*?<\/title>/gis, '');
    html = html.replace(/<meta\s+[^>]*name\s*=\s*["']description["'][^>]*>/gi, '');
    html = html.replace(/<meta\s+[^>]*name\s*=\s*['"]description['"][^>]*>/gi, '');
    html = html.replace(/<meta\s+[^>]*name\s*=\s*["']title["'][^>]*>/gi, '');
    html = html.replace(/<meta\s+[^>]*name\s*=\s*['"]title['"][^>]*>/gi, '');
    html = html.replace(/<link\s+[^>]*rel\s*=\s*["']canonical["'][^>]*>/gi, '');
    html = html.replace(/<link\s+[^>]*rel\s*=\s*['"]canonical['"][^>]*>/gi, '');
    html = html.replace(/<script\s+[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>.*?<\/script>/gis, '');
    html = html.replace(/<script\s+[^>]*type\s*=\s*['"]application\/ld\+json['"][^>]*>.*?<\/script>/gis, '');

    // Insert new meta tags before closing </head>
    if (html.includes('</head>')) {
        html = html.replace('</head>', `${metaTags}${jsonLd}\n    </head>`);
    } else {
        html = html.replace(/<\/head>/i, `${metaTags}${jsonLd}\n    </head>`);
        if (!html.includes('</head>')) {
            html = html.replace(/<body[^>]*>/i, `${metaTags}${jsonLd}\n    </head>\n    <body>`);
        }
    }

    return html;
}

/**
 * Handle SEO route
 */
async function handleSeoRoute(req, res, type) {
    const identifier = req.params.slug || req.params.id;

    try {
        const metadata = await fetchSeoMetadata(type, identifier, req);
        const htmlPath = join(__dirname, 'dist', 'index.html');
        let html = readFileSync(htmlPath, 'utf-8');

        if (metadata) {
            html = injectMetaTags(html, metadata, req);
        } else {
            // Use minimal fallback
            const fallback = getFallbackMetadata(req);
            html = injectMetaTags(html, fallback, req);
        }

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
        res.setHeader('X-Content-Type-Options', 'nosniff');

        return res.send(html);
    } catch (error) {
        // Fallback: serve HTML with minimal metadata
        try {
            const htmlPath = join(__dirname, 'dist', 'index.html');
            let html = readFileSync(htmlPath, 'utf-8');
            const fallback = getFallbackMetadata(req);
            html = injectMetaTags(html, fallback, req);

            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.setHeader('Cache-Control', 'public, max-age=300');
            return res.send(html);
        } catch (fallbackError) {
            // Last resort: serve plain HTML
            const htmlPath = join(__dirname, 'dist', 'index.html');
            res.sendFile(htmlPath);
        }
    }
}

// SEO Routes - Handle both with and without trailing slashes
const seoRoutes = [
    ['/post/:slug', 'posts'],
    ['/post/:slug/', 'posts'],
    ['/pages/:slug', 'pages'],
    ['/pages/:slug/', 'pages'],
    ['/hackathons/:slug', 'hackathons'],
    ['/hackathons/:slug/', 'hackathons'],
    ['/events/:slug', 'events'],
    ['/events/:slug/', 'events'],
    ['/opportunities/:slug', 'opportunities'],
    ['/opportunities/:slug/', 'opportunities'],
];

seoRoutes.forEach(([route, type]) => {
    app.get(route, (req, res) => handleSeoRoute(req, res, type));
});

// Serve static files AFTER SEO routes (so SEO routes take precedence)
app.use(express.static(join(__dirname, 'dist')));

// Catch all other routes - serve index.html for SPA routing
app.get('*', (req, res) => {
    const htmlPath = join(__dirname, 'dist', 'index.html');
    res.sendFile(htmlPath);
});

app.listen(PORT, () => {
    console.log(`[SEO Server] Running on port ${PORT}`);
    console.log(`[SEO Server] API: ${API_URL}`);
});
