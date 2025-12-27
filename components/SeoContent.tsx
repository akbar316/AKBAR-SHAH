import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SeoContentProps {
  title: string;
  description: string;
  canonicalUrl: string;
  keywords?: string;
}

const SeoContent: React.FC<SeoContentProps> = ({ title, description, canonicalUrl, keywords }) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content="website" />
      {/* You might want to pass an og:image prop as well */}
      {/* <meta property="og:image" content="https://dicetools.online/og-image.jpg" /> */}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {/* <meta name="twitter:image" content="https://dicetools.online/og-image.jpg" /> */}
    </Helmet>
  );
};

export default SeoContent;
