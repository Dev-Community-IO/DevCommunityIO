import { useEffect } from 'react';
import { SEOMetadata, seoService } from '../services/api/seo.service';
import { updateMetaTags, resetMetaTags } from '../utils/seo';

interface UseSEOOptions {
    type: 'post' | 'page' | 'hackathon' | 'event' | 'opportunity';
    slug: string;
    enabled?: boolean;
}

export function useSEO({ type, slug, enabled = true }: UseSEOOptions) {
    useEffect(() => {
        if (!enabled || !slug) {
            resetMetaTags().catch(console.error);
            return;
        }

        let cancelled = false;

        const fetchSEO = async () => {
            try {
                let metadata: any;

                switch (type) {
                    case 'post':
                        metadata = await seoService.getPostSEO(slug);
                        break;
                    case 'page':
                        metadata = await seoService.getPageSEO(slug);
                        break;
                    case 'hackathon':
                        metadata = await seoService.getHackathonSEO(slug);
                        break;
                    case 'event':
                        metadata = await seoService.getEventSEO(slug);
                        break;
                    case 'opportunity':
                        metadata = await seoService.getOpportunitySEO(slug);
                        break;
                    default:
                        await resetMetaTags();
                        return;
                }

                if (cancelled) return;

                // Extract metadata from backend response
                const meta = metadata.meta || {};
                const openGraph = metadata.openGraph || {};
                const twitter = metadata.twitter || {};
                const jsonLd = metadata.jsonLd || {};

                // Update meta tags
                const baseUrl = window.location.origin;
                const seoMeta = {
                    title: meta.title || openGraph['og:title'] || 'DevCommunity',
                    description: meta.description || openGraph['og:description'] || '',
                    ogImage: openGraph['og:image'] || `${baseUrl}/devcommunity-new_LOG (1).png`,
                    ogType: openGraph['og:type'] || 'website',
                    ogUrl: openGraph['og:url'] || window.location.href,
                    jsonLd: jsonLd
                };

                updateMetaTags(seoMeta);

                // Update additional OpenGraph tags
                Object.entries(openGraph).forEach(([key, value]) => {
                    if (value) {
                        const selector = `meta[property="${key}"]`;
                        let element = document.querySelector(selector) as HTMLMetaElement;
                        if (!element) {
                            element = document.createElement('meta');
                            element.setAttribute('property', key);
                            document.head.appendChild(element);
                        }
                        element.setAttribute('content', String(value));
                    }
                });

                // Update Twitter Card tags
                Object.entries(twitter).forEach(([key, value]) => {
                    if (value) {
                        const selector = `meta[name="${key}"]`;
                        let element = document.querySelector(selector) as HTMLMetaElement;
                        if (!element) {
                            element = document.createElement('meta');
                            element.setAttribute('name', key);
                            document.head.appendChild(element);
                        }
                        element.setAttribute('content', String(value));
                    }
                });

                // Update canonical URL
                const canonicalUrl = openGraph['og:url'] || window.location.href;
                let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
                if (!canonical) {
                    canonical = document.createElement('link');
                    canonical.setAttribute('rel', 'canonical');
                    document.head.appendChild(canonical);
                }
                canonical.setAttribute('href', canonicalUrl);

                // Update JSON-LD structured data
                if (jsonLd && Object.keys(jsonLd).length > 0) {
                    let jsonLdScript = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement;
                    if (!jsonLdScript) {
                        jsonLdScript = document.createElement('script');
                        jsonLdScript.setAttribute('type', 'application/ld+json');
                        document.head.appendChild(jsonLdScript);
                    }
                    jsonLdScript.textContent = JSON.stringify(jsonLd);
                }

            } catch (error) {
                console.error('Failed to load SEO metadata:', error);
                if (!cancelled) {
                    await resetMetaTags();
                }
            }
        };

        fetchSEO();

        return () => {
            cancelled = true;
        };
    }, [type, slug, enabled]);
}

