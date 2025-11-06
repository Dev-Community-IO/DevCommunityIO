import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5173;
const API_URL = process.env.VITE_API_URL || 'http://localhost:3333/api';

// Serve static files from dist directory
app.use(express.static(join(__dirname, 'dist')));

/**
 * Check if request is from a social media crawler
 */
function isCrawler(userAgent) {
    if (!userAgent) return false;
    const ua = userAgent.toLowerCase();
    return ua.includes('facebookexternalhit') ||
        ua.includes('twitterbot') ||
        ua.includes('linkedinbot') ||
        ua.includes('whatsapp') ||
        ua.includes('telegrambot') ||
        ua.includes('slackbot') ||
        ua.includes('discordbot') ||
        ua.includes('googlebot') ||
        ua.includes('bingbot') ||
        ua.includes('crawler') ||
        ua.includes('bot') ||
        ua.includes('prerender') ||
        ua.includes('headless');
}

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
        .replace(/'/g, '&#039;');
}

/**
 * Inject SEO meta tags into HTML
 */
function injectMetaTags(html, metadata) {
    const meta = metadata.meta || metadata;
    const openGraph = metadata.openGraph || {};
    const twitter = metadata.twitter || {};

    const ogImage = metadata.image || openGraph['og:image'] || '';
    const ogTitle = openGraph['og:title'] || meta.title || metadata.title || 'DevCommunity';
    const ogDescription = openGraph['og:description'] || meta.description || metadata.description || '';
    const ogUrl = openGraph['og:url'] || metadata.url || '';
    const ogType = openGraph['og:type'] || metadata.type || 'website';
    const siteName = openGraph['og:site_name'] || 'DevCommunity';
    const canonicalUrl = metadata.url || ogUrl;
    const twitterCard = twitter['twitter:card'] || 'summary_large_image';
    const twitterTitle = twitter['twitter:title'] || ogTitle;
    const twitterDescription = twitter['twitter:description'] || ogDescription;
    const twitterImage = twitter['twitter:image'] || ogImage;
    const pageTitle = meta.title || metadata.title || ogTitle;
    const pageDescription = meta.description || metadata.description || ogDescription;
    const keywords = meta.keywords || metadata.keywords;
    const author = metadata.author;
    const publishedTime = metadata.publishedTime;
    const modifiedTime = metadata.modifiedTime;

    // Build meta tags HTML
    let metaTags = `
    <!-- Primary Meta Tags -->
    <title>${escapeHtml(pageTitle)}</title>
    <meta name="title" content="${escapeHtml(pageTitle)}">
    <meta name="description" content="${escapeHtml(pageDescription)}">
    ${keywords ? `<meta name="keywords" content="${escapeHtml(keywords)}">` : ''}
    
    <!-- Canonical URL -->
    <link rel="canonical" href="${escapeHtml(canonicalUrl)}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="${escapeHtml(ogType)}">
    <meta property="og:url" content="${escapeHtml(ogUrl)}">
    <meta property="og:title" content="${escapeHtml(ogTitle)}">
    <meta property="og:description" content="${escapeHtml(ogDescription)}">
    ${ogImage && ogImage.trim() !== '' ? `<meta property="og:image" content="${escapeHtml(ogImage)}">` : ''}
    ${ogImage && ogImage.trim() !== '' ? `<meta property="og:image:secure_url" content="${escapeHtml(ogImage)}">` : ''}
    ${ogImage && ogImage.trim() !== '' ? `<meta property="og:image:width" content="1200">` : ''}
    ${ogImage && ogImage.trim() !== '' ? `<meta property="og:image:height" content="630">` : ''}
    ${ogImage && ogImage.trim() !== '' ? `<meta property="og:image:type" content="image/png">` : ''}
    <meta property="og:site_name" content="${escapeHtml(siteName)}">
    ${author ? `<meta property="article:author" content="${escapeHtml(author)}">` : ''}
    ${publishedTime ? `<meta property="article:published_time" content="${escapeHtml(publishedTime)}">` : ''}
    ${modifiedTime ? `<meta property="article:modified_time" content="${escapeHtml(modifiedTime)}">` : ''}
    
    <!-- Twitter -->
    <meta name="twitter:card" content="${escapeHtml(twitterCard)}">
    <meta name="twitter:url" content="${escapeHtml(ogUrl)}">
    <meta name="twitter:title" content="${escapeHtml(twitterTitle)}">
    <meta name="twitter:description" content="${escapeHtml(twitterDescription)}">
    ${twitterImage && twitterImage.trim() !== '' ? `<meta name="twitter:image" content="${escapeHtml(twitterImage)}">` : ''}
    `;

    // Replace the default meta tags in the head
    // Remove existing og: and twitter: meta tags
    html = html.replace(/<meta\s+property=["']og:[^"']*["'][^>]*>/gi, '');
    html = html.replace(/<meta\s+name=["']twitter:[^"']*["'][^>]*>/gi, '');
    html = html.replace(/<title>.*?<\/title>/i, '');
    html = html.replace(/<meta\s+name=["']description["'][^>]*>/i, '');
    html = html.replace(/<link\s+rel=["']canonical["'][^>]*>/i, '');

    // Insert new meta tags before closing </head>
    html = html.replace('</head>', `${metaTags}\n    </head>`);

    return html;
}

/**
 * Fetch SEO metadata from API
 */
async function fetchSeoMetadata(type, identifier) {
    try {
        const response = await axios.get(`${API_URL}/seo/${type}/${identifier}`, {
            headers: {
                'User-Agent': 'DevCommunity-SEO-Server/1.0'
            },
            timeout: 5000
        });
        return response.data;
    } catch (error) {
        console.error(`[SEO Server] Failed to fetch SEO metadata for ${type}/${identifier}:`, error.message);
        return null;
    }
}

/**
 * Handle SEO routes for crawlers
 */
app.get('/post/:slug', async (req, res) => {
    const userAgent = req.get('user-agent') || '';
    const isBot = isCrawler(userAgent);

    if (isBot) {
        console.log(`[SEO Server] Crawler detected: ${userAgent} for /post/${req.params.slug}`);

        try {
            // Fetch SEO metadata from API
            const metadata = await fetchSeoMetadata('posts', req.params.slug);

            if (metadata) {
                // Read the index.html file
                const htmlPath = join(__dirname, 'dist', 'index.html');
                let html = readFileSync(htmlPath, 'utf-8');

                // Inject meta tags
                html = injectMetaTags(html, metadata);

                res.setHeader('Content-Type', 'text/html');
                return res.send(html);
            }
        } catch (error) {
            console.error(`[SEO Server] Error processing SEO for /post/${req.params.slug}:`, error);
        }
    }

    // For non-crawlers or if SEO fetch fails, serve normal HTML
    const htmlPath = join(__dirname, 'dist', 'index.html');
    res.sendFile(htmlPath);
});

app.get('/pages/:slug', async (req, res) => {
    const userAgent = req.get('user-agent') || '';
    const isBot = isCrawler(userAgent);

    if (isBot) {
        console.log(`[SEO Server] Crawler detected: ${userAgent} for /pages/${req.params.slug}`);

        try {
            const metadata = await fetchSeoMetadata('pages', req.params.slug);

            if (metadata) {
                const htmlPath = join(__dirname, 'dist', 'index.html');
                let html = readFileSync(htmlPath, 'utf-8');
                html = injectMetaTags(html, metadata);
                res.setHeader('Content-Type', 'text/html');
                return res.send(html);
            }
        } catch (error) {
            console.error(`[SEO Server] Error processing SEO for /pages/${req.params.slug}:`, error);
        }
    }

    const htmlPath = join(__dirname, 'dist', 'index.html');
    res.sendFile(htmlPath);
});

app.get('/hackathons/:slug', async (req, res) => {
    const userAgent = req.get('user-agent') || '';
    const isBot = isCrawler(userAgent);

    if (isBot) {
        console.log(`[SEO Server] Crawler detected: ${userAgent} for /hackathons/${req.params.slug}`);

        try {
            const metadata = await fetchSeoMetadata('hackathons', req.params.slug);

            if (metadata) {
                const htmlPath = join(__dirname, 'dist', 'index.html');
                let html = readFileSync(htmlPath, 'utf-8');
                html = injectMetaTags(html, metadata);
                res.setHeader('Content-Type', 'text/html');
                return res.send(html);
            }
        } catch (error) {
            console.error(`[SEO Server] Error processing SEO for /hackathons/${req.params.slug}:`, error);
        }
    }

    const htmlPath = join(__dirname, 'dist', 'index.html');
    res.sendFile(htmlPath);
});

app.get('/events/:slug', async (req, res) => {
    const userAgent = req.get('user-agent') || '';
    const isBot = isCrawler(userAgent);

    if (isBot) {
        console.log(`[SEO Server] Crawler detected: ${userAgent} for /events/${req.params.slug}`);

        try {
            const metadata = await fetchSeoMetadata('events', req.params.slug);

            if (metadata) {
                const htmlPath = join(__dirname, 'dist', 'index.html');
                let html = readFileSync(htmlPath, 'utf-8');
                html = injectMetaTags(html, metadata);
                res.setHeader('Content-Type', 'text/html');
                return res.send(html);
            }
        } catch (error) {
            console.error(`[SEO Server] Error processing SEO for /events/${req.params.slug}:`, error);
        }
    }

    const htmlPath = join(__dirname, 'dist', 'index.html');
    res.sendFile(htmlPath);
});

app.get('/opportunities/:slug', async (req, res) => {
    const userAgent = req.get('user-agent') || '';
    const isBot = isCrawler(userAgent);

    if (isBot) {
        console.log(`[SEO Server] Crawler detected: ${userAgent} for /opportunities/${req.params.slug}`);

        try {
            const metadata = await fetchSeoMetadata('opportunities', req.params.slug);

            if (metadata) {
                const htmlPath = join(__dirname, 'dist', 'index.html');
                let html = readFileSync(htmlPath, 'utf-8');
                html = injectMetaTags(html, metadata);
                res.setHeader('Content-Type', 'text/html');
                return res.send(html);
            }
        } catch (error) {
            console.error(`[SEO Server] Error processing SEO for /opportunities/${req.params.slug}:`, error);
        }
    }

    const htmlPath = join(__dirname, 'dist', 'index.html');
    res.sendFile(htmlPath);
});

// Catch all other routes and serve index.html (for client-side routing)
app.get('*', (req, res) => {
    const htmlPath = join(__dirname, 'dist', 'index.html');
    res.sendFile(htmlPath);
});

app.listen(PORT, () => {
    console.log(`[SEO Server] Server running on port ${PORT}`);
    console.log(`[SEO Server] API URL: ${API_URL}`);
});

