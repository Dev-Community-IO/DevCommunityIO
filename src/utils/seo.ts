import { Post } from '../types'
import siteSettingsService from '../services/api/siteSettings.service'
import { getApiBaseUrl } from './apiUrl'

interface SEOMetaData {
    title: string
    description: string
    ogImage: string
    ogType: string
    ogUrl: string
    jsonLd: any
}

// Cache for SEO settings
let seoSettingsCache: Record<string, string | null> | null = null
let seoSettingsCacheTime = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

/**
 * Load SEO settings from API with caching
 */
async function loadSeoSettings(): Promise<Record<string, string | null>> {
    const now = Date.now()

    // Return cached settings if still valid
    if (seoSettingsCache && (now - seoSettingsCacheTime < CACHE_DURATION)) {
        return seoSettingsCache
    }

    try {
        const settings = await siteSettingsService.getSettings([
            'seo_site_name',
            'seo_default_title',
            'seo_default_description',
            'seo_default_keywords',
            'seo_og_image',
            'seo_twitter_card',
            'seo_logo_url',
            'site_name',
            'site_description',
        ])

        seoSettingsCache = settings
        seoSettingsCacheTime = now

        return settings
    } catch (error) {
        console.error('Failed to load SEO settings:', error)
        // Return defaults if API fails
        return {
            seo_site_name: 'DevCommunity',
            seo_default_title: 'DevCommunity - Where Developers Build the Future',
            seo_default_description: 'A developer community platform where developers share knowledge, build projects, and connect with peers.',
        }
    }
}

/**
 * Generate comprehensive SEO meta tags for a post
 */
export async function generatePostMeta(post: Post): Promise<SEOMetaData> {
    const baseUrl = window.location.origin
    const postUrl = `${baseUrl}/post/${post.slug}`
    const seoSettings = await loadSeoSettings()
    const siteName = seoSettings.seo_site_name || seoSettings.site_name || 'DevCommunity'
    const defaultOgImage = seoSettings.seo_og_image || seoSettings.seo_logo_url || `${baseUrl}/devcommunity-new_LOG (1).png`

    // Clean content for description (remove markdown, limit to 160 chars)
    const cleanDescription = (post as any).seoDescription || post.content
        .replace(/[#*`_~\[\]()]/g, '')
        .replace(/\n+/g, ' ')
        .trim()
        .substring(0, 160) + (post.content.length > 160 ? '...' : '')

    // Use cover image if available, otherwise use OG image from settings
    const imageUrl = post.coverImage || post.ogImageUrl || defaultOgImage

    // JSON-LD structured data for articles
    const jsonLd: any = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: (post as any).seoTitle || post.title,
        description: cleanDescription,
        image: imageUrl,
        author: post.author ? {
            '@type': 'Person',
            name: post.author.pseudo || post.author.username || 'Unknown',
            url: `${baseUrl}/profile/${post.author.username || post.author.pseudo || ''}`
        } : undefined,
        publisher: {
            '@type': 'Organization',
            name: siteName,
            logo: {
                '@type': 'ImageObject',
                url: seoSettings.seo_logo_url || defaultOgImage
            }
        },
        datePublished: post.publishedAt || post.createdAt,
        dateModified: post.updatedAt || post.publishedAt || post.createdAt,
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': postUrl
        }
    }

    // Add tags as keywords
    if (post.tags && post.tags.length > 0) {
        jsonLd['keywords'] = post.tags.map((tag: any) => {
            return typeof tag === 'string' ? tag : (tag.name || tag.slug)
        }).join(', ')
    } else if ((post as any).seoKeywords) {
        jsonLd['keywords'] = (post as any).seoKeywords
    }

    // Add interaction statistics
    if (post.upvotes || post.commentCount) {
        jsonLd['interactionStatistic'] = []

        if (post.upvotes) {
            jsonLd['interactionStatistic'].push({
                '@type': 'InteractionCounter',
                interactionType: 'https://schema.org/LikeAction',
                userInteractionCount: post.upvotes
            })
        }

        if (post.commentCount) {
            jsonLd['interactionStatistic'].push({
                '@type': 'InteractionCounter',
                interactionType: 'https://schema.org/CommentAction',
                userInteractionCount: post.commentCount
            })
        }
    }

    return {
        title: `${(post as any).seoTitle || post.title} | ${siteName}`,
        description: cleanDescription,
        ogImage: imageUrl,
        ogType: 'article',
        ogUrl: postUrl,
        jsonLd
    }
}

/**
 * Update document head with SEO meta tags
 */
export function updateMetaTags(meta: SEOMetaData): void {
    // Update title
    document.title = meta.title

    // Update or create meta tags
    const metaTags = [
        { name: 'description', content: meta.description },
        { property: 'og:title', content: meta.title },
        { property: 'og:description', content: meta.description },
        { property: 'og:image', content: meta.ogImage },
        { property: 'og:type', content: meta.ogType },
        { property: 'og:url', content: meta.ogUrl },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: meta.title },
        { name: 'twitter:description', content: meta.description },
        { name: 'twitter:image', content: meta.ogImage }
    ]

    metaTags.forEach(({ name, property, content }) => {
        const selector = name ? `meta[name="${name}"]` : `meta[property="${property}"]`
        let element = document.querySelector(selector)

        if (!element) {
            element = document.createElement('meta')
            if (name) element.setAttribute('name', name)
            if (property) element.setAttribute('property', property)
            document.head.appendChild(element)
        }

        element.setAttribute('content', content)
    })

    // Update or create JSON-LD script
    let jsonLdScript = document.querySelector('script[type="application/ld+json"]')

    if (!jsonLdScript) {
        jsonLdScript = document.createElement('script')
        jsonLdScript.setAttribute('type', 'application/ld+json')
        document.head.appendChild(jsonLdScript)
    }

    jsonLdScript.textContent = JSON.stringify(meta.jsonLd)
}

/**
 * Reset meta tags to defaults with site settings
 */
export async function resetMetaTags(): Promise<void> {
    const seoSettings = await loadSeoSettings()
    const siteName = seoSettings.seo_site_name || seoSettings.site_name || 'DevCommunity'
    const defaultTitle = seoSettings.seo_default_title || `${siteName} - Where Developers Build the Future`
    const defaultDescription = seoSettings.seo_default_description || seoSettings.site_description || 'Join DevCommunity to connect with developers, share knowledge, participate in hackathons, and grow your skills.'
    const defaultOgImage = seoSettings.seo_og_image || seoSettings.seo_logo_url || `${window.location.origin}/devcommunity-new_LOG (1).png`

    document.title = defaultTitle

    const defaultMeta: SEOMetaData = {
        title: defaultTitle,
        description: defaultDescription,
        ogImage: defaultOgImage,
        ogType: 'website',
        ogUrl: window.location.href,
        jsonLd: {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: siteName,
            url: window.location.origin,
            description: defaultDescription,
            ...(seoSettings.seo_logo_url ? {
                logo: {
                    '@type': 'ImageObject',
                    url: seoSettings.seo_logo_url
                }
            } : {})
        }
    }

    updateMetaTags(defaultMeta)
}

/**
 * Fetch SEO metadata from API for a specific content type
 */
export async function fetchSeoMetadata(type: 'post' | 'page' | 'hackathon' | 'event' | 'opportunity', slug: string): Promise<SEOMetaData | null> {
    try {
        const apiBase = getApiBaseUrl()
        // API routes: /api/seo/posts/:slug, /api/seo/pages/:slug, etc.
        const endpoint = type === 'post' ? 'posts' : type === 'page' ? 'pages' : `${type}s`
        const response = await fetch(`${apiBase}/seo/${endpoint}/${slug}`)

        if (!response.ok) {
            return null
        }

        const data = await response.json()

        // Convert API response to SEOMetaData format
        return {
            title: data.meta?.title || data.openGraph?.['og:title'] || '',
            description: data.meta?.description || data.openGraph?.['og:description'] || '',
            ogImage: data.openGraph?.['og:image'] || '',
            ogType: data.openGraph?.['og:type'] || 'website',
            ogUrl: data.openGraph?.['og:url'] || window.location.href,
            jsonLd: data.jsonLd || {}
        }
    } catch (error) {
        console.error(`Failed to fetch SEO metadata for ${type}:`, error)
        return null
    }
}

