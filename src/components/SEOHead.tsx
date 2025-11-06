import { Helmet } from 'react-helmet-async';
import { useSEO } from '../hooks/useSEO';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

/**
 * Normalize image URL to absolute HTTPS URL
 */
function normalizeImageUrl(imageUrl: string | undefined): string | undefined {
  if (!imageUrl) return undefined;
  
  // If already absolute URL, ensure HTTPS
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl.replace('http://', 'https://');
  }
  
  // If relative URL, make it absolute
  if (imageUrl.startsWith('/')) {
    return `${window.location.origin}${imageUrl}`;
  }
  
  // If it's a CloudFront or S3 URL without protocol, add HTTPS
  if (imageUrl.includes('.cloudfront.net') || imageUrl.includes('.s3.') || imageUrl.includes('amazonaws.com')) {
    if (!imageUrl.startsWith('http')) {
      return `https://${imageUrl}`;
    }
    return imageUrl.replace('http://', 'https://');
  }
  
  // Default: assume it needs to be made absolute
  return `${window.location.origin}/${imageUrl.replace(/^\//, '')}`;
}

export function SEOHead(props: SEOHeadProps) {
  const { metadata } = useSEO(props);
  
  // Normalize image URL to ensure it's absolute and HTTPS
  const normalizedImage = normalizeImageUrl(metadata.image);

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{metadata.title}</title>
      <meta name="title" content={metadata.title} />
      <meta name="description" content={metadata.description} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={metadata.type} />
      <meta property="og:url" content={metadata.url} />
      <meta property="og:title" content={metadata.title} />
      <meta property="og:description" content={metadata.description} />
      {normalizedImage && (
        <>
          <meta property="og:image" content={normalizedImage} />
          <meta property="og:image:secure_url" content={normalizedImage} />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta property="og:image:type" content="image/jpeg" />
        </>
      )}
      <meta property="og:site_name" content="DevCommunity" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={metadata.url} />
      <meta name="twitter:title" content={metadata.title} />
      <meta name="twitter:description" content={metadata.description} />
      {normalizedImage && <meta name="twitter:image" content={normalizedImage} />}
      
      {/* Preload critical image for faster loading */}
      {normalizedImage && (
        <link rel="preload" as="image" href={normalizedImage} />
      )}

      {/* Article specific */}
      {metadata.type === 'article' && (
        <>
          {metadata.author && <meta property="article:author" content={metadata.author} />}
          {metadata.publishedTime && <meta property="article:published_time" content={metadata.publishedTime} />}
          {metadata.modifiedTime && <meta property="article:modified_time" content={metadata.modifiedTime} />}
        </>
      )}
    </Helmet>
  );
}

