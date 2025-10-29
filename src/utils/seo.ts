import { Post } from '../types'

interface SEOMetaData {
    title: string
    description: string
    ogImage: string
    ogType: string
    ogUrl: string
    jsonLd: any
}

/**
 * Generate comprehensive SEO meta tags for a post
 */
export function generatePostMeta(post: Post): SEOMetaData {
    const baseUrl = window.location.origin
    const postUrl = `${baseUrl}/post/${post.slug}`

    // Clean content for description (remove markdown, limit to 160 chars)
    const cleanDescription = post.content
        .replace(/[#*`_~\[\]()]/g, '')
        .replace(/\n+/g, ' ')
        .trim()
        .substring(0, 160) + (post.content.length > 160 ? '...' : '')

    // Use cover image if available, otherwise use OG image
    const imageUrl = post.coverImage || post.ogImageUrl || `${baseUrl}/devcommunity-new_LOG (1).png`

    // JSON-LD structured data for articles
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description: cleanDescription,
        image: imageUrl,
        author: {
            '@type': 'Person',
            name: post.author.pseudo || post.author.username,
            url: `${baseUrl}/profile/${post.author.username}`
        },
        publisher: {
            '@type': 'Organization',
            name: 'DevCommunity',
            logo: {
                '@type': 'ImageObject',
                url: `${baseUrl}/devcommunity-new_LOG (1).png`
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
        jsonLd['keywords'] = post.tags.map(tag => {
            return typeof tag === 'string' ? tag : (tag.name || tag.slug)
        }).join(', ')
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
        title: `${post.title} | DevCommunity`,
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
 * Reset meta tags to defaults
 */
export function resetMetaTags(): void {
    document.title = 'DevCommunity - A community for developers'

    const defaultMeta: SEOMetaData = {
        title: 'DevCommunity - A community for developers',
        description: 'Join DevCommunity to connect with developers, share knowledge, participate in hackathons, and grow your skills.',
        ogImage: `${window.location.origin}/devcommunity-new_LOG (1).png`,
        ogType: 'website',
        ogUrl: window.location.href,
        jsonLd: {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'DevCommunity',
            url: window.location.origin,
            description: 'A community platform for developers to connect, share, and learn together.'
        }
    }

    updateMetaTags(defaultMeta)
}

