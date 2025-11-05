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

export function SEOHead(props: SEOHeadProps) {
  const { metadata } = useSEO(props);

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
      {metadata.image && <meta property="og:image" content={metadata.image} />}
      <meta property="og:site_name" content="DevCommunity" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={metadata.url} />
      <meta name="twitter:title" content={metadata.title} />
      <meta name="twitter:description" content={metadata.description} />
      {metadata.image && <meta name="twitter:image" content={metadata.image} />}

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

