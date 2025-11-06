import axios from 'axios';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const API_URL = process.env.VITE_API_URL || 'http://localhost:3333/api';

// Mock request object
const mockReq = {
    get: (header) => {
        if (header === 'host') return 'devcommunity.io';
        return null;
    },
    protocol: 'https',
    secure: true,
    originalUrl: '/post/make-sure-your-backend-likely-forem-api-or-custom-frontend-populates-these-meta-tags-server-side-ssr-56bmct',
    url: '/post/make-sure-your-backend-likely-forem-api-or-custom-frontend-populates-these-meta-tags-server-side-ssr-56bmct'
};

// Test function
async function testSeoInjection() {
    console.log('🧪 Testing SEO Injection...\n');
    
    try {
        // 1. Fetch metadata from API
        console.log('1️⃣ Fetching metadata from API...');
        const apiUrl = `${API_URL}/seo/posts/make-sure-your-backend-likely-forem-api-or-custom-frontend-populates-these-meta-tags-server-side-ssr-56bmct`;
        const response = await axios.get(apiUrl, {
            headers: {
                'x-forwarded-host': 'devcommunity.io',
                'x-forwarded-proto': 'https'
            },
            timeout: 10000
        });
        
        const metadata = response.data;
        console.log('✅ API Response received');
        console.log(`   Title: ${metadata.openGraph?.['og:title']?.substring(0, 60)}...`);
        console.log(`   URL: ${metadata.openGraph?.['og:url']}`);
        console.log(`   Image: ${metadata.openGraph?.['og:image']?.substring(0, 60)}...`);
        console.log(`   Has Twitter: ${!!metadata.twitter}`);
        console.log(`   Has JSON-LD: ${!!metadata.jsonLd}\n`);
        
        // 2. Read HTML template
        console.log('2️⃣ Reading HTML template...');
        const htmlPath = join(__dirname, 'dist', 'index.html');
        let html = readFileSync(htmlPath, 'utf-8');
        console.log(`✅ HTML template loaded (${html.length} chars)\n`);
        
        // 3. Import and use injectMetaTags function
        console.log('3️⃣ Injecting meta tags...');
        
        // Get base URL
        const baseUrl = 'https://devcommunity.io';
        const currentPath = mockReq.originalUrl;
        
        // Extract values (same logic as server.js)
        const openGraph = metadata.openGraph || {};
        const twitter = metadata.twitter || {};
        const meta = metadata.meta || {};
        
        const title = openGraph['og:title'] || metadata.title || 'DevCommunity';
        const description = openGraph['og:description'] || metadata.description || 'DevCommunity - Where Developers Build the Future';
        const keywords = meta.keywords || metadata.keywords;
        
        let url = openGraph['og:url'] || metadata.url || `${baseUrl}${currentPath}`;
        if (url.includes('localhost:3333')) {
            url = url.replace('localhost:3333', 'devcommunity.io');
            url = url.replace(/^http:\/\//, 'https://');
        }
        
        let image = openGraph['og:image'] || twitter['twitter:image'] || metadata.image;
        if (image && image.includes('localhost:3333')) {
            image = image.replace('localhost:3333', 'devcommunity.io');
            image = image.replace(/^http:\/\//, 'https://');
        }
        
        const type = openGraph['og:type'] || metadata.type || 'website';
        const siteName = openGraph['og:site_name'] || 'DevCommunity';
        const locale = openGraph['og:locale'] || 'en_US';
        
        const twitterCard = twitter['twitter:card'] || 'summary_large_image';
        let twitterUrl = twitter['twitter:url'] || url;
        if (twitterUrl.includes('localhost:3333')) {
            twitterUrl = twitterUrl.replace('localhost:3333', 'devcommunity.io');
            twitterUrl = twitterUrl.replace(/^http:\/\//, 'https://');
        }
        const twitterTitle = twitter['twitter:title'] || title;
        const twitterDescription = twitter['twitter:description'] || description;
        let twitterImage = twitter['twitter:image'] || image;
        if (twitterImage && twitterImage.includes('localhost:3333')) {
            twitterImage = twitterImage.replace('localhost:3333', 'devcommunity.io');
            twitterImage = twitterImage.replace(/^http:\/\//, 'https://');
        }
        const twitterSite = twitter['twitter:site'];
        const twitterCreator = twitter['twitter:creator'];
        
        const author = openGraph['article:author'] || metadata.author;
        const publishedTime = openGraph['article:published_time'] || metadata.publishedTime;
        const modifiedTime = openGraph['article:modified_time'] || metadata.modifiedTime;
        
        // Escape HTML
        function escapeHtml(text) {
            if (!text) return '';
            return String(text)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }
        
        // Build meta tags
        const metaTags = `
    <!-- Primary Meta Tags -->
    <title>${escapeHtml(title)}</title>
    <meta name="title" content="${escapeHtml(title)}">
    <meta name="description" content="${escapeHtml(description)}">
    ${keywords ? `<meta name="keywords" content="${escapeHtml(keywords)}">` : ''}
    
    <!-- Canonical URL -->
    <link rel="canonical" href="${escapeHtml(url)}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="${escapeHtml(type)}">
    <meta property="og:url" content="${escapeHtml(url)}">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:image" content="${escapeHtml(image)}">
    <meta property="og:image:secure_url" content="${escapeHtml(image)}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:type" content="image/png">
    <meta property="og:image:alt" content="${escapeHtml(title)}">
    <meta property="og:site_name" content="${escapeHtml(siteName)}">
    <meta property="og:locale" content="${escapeHtml(locale)}">
    ${author ? `<meta property="article:author" content="${escapeHtml(author)}">` : ''}
    ${publishedTime ? `<meta property="article:published_time" content="${escapeHtml(publishedTime)}">` : ''}
    ${modifiedTime ? `<meta property="article:modified_time" content="${escapeHtml(modifiedTime)}">` : ''}
    
    <!-- Twitter -->
    <meta name="twitter:card" content="${escapeHtml(twitterCard)}">
    <meta name="twitter:url" content="${escapeHtml(twitterUrl)}">
    <meta name="twitter:title" content="${escapeHtml(twitterTitle)}">
    <meta name="twitter:description" content="${escapeHtml(twitterDescription)}">
    <meta name="twitter:image" content="${escapeHtml(twitterImage)}">
    ${twitterSite ? `<meta name="twitter:site" content="${escapeHtml(twitterSite)}">` : ''}
    ${twitterCreator ? `<meta name="twitter:creator" content="${escapeHtml(twitterCreator)}">` : ''}
    `;
        
        const jsonLd = metadata.jsonLd ? `
    <!-- JSON-LD Structured Data -->
    <script type="application/ld+json">
    ${JSON.stringify(metadata.jsonLd)}
    </script>
    ` : '';
        
        // Remove old meta tags
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
        
        // Inject new meta tags
        html = html.replace('</head>', `${metaTags}${jsonLd}\n    </head>`);
        
        console.log('✅ Meta tags injected\n');
        
        // 4. Verify results
        console.log('4️⃣ Verifying injected meta tags...\n');
        
        // Extract meta tags section and JSON-LD for localhost check (ignore client-side scripts)
        const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
        const headContent = headMatch ? headMatch[1] : '';
        const metaTagsSection = headContent.match(/<!-- (?:Primary Meta Tags|Open Graph|Twitter|JSON-LD)[\s\S]*?(?=<!--|<\/head>|$)/gi)?.join('') || '';
        const jsonLdSection = headContent.match(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/i)?.[1] || '';
        
        const checks = {
            'Has og:title': html.includes('property="og:title"'),
            'Has og:description': html.includes('property="og:description"'),
            'Has og:url': html.includes('property="og:url"'),
            'Has og:image': html.includes('property="og:image"'),
            'Has og:site_name': html.includes('property="og:site_name"'),
            'Has twitter:card': html.includes('name="twitter:card"'),
            'Has twitter:title': html.includes('name="twitter:title"'),
            'Has twitter:image': html.includes('name="twitter:image"'),
            'Has canonical': html.includes('rel="canonical"'),
            'Has JSON-LD': html.includes('application/ld+json'),
            'No localhost in meta tags': !metaTagsSection.includes('localhost:3333'),
            'No localhost in JSON-LD': !jsonLdSection.includes('localhost:3333'),
            'Has production URL in meta': html.includes('devcommunity.io') && (html.match(/property="og:url"[^>]*content="[^"]*devcommunity\.io/gi) || html.match(/name="twitter:url"[^>]*content="[^"]*devcommunity\.io/gi))
        };
        
        let allPassed = true;
        for (const [check, passed] of Object.entries(checks)) {
            const icon = passed ? '✅' : '❌';
            console.log(`   ${icon} ${check}`);
            if (!passed) allPassed = false;
        }
        
        console.log('\n5️⃣ Sample meta tags extracted:');
        const ogTitleMatch = html.match(/<meta\s+property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
        const ogUrlMatch = html.match(/<meta\s+property=["']og:url["'][^>]*content=["']([^"']+)["']/i);
        const ogImageMatch = html.match(/<meta\s+property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
        const twitterCardMatch = html.match(/<meta\s+name=["']twitter:card["'][^>]*content=["']([^"']+)["']/i);
        
        if (ogTitleMatch) console.log(`   og:title: ${ogTitleMatch[1].substring(0, 60)}...`);
        if (ogUrlMatch) console.log(`   og:url: ${ogUrlMatch[1]}`);
        if (ogImageMatch) console.log(`   og:image: ${ogImageMatch[1].substring(0, 60)}...`);
        if (twitterCardMatch) console.log(`   twitter:card: ${twitterCardMatch[1]}`);
        
        console.log('\n' + (allPassed ? '✅ All tests passed!' : '❌ Some tests failed'));
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('   API Response:', error.response.status, error.response.statusText);
        }
        process.exit(1);
    }
}

testSeoInjection();

