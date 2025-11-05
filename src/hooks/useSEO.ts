import { useLocation } from 'react-router-dom';
import { useSeoMetadata } from './useSeoMetadata';

interface SEOProps {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: 'website' | 'article';
    author?: string;
    publishedTime?: string;
    modifiedTime?: string;
}

export function useSEO(props: SEOProps) {
    const location = useLocation();
    const { metadata, loading } = useSeoMetadata(location.pathname);

    // Handle nested API response structure (meta.openGraph, meta.twitter, etc.)
    const apiMeta = metadata?.meta || metadata;
    const apiOpenGraph = metadata?.openGraph || {};
    const apiTwitter = metadata?.twitter || {};

    // Use provided props or fallback to metadata from API
    const title = props.title || apiMeta?.title || apiOpenGraph['og:title'] || metadata?.title || 'DevCommunity';
    const description = props.description || apiMeta?.description || apiOpenGraph['og:description'] || metadata?.description || 'Where Developers Build the Future';
    const image = props.image || metadata?.image || apiOpenGraph['og:image'] || apiTwitter['twitter:image'] || undefined;
    const url = props.url || apiOpenGraph['og:url'] || metadata?.url || `${window.location.origin}${location.pathname}`;
    const type = props.type || apiOpenGraph['og:type'] || metadata?.type || 'website';
    const author = props.author || metadata?.author;
    const publishedTime = props.publishedTime || metadata?.publishedTime;
    const modifiedTime = props.modifiedTime || metadata?.modifiedTime;

    return {
        loading,
        metadata: {
            title,
            description,
            image,
            url,
            type,
            author,
            publishedTime,
            modifiedTime,
        },
    };
}
