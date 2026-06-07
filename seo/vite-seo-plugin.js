import { readFileSync } from 'fs';
import { resolve } from 'path';
import {
    SEO_ROUTE_TYPES,
    resolveApiBaseUrl,
    fetchSeoMetadata,
    fetchText,
    getFallbackMetadata,
    injectMetaTags,
    buildRobotsTxt,
} from './seo-core.js';

/**
 * Vite dev plugin that mirrors the production SEO server (server.js) so the Vite
 * dev server (:3351) serves dynamic SEO + robots.txt / sitemap.xml / llms.txt.
 *
 * Without this, /post/:slug on the dev server returns the static index.html with
 * generic meta — which is exactly the confusion that started this work.
 */
export function seoDevPlugin(env = {}) {
    return {
        name: 'devcommunity-seo-dev',
        apply: 'serve',
        configureServer(server) {
            const root = server.config.root;
            const apiBaseUrl = resolveApiBaseUrl(env);
            const siteName = env.VITE_SITE_NAME || env.SITE_NAME || 'DevCommunity';

            const publicHostOf = (req) => {
                const forwarded = req.headers['x-forwarded-host'];
                if (forwarded) return String(forwarded).split(',')[0].trim();
                return req.headers.host || 'localhost';
            };
            const baseUrlOf = (req) => {
                const host = publicHostOf(req);
                const proto = req.headers['x-forwarded-proto'] || 'http';
                return `${proto}://${host}`;
            };
            const fwd = (req) => {
                const host = publicHostOf(req);
                if (!host) return {};
                return {
                    'x-forwarded-host': host,
                    'x-forwarded-proto': req.headers['x-forwarded-proto'] || 'http',
                };
            };

            server.middlewares.use(async (req, res, next) => {
                try {
                    const pathname = new URL(req.url, 'http://localhost').pathname;

                    if (pathname === '/robots.txt') {
                        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
                        return res.end(buildRobotsTxt({ baseUrl: baseUrlOf(req) }));
                    }
                    if (pathname === '/sitemap.xml') {
                        const xml = await fetchText({ url: `${apiBaseUrl}/seo/sitemap.xml`, headers: fwd(req) });
                        res.setHeader('Content-Type', 'application/xml; charset=utf-8');
                        return res.end(xml || '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
                    }
                    if (pathname === '/llms.txt') {
                        const txt = await fetchText({ url: `${apiBaseUrl}/seo/llms.txt`, headers: fwd(req) });
                        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
                        return res.end(txt || `# ${siteName}\n`);
                    }

                    // SEO content routes: /<prefix>/<slug>
                    const match = pathname.match(/^\/([^/]+)\/([^/]+)\/?$/);
                    if (match && SEO_ROUTE_TYPES[match[1]]) {
                        const type = SEO_ROUTE_TYPES[match[1]];
                        const identifier = decodeURIComponent(match[2]);

                        let template = readFileSync(resolve(root, 'index.html'), 'utf-8');
                        // Apply Vite's HTML transforms so the SPA still boots (HMR, @vite/client …)
                        template = await server.transformIndexHtml(req.url, template, req.originalUrl);

                        const publicHost = publicHostOf(req);
                        const metadata = await fetchSeoMetadata({
                            apiBaseUrl: resolveApiBaseUrl(env, publicHost) || apiBaseUrl,
                            type,
                            identifier,
                            headers: fwd(req),
                        });
                        const baseUrl = baseUrlOf(req);
                        const html = injectMetaTags(
                            template,
                            metadata || getFallbackMetadata({ baseUrl, siteName, currentPath: pathname }),
                            { baseUrl, currentPath: pathname, host: publicHost }
                        );
                        res.setHeader('Content-Type', 'text/html; charset=utf-8');
                        return res.end(html);
                    }
                } catch {
                    // On any failure, let Vite handle the request normally
                }
                return next();
            });
        },
    };
}
